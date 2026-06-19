const Program = require("../models/program.model");
const Session = require("../models/session.model");
const { getMediaPublicUrl, deleteS3Object } = require("../utils/s3");
const csv = require("fast-csv");
const sequelize = require("../utils/database");
const { logAction } = require("../utils/audit");

exports.createSession = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { programId } = req.params;
    const { title, instructorName, tags } = req.body;

    const program = await Program.findOne({
      where: {
        id: programId,
        creatorId: tenantId,
      },
    });
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const sessionCount = await Session.count({
      where: { programId },
    });
    const nextPosition = sessionCount + 1;

    const session = await Session.create({
      title,
      position: nextPosition,
      instructorName,
      tags,
      programId,
    });

    await logAction(tenantId, "CREATE", "Session", session.id);

    return res.status(201).json({
      success: true,
      message: "Session created successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getSessionDetails = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const session = await Session.findOne({
      where: { id },
      include: [
        {
          model: Program,
          where: {
            creatorId: tenantId,
          },
          attributes: [],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const session = await Session.findOne({
      where: { id },
      include: [
        {
          model: Program,
          where: { creatorId: tenantId },
          attributes: [],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const payload = { ...req.body };
    const oldS3Key = session.s3Key;

    if (payload.s3Key) {
      payload.mediaFileUrl = getMediaPublicUrl(payload.s3Key);
    }

    await session.update(payload);

    // delete old file AFTER successful DB update
    if (payload.s3Key && oldS3Key && oldS3Key !== payload.s3Key) {
      try {
        await deleteS3Object(oldS3Key);
      } catch (err) {
        console.error("Failed to delete old S3 object:", err);
      }
    }

    await logAction(tenantId, "UPDATE", "Session", session.id);

    return res.status(200).json({
      success: true,
      message: "Session updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const session = await Session.findOne({
      where: { id },
      include: [
        {
          model: Program,
          where: { creatorId: tenantId },
          attributes: [],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.s3Key) {
      await deleteS3Object(session.s3Key);
    }

    const deletedSession = await session.destroy();
    await logAction(tenantId, "DELETE", "Session", deletedSession.id);

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.bulkImportSessions = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const tenantId = req.tenantId;
    const { programId } = req.params;
    const { bulkImportId } = req.body; // Global token for tracking this specific request batch

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No CSV file uploaded." });
    }

    // 1. Verify program access
    const program = await Program.findOne({
      where: { id: programId, creatorId: tenantId },
    });
    if (!program) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }

    // 2. Query structural baseline details for generating positions
    let currentSessionCount = await Session.count({
      where: { programId },
      transaction,
    });

    const parsedRows = [];
    const results = {
      successCount: 0,
      errorCount: 0,
      summary: [],
    };

    // 3. Parse CSV data from buffer memory stream
    await new Promise((resolve, reject) => {
      csv
        .parseString(req.file.buffer.toString(), { headers: true, trim: true })
        .on("data", (row) => parsedRows.push(row))
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    // 4. Process each row sequentially to handle accurate positions and row reports
    for (let index = 0; index < parsedRows.length; index++) {
      const row = parsedRows[index];
      const rowNumber = index + 1;

      const title = row.title || row.Title;
      const instructorName = row.instructorName || row.InstructorName;
      const rawTags = row.tags || row.Tags;
      const clientRefId = row.clientRefId || row.ClientRefId || null; // Unique per-row hash generated by client

      // --- Row Validation Logic ---
      const validationErrors = [];
      if (!title) validationErrors.push("Title is required");
      if (!instructorName) validationErrors.push("Instructor name is required");

      if (validationErrors.length > 0) {
        results.errorCount++;
        results.summary.push({
          row: rowNumber,
          status: "failed",
          errors: validationErrors,
          data: row,
        });
        continue;
      }

      // Format clean tags array from comma-separated string value
      const tags = rawTags
        ? rawTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      // --- Idempotency Check ---
      if (clientRefId) {
        const existingSession = await Session.findOne({
          where: { programId, clientRefId },
          transaction,
        });

        if (existingSession) {
          // Row was already processed previously. Skip gracefully to avoid duplicates.
          results.successCount++;
          results.summary.push({
            row: rowNumber,
            status: "skipped (already imported)",
            sessionId: existingSession.id,
          });
          continue;
        }
      }

      // --- Create Session Record ---
      currentSessionCount++; // Increment the sequential order accurately

      const newSession = await Session.create(
        {
          title,
          instructorName,
          tags,
          position: currentSessionCount,
          programId,
          clientRefId, // Saved to guarantee future retry idempotency
        },
        { transaction },
      );

      results.successCount++;
      results.summary.push({
        row: rowNumber,
        status: "success",
        sessionId: newSession.id,
      });
    }

    // Commit all successful modifications
    await transaction.commit();

    await logAction(tenantId, "BULK_CREATE", "Program", programId);

    return res.status(200).json({
      success: true,
      message: `Bulk processing completed. Success: ${results.successCount}, Failed: ${results.errorCount}`,
      meta: {
        totalRowsProcessed: parsedRows.length,
        successCount: results.successCount,
        errorCount: results.errorCount,
      },
      report: results.summary,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Bulk Import Exception Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred during bulk processing loop.",
    });
  }
};

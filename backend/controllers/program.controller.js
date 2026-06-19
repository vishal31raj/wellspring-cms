const { fn, col } = require("sequelize");
const Program = require("../models/program.model");
const Session = require("../models/session.model");
const sequelize = require("../utils/database");
const { deleteMultipleS3Objects } = require("../utils/s3");
const { logAction } = require("../utils/audit");

exports.createProgram = async (req, res) => {
  try {
    const { title } = req.body;
    const creatorId = req.tenantId;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const program = await Program.create({
      title: title.trim(),
      creatorId,
    });

    await logAction(creatorId, "CREATE", "Program", program.id);

    return res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: program,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllPrograms = async (req, res) => {
  try {
    const creatorId = req.tenantId;

    const programs = await Program.findAll({
      where: { creatorId },
      attributes: [
        "id",
        "title",
        "createdAt",
        [fn("COUNT", col("sessions.id")), "sessionsCount"],
      ],
      include: [
        {
          model: Session,
          attributes: [],
        },
      ],
      group: ["program.id"],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: programs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getProgramDetails = async (req, res) => {
  try {
    const creatorId = req.tenantId;
    const { id } = req.params;

    const program = await Program.findOne({
      where: {
        id,
        creatorId,
      },
      include: [
        {
          model: Session,
          as: "sessions",
        },
      ],
      order: [[{ model: Session, as: "sessions" }, "position", "ASC"]],
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const creatorId = req.tenantId;
    const { id } = req.params;
    const { title } = req.body;

    const program = await Program.findOne({
      where: {
        id,
        creatorId,
      },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    if (title !== undefined) {
      program.title = title.trim();
    }

    await program.save();

    await logAction(creatorId, "UPDATE", "Program", program.id);

    return res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const creatorId = req.tenantId;
    const { id } = req.params;

    const program = await Program.findOne({
      where: {
        id,
        creatorId,
      },
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const sessions = await Session.findAll({
      where: { programId: id },
      attributes: ["id", "s3Key"],
    });

    const keys = sessions.map((session) => session.s3Key).filter(Boolean);

    if (keys.length) {
      await deleteMultipleS3Objects(keys);
    }

    const programIdToDelete = program.id;
    await program.destroy();
    await logAction(creatorId, "DELETE", "Program", programIdToDelete);

    return res.status(200).json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.reorderSessions = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const creatorId = req.tenantId;
    const { programId } = req.params;
    const updates = req.body;

    // 1. Validate program ownership
    const program = await Program.findOne({
      where: {
        id: programId,
        creatorId,
      },
      transaction,
    });

    if (!program) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // 2. Validate all sessionIds belong to this program
    const sessionIds = updates.map((item) => item.sessionId);

    const sessions = await Session.findAll({
      where: {
        id: sessionIds,
        programId,
      },
      transaction,
    });

    if (sessions.length !== updates.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "One or more sessions do not belong to this program",
      });
    }

    // 3. Validate positions are unique & sequential
    const positions = updates.map((x) => x.newPosition).sort((a, b) => a - b);

    for (let i = 0; i < positions.length; i++) {
      if (positions[i] !== i + 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Positions must be sequential starting from 1",
        });
      }
    }

    // 4. Temporary positions to avoid collisions
    for (const item of updates) {
      await Session.update(
        {
          position: item.newPosition + 1000,
        },
        {
          where: {
            id: item.sessionId,
            programId,
          },
          transaction,
        },
      );
    }

    // 5. Final positions
    for (const item of updates) {
      await Session.update(
        {
          position: item.newPosition,
        },
        {
          where: {
            id: item.sessionId,
            programId,
          },
          transaction,
        },
      );
    }

    await transaction.commit();

    await logAction(creatorId, "REORDER", "Sessions", program.id);

    return res.status(200).json({
      success: true,
      message: "Sessions reordered successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

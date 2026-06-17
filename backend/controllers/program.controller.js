const { fn, col } = require("sequelize");
const Program = require("../models/program.model");
const Session = require("../models/session.model");

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
          order: [["position", "ASC"]],
        },
      ],
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

    await program.destroy();

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
    const tenantId = req.tenantId;
    const { programId } = req.params;
    const { sessions } = req.body;

    // Step 1: Verify program ownership
    const program = await Program.findOne({
      where: {
        id: programId,
        creatorId: tenantId,
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

    // Step 2: Validate sequential positions
    const positions = sessions.map((s) => s.position).sort((a, b) => a - b);

    for (let i = 0; i < positions.length; i++) {
      if (positions[i] !== i + 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Positions must be sequential starting from 1",
        });
      }
    }

    // Step 3: Validate session ownership
    const sessionIds = sessions.map((s) => s.id);

    const dbSessions = await Session.findAll({
      where: {
        id: sessionIds,
        programId,
      },
      transaction,
    });

    if (dbSessions.length !== sessions.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "One or more sessions do not belong to this program",
      });
    }

    // Step 4: Update positions
    for (const session of sessions) {
      await Session.update(
        {
          position: session.position,
        },
        {
          where: {
            id: session.id,
            programId,
          },
          transaction,
        },
      );
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Sessions reordered successfully",
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

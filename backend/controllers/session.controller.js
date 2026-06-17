const Program = require("../models/program.model");
const Session = require("../models/session.model");

exports.createSession = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { programId } = req.params;

    const {
      title,
      duration,
      position,
      instructorName,
      tags,
      mediaFileUrl,
      type,
    } = req.body;

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

    const session = await Session.create({
      title,
      duration,
      position,
      instructorName,
      tags,
      mediaFileUrl,
      type,
      programId,
    });

    return res.status(201).json({
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

    await session.update(req.body);

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

    await session.destroy();

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

const Program = require("../models/program.model");

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

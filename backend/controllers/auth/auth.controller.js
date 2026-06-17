const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config({ quiet: true });

const Creator = require("../../models/creator.model");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingCreator = await Creator.findOne({
      where: { email },
    });

    if (existingCreator) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const creator = await Creator.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      creatorId: creator.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const creator = await Creator.findOne({
      where: { email },
    });

    if (!creator) {
      return res.status(404).json({
        message: "Creator not found!",
      });
    }

    const isMatch = await bcrypt.compare(password, creator.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password!",
      });
    }

    const token = jwt.sign(
      {
        creatorId: creator.id,
        email: creator.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const creator = await Creator.findOne({
      where: { id: req.creator.id },
    });

    if (!creator) {
      return res.status(404).json({
        message: "Creator not found!",
      });
    }

    res.status(200).json({
      message: "Fetched profile details.",
      data: creator,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const creator = await await Creator.findOne({
      where: { id: req.creator.id },
    });
    if (!creator) {
      return res.status(404).json({
        message: "Creator not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, creator.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password incorrect",
      });
    }

    const samePassword = await bcrypt.compare(newPassword, creator.password);
    if (samePassword) {
      return res.status(400).json({
        message: "New password cannot be same as old password",
      });
    }

    creator.password = await bcrypt.hash(newPassword, 12);

    await creator.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

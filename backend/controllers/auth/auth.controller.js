const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

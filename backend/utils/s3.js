const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require("dotenv").config({ quiet: true });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const EXPIRES_IN = 60; // seconds

exports.generateUploadUrl = async (req, res) => {
  const Session = require("../models/session.model");
  const Program = require("../models/program.model");

  try {
    const { fileName, fileSize, contentType } = req.body;
    const { programId, sessionId } = req.params;
    const creatorId = req.creator.id;

    const session = await Session.findOne({
      where: {
        id: sessionId,
        programId: programId,
      },
      include: [
        {
          model: Program,
          as: "program",
          where: {
            creatorId,
          },
          attributes: [],
        },
      ],
    });
    if (!session) {
      return res.status(403).json({
        message: "Unauthorized session!",
      });
    }

    const allowedTypes = ["video/mp4", "audio/mpeg", "audio/wav"];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({
        message: "Invalid file type",
      });
    }

    if (fileSize > 500 * 1024 * 1024) {
      return res.status(400).json({
        message: "File too large",
      });
    }

    const key = `sessions/creator-${creatorId}/program-${programId}/session-${sessionId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      message: `Upload url created. Valid for ${EXPIRES_IN} seconds!`,
      data: {
        uploadUrl: uploadUrl,
        key: key,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to generate URL" });
  }
};

exports.deleteS3Object = async (key) => {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  await s3.send(command);
};

exports.deleteMultipleS3Objects = async (keys = []) => {
  if (!keys.length) return;

  const command = new DeleteObjectsCommand({
    Bucket: process.env.S3_BUCKET,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  });

  await s3.send(command);
};

exports.getMediaPublicUrl = (key) => {
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

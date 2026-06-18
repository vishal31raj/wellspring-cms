const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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
  try {
    const { fileName, contentType } = req.body;

    const key = `sessions/${Date.now()}-${fileName}`;

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
    res.status(500).json({ message: "Failed to generate URL" });
  }
};

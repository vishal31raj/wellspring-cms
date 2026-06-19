"use client";

import { editSession, generateUploadUrl } from "@/services/sessions.api";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaUpload } from "react-icons/fa";

export default function FileUpload({
  session,
  width,
  height,
  btnTitle = "Upload",
  onFileUpload,
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadData, setUploadData] = useState({
    duration: "",
    type: "video",
  });

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isValidType =
      file.type.startsWith("video/") || file.type.startsWith("audio/");

    if (!isValidType) {
      toast.error("Invalid file type");
      return;
    }

    setSelectedFile(file);
  };

  const handleChange = (e) => {
    setUploadData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      const signedData = await generateSignedUrl();

      await uploadFileToS3(selectedFile, signedData.uploadUrl);

      await updateSessionDetails(signedData.key, signedData.publicUrl);

      toast.success("Upload completed!");
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Upload failed");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadData({
      duration: "",
      type: "video",
    });
    setShowModal(false);
    onFileUpload();
  };

  const updateSessionDetails = async (key, publicUrl) => {
    await editSession(session.id, {
      ...session,
      duration: uploadData.duration,
      type: uploadData.type,
      mediaFileUrl: publicUrl,
      s3Key: key,
    });

    toast.success("Session updated");
  };

  const uploadFileToS3 = async (file, uploadUrl) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    if (!response.ok) {
      throw new Error("S3 upload failed");
    }

    toast.success("Uploaded to cloud");
  };

  const generateSignedUrl = async () => {
    const result = await generateUploadUrl(
      {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        contentType: selectedFile.type,
      },
      session.programId,
      session.id,
    );

    toast.success("Signed URL generated");

    return result.data;
  };

  return (
    <div
      style={{ width, height }}
      className="flex items-center justify-center rounded-md border-1 border-dashed border-blue-600"
    >
      <button
        onClick={handleButtonClick}
        className="px-3 rounded-md bg-blue-600 py-2 text-white text-sm hover:bg-blue-700 flex items-center gap-2"
      >
        <FaUpload /> {btnTitle}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Upload Media</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Select File
                </label>

                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileChange}
                  className="w-full rounded-md border p-2"
                />

                {selectedFile && (
                  <p className="mt-2 text-sm text-zinc-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Duration
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  value={uploadData.duration}
                  onChange={handleChange}
                  placeholder="Duration in seconds"
                  className="w-full rounded-md border p-2"
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={uploadData.type}
                  onChange={handleChange}
                  className="w-full rounded-md border p-2"
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

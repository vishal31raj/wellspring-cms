"use client";

import FileUpload from "@/components/file-upload";
import ManageSession from "@/components/manage-session";
import VideoThumbnail from "@/components/video-thumbnail";
import { formatDateTime } from "@/helpers/datetime-formatter";
import {
  deleteSession,
  editSession,
  getSessionDetails,
} from "@/services/sessions.api";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SessionDetailsPage({ params }) {
  const { sessionSlug } = use(params);
  const router = useRouter();

  const [sessionDetails, setSessionDetails] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    position: "",
    instructorName: "",
    tags: "",
  });

  const handleEditMedia = () => {
    setSessionDetails((prev) => ({ ...prev, mediaFileUrl: null }));
  };

  const handleOpenEditSessionModal = () => {
    setSessionData({
      title: sessionDetails.title || "",
      position: sessionDetails.position || "",
      instructorName: sessionDetails.instructorName || "",
      tags: Array.isArray(sessionDetails.tags)
        ? sessionDetails.tags.join(", ")
        : sessionDetails.tags || "",
    });
    setShowSessionModal(true);
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: sessionData.title,
      position: Number(sessionData.position),
      instructorName: sessionData.instructorName,
      tags: sessionData.tags
        ? sessionData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const result = await editSession(sessionDetails.id, payload);
      toast.success(result.message);
      setShowSessionModal(false);
      await fetchSessionDetails();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteSessionHandler = async () => {
    try {
      const result = await deleteSession(sessionDetails.id);
      toast.success(result.message);
      router.back();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchSessionDetails = async () => {
    try {
      const result = await getSessionDetails(sessionSlug);
      setSessionDetails(result.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionSlug]);

  return (
    <main className="py-5 px-16">
      {sessionDetails && (
        <>
          <div className="flex flex-row items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">{sessionDetails.title}</h1>
            <div className="flex flex-row items-center gap-3 whitespace-nowrap">
              <button
                onClick={handleOpenEditSessionModal}
                className="px-3 rounded-md bg-blue-600 py-2 text-white text-sm hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={deleteSessionHandler}
                className="px-3 rounded-md bg-red-600 py-2 text-white text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-center">
            <div className="rounded-md border border-zinc-300 p-6">
              <div className="mb-6">
                {sessionDetails.mediaFileUrl ? (
                  <VideoThumbnail
                    url={sessionDetails.mediaFileUrl}
                    duration={sessionDetails.duration}
                    type={sessionDetails.type}
                    width="300px"
                    height="200px"
                    showEdit={true}
                    onEditMedia={handleEditMedia}
                  />
                ) : (
                  <FileUpload
                    session={sessionDetails}
                    width="300px"
                    height="200px"
                    onFileUpload={() => fetchSessionDetails()}
                  />
                )}
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-800">
                  {sessionDetails.title}
                </p>
                <p className="text-sm text-zinc-500 mb-3">
                  Position: {sessionDetails.position}
                </p>

                <p className="text-sm">{sessionDetails.instructorName}</p>
                <p className="text-sm text-zinc-500 mb-3">
                  {formatDateTime(sessionDetails.updatedAt)}
                </p>

                <p className="text-sm text-zinc-500">
                  {sessionDetails.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 rounded-lg bg-zinc-400 py-1 text-white text-sm mr-2"
                    >
                      #{tag}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {showSessionModal && (
        <ManageSession
          sessionData={sessionData}
          editMode={true}
          handleSessionInputChange={(e) =>
            setSessionData((prev) => ({
              ...prev,
              [e.target.name]: e.target.value,
            }))
          }
          handleSessionSubmit={handleSessionSubmit}
          onClose={() => setShowSessionModal(false)}
        />
      )}
    </main>
  );
}

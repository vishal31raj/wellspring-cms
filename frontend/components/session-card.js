"use client";

import { formatDateTime } from "@/helpers/datetime-formatter";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import VideoThumbnail from "./video-thumbnail";
import { FaEdit, FaRegTrashAlt, FaGripVertical } from "react-icons/fa";
import { deleteSession, editSession } from "@/services/sessions.api";
import toast from "react-hot-toast";
import ManageSession from "./manage-session";
import { useState } from "react";

export default function SessionCard({ session, updateSessionEvent }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    duration: "",
    position: "",
    instructorName: "",
    tags: "",
    mediaFileUrl: "",
    type: "video",
  });

  const handleOpenEditSessionModal = () => {
    setSessionData({
      title: session.title || "",
      duration: session.duration || "",
      position: session.position || "",
      instructorName: session.instructorName || "",
      tags: Array.isArray(session.tags)
        ? session.tags.join(", ")
        : session.tags || "",
      mediaFileUrl: session.mediaFileUrl || "",
      type: session.type || "video",
    });
    setShowSessionModal(true);
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: sessionData.title,
      duration: Number(sessionData.duration),
      position: Number(sessionData.position),
      instructorName: sessionData.instructorName,
      tags: sessionData.tags
        ? sessionData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      mediaFileUrl: sessionData.mediaFileUrl,
      type: sessionData.type,
    };

    try {
      const result = await editSession(session.id, payload);
      toast.success(result.message);
      setShowSessionModal(false);
      updateSessionEvent();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteSessionHandler = async () => {
    try {
      const result = await deleteSession(session.id);
      toast.success(result.message);
      updateSessionEvent();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="mb-3 rounded-lg border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-row gap-3">
        <div
          className="flex flex-col items-center text-zinc-500 justify-center cursor-grab"
          {...listeners}
        >
          <FaGripVertical />
        </div>
        <VideoThumbnail
          url={session.mediaFileUrl}
          duration={session.duration}
        />
        <div className="flex flex-row items-center w-full justify-between">
          <div>
            <p className="mb text-base font-semibold text-zinc-800">
              {session.position}. {session.title}
            </p>

            <p className="text-sm mb-3">
              {session.instructorName}
              <span className="text-zinc-500">
                {" • "} {formatDateTime(session.updatedAt)}
              </span>
            </p>

            <p className="text-sm text-zinc-500">
              {session.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 rounded-lg bg-zinc-400 py-1 text-white text-sm mr-2"
                >
                  #{tag}
                </span>
              ))}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleOpenEditSessionModal}
              className="px-3 rounded-md bg-white border border-blue-600 py-2 text-blue-600 text-sm hover:bg-blue-200"
            >
              <FaEdit />
            </button>
            <button
              onClick={deleteSessionHandler}
              className="px-3 rounded-md bg-white border border-red-600 py-2 text-red-600 text-sm hover:bg-red-200"
            >
              <FaRegTrashAlt />
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
}

"use client";

import SessionCard from "@/components/session-card";
import {
  deleteProgram,
  editProgram,
  getProgram,
  reorderSessions,
} from "@/services/programs.api";
import { createSession } from "@/services/sessions.api";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import ManageSession from "@/components/manage-session";
import { FaUpload } from "react-icons/fa";
import BulkUploadModal from "@/components/bulk-upload-sessions";

export default function ProgramDetailsPage({ params }) {
  const router = useRouter();
  const { slug } = use(params);

  const [programDetails, setProgramDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [sessions, setSessions] = useState([]);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: "",
    // position: "",
    instructorName: "",
    tags: "", // This will take user text (e.g., "sleep, beginner") and transform to array on submit
  });

  const fetchProgramDetails = async () => {
    try {
      const result = await getProgram(slug);
      setProgramDetails(result.data);
      setSessions(result.data.sessions);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchProgramDetails();
  }, [slug]);

  const handleOpenEditModal = () => {
    setEditTitle(programDetails?.title);
    setShowEditModal(true);
  };

  // Submit the updated title
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Passes the id/slug along with the new payload body
      const result = await editProgram(slug, { title: editTitle });

      toast.success(result.message);
      setShowEditModal(false);

      // Refresh details on screen immediately without reloading the page
      await fetchProgramDetails();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteModal = async () => {
    try {
      const result = await deleteProgram(slug);
      toast.success(result.message);
      router.back();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSessionInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit Handler for New Session Creation
  const handleSessionSubmit = async (e) => {
    e.preventDefault();

    // if (Number(sessionData.position) !== sessions.length + 1) {
    //   toast.error(`Position should be ${sessions.length + 1}`);
    //   return;
    // }

    try {
      // Formats data payloads into corresponding requested schema types
      const payload = {
        title: sessionData.title,
        // position: Number(sessionData.position), // Ensures Integer conversion
        instructorName: sessionData.instructorName,
        // Splits text string inputs by comma and strips white spaces cleanly
        tags: sessionData.tags
          ? sessionData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      const result = await createSession(slug, payload);
      toast.success(result.message || "Session created successfully!");

      setSessionData({
        title: "",
        // position: "",
        instructorName: "",
        tags: "",
      });
      setShowCreateSessionModal(false);
      await fetchProgramDetails();
    } catch (error) {
      toast.error(error.message || "Failed to create session");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sessions.findIndex((i) => i.id === active.id);
    const newIndex = sessions.findIndex((i) => i.id === over.id);

    const updated = arrayMove(sessions, oldIndex, newIndex);

    // Update UI immediately (optimistic update)
    setSessions(updated);

    const reorderedPayload = updated.map((session, index) => ({
      sessionId: session.id,
      newPosition: index + 1,
    }));

    try {
      const result = await reorderSessions(programDetails.id, reorderedPayload);
      toast.success(result.message);
      await fetchProgramDetails();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="py-5 px-16">
      {programDetails && (
        <div className="flex flex-row items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{programDetails.title}</h1>
          <div className="flex flex-row items-center gap-3 whitespace-nowrap">
            <button
              onClick={handleOpenEditModal}
              className="px-3 rounded-md bg-blue-600 py-2 text-white text-sm hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteModal}
              className="px-3 rounded-md bg-red-600 py-2 text-white text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {programDetails && (
        <div className="mb-6">
          <p className="text-md mb-3">Sessions:</p>
          {sessions.length ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sessions.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      programId={programDetails.id}
                      session={session}
                      updateSessionEvent={async () =>
                        await fetchProgramDetails()
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center">
              <p className="text-sm text-zinc-500 mb-3">No sessions yet!</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-3 my-3">
            <button
              onClick={() => setShowCreateSessionModal(true)}
              className="px-3 rounded-md border-1 border-dashed border-blue-600 bg-transparent py-2 text-blue-600 text-sm hover:bg-blue-50 transition-colors"
            >
              + Create new session
            </button>
            <BulkUploadModal
              programId={programDetails.id} // Or dynamically from sessionDetails.programId
              onUploadSuccess={() => fetchProgramDetails()}
            />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Program</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-xl font-bold hover:cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  placeholder="Enter new program title"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Action Buttons inside Form */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:bg-blue-400 hover:cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateSessionModal && (
        <ManageSession
          sessionData={sessionData}
          handleSessionInputChange={handleSessionInputChange}
          handleSessionSubmit={handleSessionSubmit}
          onClose={() => setShowCreateSessionModal(false)}
          editMode={false}
        />
      )}
    </main>
  );
}

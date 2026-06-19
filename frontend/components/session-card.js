"use client";

import { formatDateTime } from "@/helpers/datetime-formatter";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import VideoThumbnail from "./video-thumbnail";
import { FaAngleRight, FaGripVertical } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function SessionCard({ programId, session }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
          type={session.type}
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

            {session.tags && (
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
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                router.push(`/program/${programId}/sessions/${session.id}`)
              }
              className="px-3 rounded-md bg-white border border-zinc-500 py-2 text-zinc-500 text-sm hover:bg-zinc-200"
            >
              <FaAngleRight />
            </button>
            {/* <button
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
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

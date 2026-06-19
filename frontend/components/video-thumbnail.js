import { formatSecondsToTime } from "@/helpers/datetime-formatter";
import {
  FaFileAudio,
  FaFileVideo,
  FaExclamationTriangle,
  FaEdit,
} from "react-icons/fa";

export default function VideoThumbnail({
  url,
  duration,
  type = "video",
  width = "150px",
  height = "100px",
  showEdit = false,
  onEditMedia
}) {
  return (
    <div
      style={{ width, height }}
      className={`relative flex items-center justify-center rounded-lg border border-zinc-200 p-2 ${url ? "bg-zinc-100" : "bg-red-100"}`}
    >
      {url ? (
        <>
          {type === "video" && (
            <FaFileVideo className="h-6 w-6 cursor-pointer" />
          )}
          {type === "audio" && (
            <FaFileAudio className="h-6 w-6 cursor-pointer" />
          )}
        </>
      ) : (
        <FaExclamationTriangle className="h-6 w-6 cursor-pointer" />
      )}

      {url && (
        <>
          {showEdit && (
            <button onClick={onEditMedia} className="absolute bottom-1 left-1 rounded-md bg-white p-2 text-sm text-blue-600 hover:bg-blue-200">
              <FaEdit />
            </button>
          )}
          <div className="absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-xs text-zinc-500">
            {formatSecondsToTime(duration)}
          </div>
        </>
      )}
    </div>
  );
}

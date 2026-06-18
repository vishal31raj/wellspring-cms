import { formatSecondsToTime } from "@/helpers/datetime-formatter";
import { FaRegPlayCircle } from "react-icons/fa";

export default function VideoThumbnail({ url, duration }) {
  return (
    <div className="relative flex w-[150px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 p-2">
      <FaRegPlayCircle className="h-6 w-6 cursor-pointer" />

      <div className="absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-xs text-zinc-500">
        {formatSecondsToTime(duration)}
      </div>
    </div>
  );
}

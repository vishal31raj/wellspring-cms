import { useRouter } from "next/navigation";

export default function ProgramCard({ program }) {
  const router = useRouter();

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      onClick={() => router.push(`/program/${program.id}`)}
      className="p-4 border border-zinc-200 rounded-lg bg-white hover:shadow-md hover:cursor-pointer transition-shadow"
    >
      <p className="font-semibold text-zinc-800 text-base mb-2">
        {program.title}
      </p>
      <div className="flex flex-row items-center justify-between">
        <p className="text-sm">{program.sessionsCount} sessions</p>
        <p className="text-sm text-zinc-500">
          {formatDateTime(program.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function SessionCard({ session }) {
  return (
    <div className="p-4 mb-3 border border-zinc-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <p className="font-semibold text-zinc-800 text-base mb-2">
        {session.title}
      </p>
      <p className="text-sm">{session.instructorName}</p>
      <p className="text-sm text-zinc-500">
        {session.tags.map((tag) => (
          <span>{tag},</span>
        ))}
      </p>
    </div>
  );
}

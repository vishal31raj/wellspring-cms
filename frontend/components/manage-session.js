export default function ManageSession({
  sessionData,
  handleSessionInputChange,
  handleSessionSubmit,
  onClose,
  editMode,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg my-auto">
        {/* Modal Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold text-zinc-800">
            {editMode ? "Edit Session" : "Create New Session"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-semibold hover:cursor-pointer p-1 text-zinc-400 hover:text-zinc-600"
          >
            ×
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSessionSubmit} className="space-y-3">
          <div>
            <label className="mb-0.5 block text-xs font-medium text-zinc-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={sessionData.title}
              onChange={handleSessionInputChange}
              required
              placeholder="eg: How to fix your sleep schedule"
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-0.5 block text-xs font-medium text-zinc-700">
                Duration (in seconds)
              </label>
              <input
                type="number"
                name="duration"
                value={sessionData.duration}
                onChange={handleSessionInputChange}
                required
                min="1"
                placeholder="1500"
                className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-medium text-zinc-700">
                Position Index
              </label>
              <input
                type="number"
                name="position"
                value={sessionData.position}
                disabled={editMode}
                onChange={handleSessionInputChange}
                required
                min="1"
                placeholder="2"
                className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600 disabled:bg-zinc-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-0.5 block text-xs font-medium text-zinc-700">
              Instructor Name
            </label>
            <input
              type="text"
              name="instructorName"
              value={sessionData.instructorName}
              onChange={handleSessionInputChange}
              required
              placeholder="eg: Sarah Johnson"
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-0.5 block text-xs font-medium text-zinc-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={sessionData.tags}
              onChange={handleSessionInputChange}
              placeholder="sleep, beginner, morning"
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-0.5 block text-xs font-medium text-zinc-700">
              Media File URL
            </label>
            <input
              type="url"
              name="mediaFileUrl"
              value={sessionData.mediaFileUrl}
              onChange={handleSessionInputChange}
              required
              placeholder="https://example.com/video.mp4"
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-0.5 block text-xs font-medium text-zinc-700">
              Media Type
            </label>
            <select
              name="type"
              value={sessionData.type}
              onChange={handleSessionInputChange}
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t mt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:bg-blue-400 hover:cursor-pointer font-medium"
            >
              {editMode ? "Save Changes" : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

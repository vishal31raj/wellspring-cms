"use client";

import toast from "react-hot-toast";

import { changePassword, getProfile } from "@/services/auth.api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram, getPrograms } from "@/services/programs.api";
import ProgramCard from "@/components/program-card";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showCreateProgramModal, setShowCreateProgramModal] = useState(false);
  const [programTitle, setProgramTitle] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [profileResult, programsResult] = await Promise.all([
        getProfile(),
        getPrograms(),
      ]);

      setProfile(profileResult.data);
      setPrograms(programsResult.data);

      console.log("Profile:", profileResult);
      console.log("Programs:", programsResult);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("c_id");
    localStorage.removeItem("token");
    router.push("/");
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await changePassword(passwordData);

      toast.success(result.message);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
      setShowPasswordModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await createProgram({ title: programTitle });

      toast.success(result.message);
      setProgramTitle("");
      setShowCreateProgramModal(false);
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="p-5">
      {profile && (
        <div className="flex flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Welcome {profile.name}!</h1>
          <div className="flex flex-row items-center gap-3 whitespace-nowrap">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 rounded-md bg-blue-600 py-2 text-white text-sm hover:bg-blue-700"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-sm text-blue-600 hover:underline hover:cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {programs && (
        <div className="mb-6">
          <p className="text-md mb-3">Your programs:</p>
          {programs.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
              <button
                onClick={() => setShowCreateProgramModal(true)}
                className="px-3 rounded-md border-1 border-dashed border-blue-600 bg-transparent py-2 text-blue-600 text-sm hover:bg-blue-50 transition-colors"
              >
                + Create new program
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-zinc-500 mb-3">No programs yet!</p>
              <button
                onClick={() => setShowCreateProgramModal(true)}
                className="px-3 rounded-md bg-blue-600 py-2 text-white text-sm hover:bg-blue-700"
              >
                + Create new program
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateProgramModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Program</h2>
              <button
                onClick={() => setShowCreateProgramModal(false)}
                className="text-xl font-bold hover:cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProgramSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  required
                  placeholder="eg: 30-Day Sleep Reset"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-xl font-bold hover:cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="•••••"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="•••••"
                  minLength={5}
                  className="w-full rounded-md border px-3 py-2"
                />
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
    </main>
  );
}

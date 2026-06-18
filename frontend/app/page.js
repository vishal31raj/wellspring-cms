"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { login, register } from "@/services/auth.api";

export default function Home() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });
        toast.success(result.message);
        localStorage.setItem("token", result.token);
        document.cookie = `token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
        localStorage.setItem("c_id", result.c_id);
        router.push("/dashboard");
      } else {
        const result = await register(formData);
        setFormData({
          name: "",
          email: "",
          password: "",
        });
        toast.success(result.message);
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);

    // optional: reset form when switching
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          {isLogin ? "Login" : "Register"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name only for Register */}
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={5}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="•••••"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle button */}
        <button
          onClick={toggleMode}
          className="mt-4 w-full text-sm text-blue-600 hover:underline hover:cursor-pointer"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </main>
  );
}

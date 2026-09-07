"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRoleBasedRedirect = (role: string): string => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "owner":
        return "/restaurant";
      case "rider":
        return "/rider";
      case "admin":
        return "/admin";
      case "customer":
      default:
        return "/";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: role.toLowerCase(),
      phone: formData.get("number") as string,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register.");
        return;
      }
      const signInRes = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Account created, but failed to log in automatically.");
      }

      // Redirect to role-based home page
      const redirectPath = getRoleBasedRedirect(role);
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[25%] mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create an Account</h1>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>
      )}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/complete-profile" })}
        className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 mt-2"
      >
        Sign in with Google
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email Address</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            name="number"
            type="tel"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Account Role</label>
          <select
            name="role"
            required
            className="w-full border p-2 rounded bg-white text-gray-900"
          >
            <option value="customer">Customer</option>
            <option value="rider">Delivery Rider</option>
            <option value="owner">Restaurant Owner</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

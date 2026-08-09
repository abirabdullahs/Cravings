"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function handleLogin(e:any) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
    });

    setLoading(false);
  }

  return (
    <div className="w-[25%] mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>
      )}

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 mt-2"
      >
        Sign in with Google
      </button>

      <form onSubmit={handleLogin} className="space-y-4">
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
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
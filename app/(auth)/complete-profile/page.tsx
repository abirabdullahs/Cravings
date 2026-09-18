"use client";

import { useState } from "react";

export default function CompleteProfilePage() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationData, setVerificationData] = useState({
    nid_number: "",
    vehicle_type: "Bike",
    license_number: "",
    vehicle_plate: "",
    restaurant_name: "",
    trade_license: "",
    business_address: "",
  });

  const getRoleBasedRedirect = (selectedRole: string): string => {
    const normalizedRole = selectedRole.toLowerCase();
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

  const updateVerificationField = (field: keyof typeof verificationData, value: string) => {
    setVerificationData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, phone, verificationData: role === "owner" || role === "rider" ? verificationData : {} }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Redirect to role-based home page
      const redirectPath = getRoleBasedRedirect(role);
      window.location.href = redirectPath;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome! Please provide a few more details to get started.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+1 555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                I am a...
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900"
              >
                <option value="customer">Customer (Order Food)</option>
                <option value="owner">Restaurant Owner</option>
                <option value="rider">Delivery Rider</option>
              </select>
            </div>
          </div>

          {(role === "owner" || role === "rider") && (
            <div className="grid gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="mb-1 block">NID / National ID</span>
                <input
                  value={verificationData.nid_number}
                  onChange={(e) => updateVerificationField("nid_number", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                />
              </label>

              {role === "rider" && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Vehicle type</span>
                    <select
                      value={verificationData.vehicle_type}
                      onChange={(e) => updateVerificationField("vehicle_type", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                    >
                      <option>Bike</option>
                      <option>Cycle</option>
                      <option>Scooter</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Driving license number</span>
                    <input
                      value={verificationData.license_number}
                      onChange={(e) => updateVerificationField("license_number", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Vehicle plate</span>
                    <input
                      value={verificationData.vehicle_plate}
                      onChange={(e) => updateVerificationField("vehicle_plate", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                    />
                  </label>
                </>
              )}

              {role === "owner" && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Restaurant / business name</span>
                    <input
                      value={verificationData.restaurant_name}
                      onChange={(e) => updateVerificationField("restaurant_name", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    <span className="mb-1 block">Trade license</span>
                    <input
                      value={verificationData.trade_license}
                      onChange={(e) => updateVerificationField("trade_license", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                    <span className="mb-1 block">Business address</span>
                    <input
                      value={verificationData.business_address}
                      onChange={(e) => updateVerificationField("business_address", e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                    />
                  </label>
                </>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving Details..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

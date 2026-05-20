"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { FaBox, FaSearch, FaSignOutAlt } from "react-icons/fa";

export default function Home() {
  const { data: session } = useSession();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<any>(null);

  const trackPackage = async () => {
    const res = await fetch("/api/track", {
      method: "POST",
      body: JSON.stringify({ trackingNumber }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-blue-700">
          SSC Tracking
        </h1>

        <div className="flex gap-4">
          {!session ? (
            <>
              <a
                href="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Sign In
              </a>

              <a
                href="/register"
                className="border border-blue-600 text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-blue-100"
              >
                Sign Up
              </a>
            </>
          ) : (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              <FaSignOutAlt />
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Fast & Secure Shipment Tracking
        </h2>

        <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
          Track packages, monitor shipment progress, and manage logistics
          updates in real-time with SSC Tracking.
        </p>
      </section>

      {/* TRACKING AREA */}
      {session ? (
        <section className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

          <div className="flex items-center gap-3 mb-6">
            <FaBox className="text-blue-700 text-3xl" />
            <h3 className="text-2xl font-bold text-gray-900">
              Track Shipment
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-4">

            <input
              type="text"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 border-2 border-gray-300 p-4 rounded-xl text-lg font-medium text-black placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />

            <button
              onClick={trackPackage}
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaSearch />
              Track
            </button>
          </div>

          {/* TRACK RESULT */}
          {result && (
            <div className="mt-8 bg-gray-100 border border-gray-300 rounded-xl p-6">

              {result.error ? (
                <p className="text-red-600 font-semibold text-lg">
                  {result.error}
                </p>
              ) : (
                <div className="space-y-3 text-lg">

                  <p>
                    <span className="font-bold text-gray-900">
                      Tracking Number:
                    </span>{" "}
                    <span className="text-black">
                      {result.trackingNumber}
                    </span>
                  </p>

                  <p>
                    <span className="font-bold text-gray-900">
                      Status:
                    </span>{" "}
                    <span className="text-blue-700 font-semibold">
                      {result.status}
                    </span>
                  </p>

                  <p>
                    <span className="font-bold text-gray-900">
                      Origin:
                    </span>{" "}
                    <span className="text-black">
                      {result.origin}
                    </span>
                  </p>

                  <p>
                    <span className="font-bold text-gray-900">
                      Destination:
                    </span>{" "}
                    <span className="text-black">
                      {result.destination}
                    </span>
                  </p>

                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="text-center pb-24">

          <div className="bg-white shadow-xl rounded-2xl max-w-2xl mx-auto p-10">

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SSC Tracking
            </h3>

            <p className="text-gray-700 text-lg mb-8">
              Sign in or create an account to access shipment tracking
              and logistics management tools.
            </p>

            <div className="flex justify-center gap-5">

              <a
                href="/login"
                className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800"
              >
                Sign In
              </a>

              <a
                href="/register"
                className="border-2 border-blue-700 text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-100"
              >
                Create Account
              </a>

            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="text-center mt-20 py-8 text-gray-700 font-medium">
        © {new Date().getFullYear()} SSC Tracking. All rights reserved.
      </footer>
    </main>
  );
}
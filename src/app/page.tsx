"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  FaBox,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Home() {

  const { data: session } = useSession();

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const trackPackage = async () => {

    if (!trackingNumber) {
      alert("Enter tracking number");
      return;
    }

    setLoading(true);

    const res = await fetch(
      "/api/track",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          trackingNumber,
        }),
      }
    );

    const data =
      await res.json();

    setResult(data);

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">

      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-8 py-5 flex items-center justify-between">

        <h1 className="text-3xl font-extrabold text-blue-700">
          SSC Tracking
        </h1>

        <div className="flex gap-4">

          {!session ? (
            <>

              <a
                href="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition"
              >
                Sign In
              </a>

              <a
                href="/register"
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-xl font-bold transition"
              >
                Sign Up
              </a>

            </>
          ) : (

            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <FaSignOutAlt />
              Logout
            </button>

          )}

        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-20 px-6">

        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Fast & Secure <br />
          Shipment Tracking
        </h2>

        <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Track packages, monitor delivery progress,
          and manage logistics updates in real-time
          with SSC Tracking.
        </p>

      </section>

      {/* AUTH MESSAGE */}
      {!session ? (

        <section className="pb-24 px-4">

          <div className="bg-white max-w-2xl mx-auto shadow-xl rounded-3xl p-10 border border-gray-200 text-center">

            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
              Welcome to SSC Tracking
            </h3>

            <p className="text-lg text-gray-700 mb-8">
              Create an account or sign in
              to access shipment tracking tools
              and logistics management.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-5">

              <a
                href="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
              >
                Sign In
              </a>

              <a
                href="/register"
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-100 px-8 py-4 rounded-xl font-bold text-lg transition"
              >
                Create Account
              </a>

            </div>

          </div>

        </section>

      ) : (

        /* TRACKING SECTION */
        <section className="max-w-4xl mx-auto px-4 pb-24">

          <div className="bg-white shadow-xl rounded-3xl p-10 border border-gray-200">

            <div className="flex items-center gap-4 mb-8">

              <FaBox className="text-blue-700 text-4xl" />

              <div>

                <h3 className="text-3xl font-extrabold text-gray-900">
                  Track Shipment
                </h3>

                <p className="text-gray-700 mt-1">
                  Enter your tracking number below
                </p>

              </div>

            </div>

            {/* INPUT AREA */}
            <div className="flex flex-col md:flex-row gap-4">

              <input
                type="text"
                placeholder="Enter tracking number..."
                value={trackingNumber}
                onChange={(e) =>
                  setTrackingNumber(
                    e.target.value
                  )
                }
                className="flex-1 border-2 border-gray-300 rounded-xl p-5 text-lg font-medium text-black placeholder-gray-500 focus:outline-none focus:border-blue-600"
              />

              <button
                onClick={trackPackage}
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition"
              >
                <FaSearch />

                {loading
                  ? "Tracking..."
                  : "Track Package"}
              </button>

            </div>

            {/* TRACK RESULT */}
            {result && (

              <div className="mt-10 bg-white border-2 border-blue-200 rounded-2xl shadow-lg p-8">

                {result.error ? (

                  <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl text-lg font-semibold">
                    {result.error}
                  </div>

                ) : (

                  <div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                      <h4 className="text-3xl font-extrabold text-gray-900">
                        Shipment Details
                      </h4>

                      <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-bold text-sm w-fit">
                        {result.status}
                      </span>

                    </div>

                    <div className="grid md:grid-cols-2 gap-6">

                      <div className="bg-gray-100 rounded-xl p-5 border border-gray-300">

                        <p className="text-sm font-bold text-gray-600 mb-2">
                          TRACKING NUMBER
                        </p>

                        <p className="text-xl font-bold text-black break-all">
                          {result.trackingNumber}
                        </p>

                      </div>

                      <div className="bg-gray-100 rounded-xl p-5 border border-gray-300">

                        <p className="text-sm font-bold text-gray-600 mb-2">
                          CURRENT STATUS
                        </p>

                        <p className="text-xl font-bold text-blue-700">
                          {result.status}
                        </p>

                      </div>

                      <div className="bg-gray-100 rounded-xl p-5 border border-gray-300">

                        <p className="text-sm font-bold text-gray-600 mb-2">
                          ORIGIN
                        </p>

                        <p className="text-lg font-semibold text-black">
                          {result.origin}
                        </p>

                      </div>

                      <div className="bg-gray-100 rounded-xl p-5 border border-gray-300">

                        <p className="text-sm font-bold text-gray-600 mb-2">
                          DESTINATION
                        </p>

                        <p className="text-lg font-semibold text-black">
                          {result.destination}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            )}

          </div>

        </section>

      )}

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-700 font-medium">
        © {new Date().getFullYear()} SSC Tracking.
        All rights reserved.
      </footer>

    </main>
  );
}
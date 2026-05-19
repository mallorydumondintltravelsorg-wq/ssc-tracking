"use client";

import { useState } from "react";
import {
  FaBox,
  FaSearch,
  FaHeadset,
} from "react-icons/fa";

export default function Home() {

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const trackPackage = async () => {

    const res = await fetch(
      "/api/track",
      {
        method: "POST",
        body: JSON.stringify({
          trackingNumber,
        }),
      }
    );

    const data = await res.json();

    setResult(data);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between p-6 bg-white shadow">

        <h1 className="text-2xl font-bold text-blue-600">
          SSC Tracking
        </h1>

        <div className="space-x-6 text-gray-700">

          <a href="#">
            Home
          </a>

          <a href="/login">
            Login
          </a>

          <a href="/admin">
            Admin
          </a>

          <a href="#">
            Support
          </a>

        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center mt-20 px-4">

        <h2 className="text-4xl font-bold">
          Track Your Package Instantly
        </h2>

        <p className="text-gray-600 mt-3">
          Enter your tracking number
          to get live updates
        </p>

        {/* TRACKING BOX */}
        <div className="mt-8 flex justify-center">

          <div className="flex w-full max-w-xl shadow-lg rounded overflow-hidden">

            <input
              type="text"
              placeholder="Enter tracking number..."
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(
                  e.target.value
                )
              }
              className="w-full p-3 outline-none"
            />

            <button
              onClick={trackPackage}
              className="bg-blue-600 text-white px-6 flex items-center gap-2"
            >
              <FaSearch />
              Track
            </button>

          </div>
        </div>

        {/* TRACK RESULT */}
        {result && (

          <div className="mt-10 bg-white p-6 shadow rounded max-w-xl mx-auto text-left">

            {result.error ? (

              <p className="text-red-500">
                {result.error}
              </p>

            ) : (

              <>

                <h3 className="font-bold text-lg mb-4">
                  Tracking:
                  {" "}
                  {result.trackingNumber}
                </h3>

                <p>
                  <strong>Status:</strong>
                  {" "}
                  {result.status}
                </p>

                <p>
                  <strong>From:</strong>
                  {" "}
                  {result.origin}
                </p>

                <p>
                  <strong>To:</strong>
                  {" "}
                  {result.destination}
                </p>

                {/* TIMELINE */}
                <div className="mt-6">

                  <h4 className="font-bold mb-3">
                    Shipment Timeline
                  </h4>

                  <div className="space-y-4">

                    {result.events?.map(
                      (
                        event: any,
                        index: number
                      ) => (

                        <div
                          key={index}
                          className="border-l-4 border-blue-600 pl-4"
                        >

                          <p className="font-semibold">
                            {event.location}
                          </p>

                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>

                          <p className="text-xs text-gray-400">
                            {new Date(
                              event.createdAt
                            ).toLocaleString()}
                          </p>

                        </div>
                      )
                    )}

                  </div>
                </div>

              </>
            )}
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6 mt-20 px-10">

        <div className="bg-white p-6 shadow rounded text-center">

          <FaBox className="text-blue-600 text-3xl mx-auto" />

          <h3 className="font-bold mt-3">
            Fast Tracking
          </h3>

          <p className="text-gray-600 text-sm mt-2">
            Get real-time updates
            on your shipments
          </p>

        </div>

        <div className="bg-white p-6 shadow rounded text-center">

          <FaSearch className="text-blue-600 text-3xl mx-auto" />

          <h3 className="font-bold mt-3">
            Easy Search
          </h3>

          <p className="text-gray-600 text-sm mt-2">
            Simply enter your
            tracking number
          </p>

        </div>

        <div className="bg-white p-6 shadow rounded text-center">

          <FaHeadset className="text-blue-600 text-3xl mx-auto" />

          <h3 className="font-bold mt-3">
            24/7 Support
          </h3>

          <p className="text-gray-600 text-sm mt-2">
            Contact our support anytime
          </p>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center p-6 mt-20 text-gray-500">

        ©
        {" "}
        {new Date().getFullYear()}
        {" "}
        SSC Tracking.
        All rights reserved.

      </footer>

    </main>
  );
}
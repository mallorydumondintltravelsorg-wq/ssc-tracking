"use client";

import { useMemo, useState } from "react";
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

  const [historySearch, setHistorySearch] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const getCurrentStep = (
    status: string
  ) => {

    switch (status) {

      case "Shipment Created":
        return 1;

      case "Package Received":
        return 2;

      case "In Transit":
        return 3;

      case "Out for Delivery":
        return 4;

      case "Delivered":
        return 5;

      default:
        return 3;
    }
  };

  const getCircleColor = (
    step: number,
    current: number
  ) => {

    if (step <= current) {
      return "bg-blue-600";
    }

    return "bg-gray-400";
  };

  const getTextColor = (
    step: number,
    current: number
  ) => {

    if (step <= current) {
      return "text-gray-900";
    }

    return "text-gray-500";
  };

  const getStatusBadge = (
    status: string
  ) => {

    switch (status) {

      case "Shipment Created":
        return "bg-gray-200 text-gray-800";

      case "Package Received":
        return "bg-yellow-100 text-yellow-800";

      case "In Transit":
        return "bg-blue-100 text-blue-700";

      case "Out for Delivery":
        return "bg-orange-100 text-orange-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getEstimatedDelivery = (
    status: string
  ) => {

    const today =
      new Date();

    let daysToAdd = 0;

    switch (status) {

      case "Shipment Created":
        daysToAdd = 7;
        break;

      case "Package Received":
        daysToAdd = 5;
        break;

      case "In Transit":
        daysToAdd = 3;
        break;

      case "Out for Delivery":
        daysToAdd = 1;
        break;

      case "Delivered":
        daysToAdd = 0;
        break;

      default:
        daysToAdd = 3;
    }

    const eta =
      new Date(
        today.getTime() +
        daysToAdd *
        24 *
        60 *
        60 *
        1000
      );

    return eta.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getProgressPercentage = (
    status: string
  ) => {

    switch (status) {

      case "Shipment Created":
        return 20;

      case "Package Received":
        return 40;

      case "In Transit":
        return 60;

      case "Out for Delivery":
        return 80;

      case "Delivered":
        return 100;

      default:
        return 60;
    }
  };

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

    if (!data.error) {

      setHistory((prev) => [
        data,
        ...prev,
      ]);
    }

    setLoading(false);
  };

  const filteredHistory =
    useMemo(() => {

      return history.filter(
        (item) => {

          const search =
            historySearch.toLowerCase();

          return (
            item.trackingNumber
              ?.toLowerCase()
              .includes(search) ||

            item.status
              ?.toLowerCase()
              .includes(search) ||

            item.origin
              ?.toLowerCase()
              .includes(search) ||

            item.destination
              ?.toLowerCase()
              .includes(search)
          );
        }
      );

    }, [history, historySearch]);

  return (
    <main className="min-h-screen bg-gray-100 text-black">

      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">

        <h1 className="text-3xl font-extrabold text-blue-700">
          SSC Tracking
        </h1>

        <div className="flex items-center justify-center gap-4 flex-wrap text-sm md:text-base">

          <a
            href="/"
            className="text-gray-700 hover:text-blue-700 font-semibold transition"
          >
            Home
          </a>

          {session && (
            <>
              <a
                href="/admin"
                className="text-gray-700 hover:text-blue-700 font-semibold transition"
              >
                Admin
              </a>

              <a
                href="/support"
                className="text-gray-700 hover:text-blue-700 font-semibold transition"
              >
                Support
              </a>
            </>
          )}

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

        <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Fast & Secure <br />
          Shipment Tracking
        </h2>

        <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Track packages, monitor shipment progress,
          and manage logistics updates in real-time
          with SSC Tracking.
        </p>

      </section>

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

        <section className="max-w-5xl mx-auto px-4 md:px-6 pb-24">

          <div className="bg-white shadow-xl rounded-3xl p-6 md:p-10 border border-gray-200">

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

            <div className="flex flex-col lg:flex-row gap-4">

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

                      <span className={`${getStatusBadge(result.status)} px-5 py-2 rounded-full font-bold text-sm w-fit`}>
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

                      <div className="bg-gray-100 rounded-xl p-5 border border-gray-300">
                        <p className="text-sm font-bold text-gray-600 mb-2">
                          ESTIMATED DELIVERY
                        </p>

                        <p className="text-lg font-bold text-green-700">
                          {getEstimatedDelivery(result.status)}
                        </p>
                      </div>

                    </div>

                    {/* SHIPMENT PROGRESS */}
                    <div className="mt-10">

                      <div className="flex items-center justify-between mb-3">

                        <h4 className="text-2xl font-extrabold text-gray-900">
                          Shipment Progress
                        </h4>

                        <span className="text-lg font-bold text-blue-700">
                          {getProgressPercentage(result.status)}%
                        </span>

                      </div>

                      <div className="w-full bg-gray-300 rounded-full h-5 overflow-hidden">

                        <div
                          className="bg-blue-600 h-5 rounded-full transition-all duration-700"
                          style={{
                            width: `${getProgressPercentage(result.status)}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    {/* TIMELINE */}
                    <div className="mt-10">

                      <h4 className="text-2xl font-extrabold text-gray-900 mb-6">
                        Shipment Timeline
                      </h4>

                      {(() => {

                        const currentStep =
                          getCurrentStep(
                            result.status
                          );

                        return (

                          <div className="space-y-6 border-l-4 border-blue-600 pl-6">

                            {[
                              "Shipment Created",
                              "Package Received",
                              "In Transit",
                              "Out for Delivery",
                              "Delivered",
                            ].map((step, index) => (

                              <div
                                key={index}
                                className="relative"
                              >

                                <div className={`absolute -left-[38px] top-1 w-5 h-5 ${getCircleColor(index + 1, currentStep)} rounded-full`}></div>

                                <h5 className={`text-lg font-bold ${getTextColor(index + 1, currentStep)}`}>
                                  {step}
                                </h5>

                              </div>

                            ))}

                          </div>

                        );
                      })()}

                    </div>

                  </div>

                )}

              </div>

            )}

          </div>

        </section>

      )}

      {/* SHIPMENT ANALYTICS */}
      {session && history.length > 0 && (

        <section className="max-w-5xl mx-auto px-4 md:px-6 pb-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">

              <p className="text-sm font-bold text-gray-500 mb-2">
                TOTAL SHIPMENTS
              </p>

              <h3 className="text-4xl font-extrabold text-blue-700">
                {history.length}
              </h3>

            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">

              <p className="text-sm font-bold text-gray-500 mb-2">
                DELIVERED
              </p>

              <h3 className="text-4xl font-extrabold text-green-700">
                {
                  history.filter(
                    (item) =>
                      item.status ===
                      "Delivered"
                  ).length
                }
              </h3>

            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">

              <p className="text-sm font-bold text-gray-500 mb-2">
                IN TRANSIT
              </p>

              <h3 className="text-4xl font-extrabold text-blue-700">
                {
                  history.filter(
                    (item) =>
                      item.status ===
                      "In Transit"
                  ).length
                }
              </h3>

            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">

              <p className="text-sm font-bold text-gray-500 mb-2">
                PENDING
              </p>

              <h3 className="text-4xl font-extrabold text-orange-700">
                {
                  history.filter(
                    (item) =>
                      item.status !==
                      "Delivered"
                  ).length
                }
              </h3>

            </div>

          </div>

        </section>

      )}

      {/* RECENT SHIPMENTS */}
      {session && history.length > 0 && (

        <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

              <h3 className="text-3xl font-extrabold text-gray-900">
                Recent Shipments
              </h3>

              <input
                type="text"
                placeholder="Search shipments..."
                value={historySearch}
                onChange={(e) =>
                  setHistorySearch(
                    e.target.value
                  )
                }
                className="border-2 border-gray-300 rounded-xl px-5 py-3 w-full md:w-80 focus:outline-none focus:border-blue-600"
              />

            </div>

            <div className="grid gap-6">

              {filteredHistory.map((item, index) => (

                <div
                  key={index}
                  className="bg-gray-100 border border-gray-300 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >

                  <div>

                    <p className="text-sm font-bold text-gray-600 mb-1">
                      TRACKING NUMBER
                    </p>

                    <p className="text-xl font-bold text-black">
                      {item.trackingNumber}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm font-bold text-gray-600 mb-1">
                      STATUS
                    </p>

                    <span className={`${getStatusBadge(item.status)} px-4 py-2 rounded-full font-bold text-sm inline-block`}>
                      {item.status}
                    </span>

                  </div>

                  <div>

                    <p className="text-sm font-bold text-gray-600 mb-1">
                      ROUTE
                    </p>

                    <p className="text-lg font-semibold text-black">
                      {item.origin} → {item.destination}
                    </p>

                  </div>

                </div>

              ))}

            </div>

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
"use client";

import { useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaBox,
  FaSearch,
  FaSignOutAlt,
  FaTruck,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

export default function Home() {

  const { data: session } =
    useSession();

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [historySearch, setHistorySearch] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  const [activityFeed, setActivityFeed] =
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
        return 1;
    }
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
        return 85;

      case "Delivered":
        return 100;

      default:
        return 20;
    }
  };

  const getEstimatedDelivery = (
    status: string
  ) => {

    const date =
      new Date();

    switch (status) {

      case "Shipment Created":
        date.setDate(
          date.getDate() + 7
        );
        break;

      case "Package Received":
        date.setDate(
          date.getDate() + 5
        );
        break;

      case "In Transit":
        date.setDate(
          date.getDate() + 3
        );
        break;

      case "Out for Delivery":
        date.setDate(
          date.getDate() + 1
        );
        break;

      default:
        break;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getCurrentLocation = (
    status: string
  ) => {

    switch (status) {

      case "Shipment Created":
        return "Warehouse Facility";

      case "Package Received":
        return "Regional Sorting Center";

      case "In Transit":
        return "International Transit Hub";

      case "Out for Delivery":
        return "Local Delivery Center";

      case "Delivered":
        return "Recipient Address";

      default:
        return "Transit Hub";
    }
  };

  const getTimelineDate = (
    daysAgo: number
  ) => {

    const date =
      new Date();

    date.setDate(
      date.getDate() - daysAgo
    );

    return date.toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const trackPackage =
    async () => {

      if (!trackingNumber) {

        alert(
          "Enter tracking number"
        );

        return;
      }

      setLoading(true);

      try {

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

          const activity = {

            time:
              new Date().toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              ),

            text:
              `Shipment ${data.trackingNumber} moved to ${data.status}`,
          };

          setActivityFeed((prev) => [
            activity,
            ...prev,
          ]);
        }

      } catch (error) {

        alert(
          "Tracking failed"
        );
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

      <nav className="bg-white shadow-md px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">

        <h1 className="text-3xl font-extrabold text-blue-700">
          SSC Tracking
        </h1>

        <div className="flex items-center gap-4 flex-wrap">

          <Link
            href="/"
            className="font-bold text-gray-700 hover:text-blue-700"
          >
            Home
          </Link>

          {session && (
            <>
              <Link
                href="/admin"
                className="font-bold text-gray-700 hover:text-blue-700"
              >
                Admin
              </Link>

              <Link
                href="/support"
                className="font-bold text-gray-700 hover:text-blue-700"
              >
                Support
              </Link>
            </>
          )}

          {!session ? (
            <>
              <Link
                href="/login"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="border-2 border-blue-700 text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-xl font-bold"
              >
                Sign Up
              </Link>
            </>
          ) : (

            <button
              onClick={() =>
                signOut()
              }
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            >

              <FaSignOutAlt />

              Logout

            </button>

          )}

        </div>

      </nav>

      {/* HERO */}

      <section className="py-20 px-6 text-center">

        <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Enterprise Shipment
          Tracking Platform
        </h2>

        <p className="mt-6 text-xl text-gray-700 max-w-3xl mx-auto">
          Track shipments, monitor logistics operations,
          and manage delivery updates in real-time.
        </p>

      </section>

      {/* TRACKING SECTION */}

      {session && (

        <section className="max-w-5xl mx-auto px-4 pb-16">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">

            <div className="flex items-center gap-4 mb-8">

              <FaBox className="text-blue-700 text-4xl" />

              <div>

                <h3 className="text-3xl font-extrabold text-gray-900">
                  Track Shipment
                </h3>

                <p className="text-gray-700">
                  Enter shipment tracking number
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
                className="flex-1 border-2 border-gray-300 rounded-xl p-5 text-lg font-medium focus:outline-none focus:border-blue-600"
              />

              <button
                onClick={trackPackage}
                disabled={loading}
                className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3"
              >

                <FaSearch />

                {loading
                  ? "Tracking..."
                  : "Track Package"}

              </button>

            </div>

          </div>

        </section>

      )}

      {/* RESULT */}

      {result && (

        <section className="max-w-5xl mx-auto px-4 pb-16">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

              <div>

                <h3 className="text-4xl font-extrabold text-gray-900">
                  Shipment Details
                </h3>

                <p className="text-gray-700 mt-2">
                  Tracking Number:
                  {" "}
                  <span className="font-bold">
                    {result.trackingNumber}
                  </span>
                </p>

              </div>

              <div className="bg-blue-100 text-blue-700 px-6 py-3 rounded-2xl font-bold text-lg">
                {result.status}
              </div>

            </div>

            {/* ANALYTICS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

              <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">

                <p className="text-sm font-bold text-gray-600 mb-2">
                  ORIGIN
                </p>

                <p className="text-2xl font-extrabold">
                  {result.origin}
                </p>

              </div>

              <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">

                <p className="text-sm font-bold text-gray-600 mb-2">
                  DESTINATION
                </p>

                <p className="text-2xl font-extrabold">
                  {result.destination}
                </p>

              </div>

              <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">

                <p className="text-sm font-bold text-gray-600 mb-2">
                  ESTIMATED DELIVERY
                </p>

                <p className="text-2xl font-extrabold text-green-700">
                  {getEstimatedDelivery(
                    result.status
                  )}
                </p>

              </div>

            </div>

            {/* LOCATION */}

            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 mb-10">

              <div className="flex items-center gap-4 mb-4">

                <FaTruck className="text-blue-700 text-3xl" />

                <div>

                  <p className="text-sm font-bold text-gray-600">
                    CURRENT LOCATION
                  </p>

                  <h4 className="text-2xl font-extrabold text-blue-700">
                    {getCurrentLocation(
                      result.status
                    )}
                  </h4>

                </div>

              </div>

            </div>

            {/* PROGRESS */}

            <div className="mb-10">

              <div className="flex items-center justify-between mb-3">

                <h4 className="text-2xl font-extrabold text-gray-900">
                  Shipment Progress
                </h4>

                <span className="font-bold text-blue-700">
                  {
                    getProgressPercentage(
                      result.status
                    )
                  }%
                </span>

              </div>

              <div className="w-full bg-gray-300 rounded-full h-5 overflow-hidden">

                <div
                  className="bg-blue-700 h-5 rounded-full transition-all"
                  style={{
                    width: `${getProgressPercentage(
                      result.status
                    )}%`,
                  }}
                ></div>

              </div>

            </div>

            {/* TIMELINE */}

            <div>

              <h4 className="text-3xl font-extrabold text-gray-900 mb-8">
                Shipment Timeline
              </h4>

              <div className="space-y-6">

                {[
                  {
                    step: 1,
                    title:
                      "Shipment Created",
                    date:
                      getTimelineDate(5),
                  },
                  {
                    step: 2,
                    title:
                      "Package Received",
                    date:
                      getTimelineDate(4),
                  },
                  {
                    step: 3,
                    title:
                      "In Transit",
                    date:
                      getTimelineDate(2),
                  },
                  {
                    step: 4,
                    title:
                      "Out for Delivery",
                    date:
                      getTimelineDate(1),
                  },
                  {
                    step: 5,
                    title:
                      "Delivered",
                    date:
                      getTimelineDate(0),
                  },
                ].map((item) => {

                  const currentStep =
                    getCurrentStep(
                      result.status
                    );

                  const completed =
                    item.step <=
                    currentStep;

                  return (

                    <div
                      key={item.step}
                      className="flex items-start gap-5"
                    >

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          completed
                            ? "bg-blue-700"
                            : "bg-gray-400"
                        }`}
                      >

                        {completed ? (
                          <FaCheckCircle />
                        ) : (
                          <FaClock />
                        )}

                      </div>

                      <div>

                        <h5
                          className={`text-xl font-extrabold ${
                            completed
                              ? "text-black"
                              : "text-gray-500"
                          }`}
                        >
                          {item.title}
                        </h5>

                        <p className="text-gray-600 mt-1">
                          {item.date}
                        </p>

                      </div>

                    </div>

                  );
                })}

              </div>

            </div>

          </div>

        </section>

      )}

      {/* ACTIVITY FEED */}

      {activityFeed.length > 0 && (

        <section className="max-w-5xl mx-auto px-4 pb-16">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">

            <div className="flex items-center justify-between mb-8">

              <h3 className="text-3xl font-extrabold text-gray-900">
                Live Activity Feed
              </h3>

              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                LIVE
              </div>

            </div>

            <div className="space-y-4">

              {activityFeed.map(
                (activity, index) => (

                  <div
                    key={index}
                    className="bg-gray-100 border border-gray-300 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >

                    <p className="font-bold text-gray-900">
                      {activity.text}
                    </p>

                    <p className="text-sm font-bold text-blue-700">
                      {activity.time}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}

      {/* RECENT SHIPMENTS */}

      {history.length > 0 && (

        <section className="max-w-5xl mx-auto px-4 pb-20">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">

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
                className="border-2 border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:border-blue-600"
              />

            </div>

            <div className="space-y-5">

              {filteredHistory.map(
                (shipment, index) => (

                  <div
                    key={index}
                    className="bg-gray-100 border border-gray-300 rounded-2xl p-6"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div>

                        <p className="text-2xl font-extrabold">
                          {
                            shipment.trackingNumber
                          }
                        </p>

                        <p className="text-gray-700 mt-2">
                          {
                            shipment.origin
                          }
                          {" → "}
                          {
                            shipment.destination
                          }
                        </p>

                      </div>

                      <div
                        className={`px-5 py-3 rounded-2xl font-bold ${shipment.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : shipment.status === "In Transit"
                          ? "bg-blue-100 text-blue-700"
                          : shipment.status === "Out for Delivery"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {shipment.status}
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </section>

      )}

      {/* FOOTER */}

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-700 font-medium">
        © {new Date().getFullYear()} SSC Tracking.
        All rights reserved.
      </footer>

    </main>
  );
}

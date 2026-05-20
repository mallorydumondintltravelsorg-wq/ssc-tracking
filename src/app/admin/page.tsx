"use client";

import { useState } from "react";

export default function AdminPage() {

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [origin, setOrigin] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [status, setStatus] =
    useState("Shipment Created");

  const [loading, setLoading] =
    useState(false);

  const createShipment =
    async () => {

      if (
        !trackingNumber ||
        !origin ||
        !destination
      ) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      setLoading(true);

      const res = await fetch(
        "/api/admin/create-shipment",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            origin,
            destination,
            status,
          }),
        }
      );

      const data =
        await res.json();

      alert(
        data.message ||
        data.error
      );

      setLoading(false);
    };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl border border-gray-200 p-8 md:p-10">

        <h1 className="text-4xl font-extrabold text-blue-700 mb-8">
          Admin Shipment Management
        </h1>

        <div className="space-y-6">

          {/* TRACKING NUMBER */}
          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tracking Number
            </label>

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(
                  e.target.value
                )
              }
              placeholder="Enter tracking number"
              className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-600"
            />

          </div>

          {/* ORIGIN */}
          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Origin
            </label>

            <input
              type="text"
              value={origin}
              onChange={(e) =>
                setOrigin(
                  e.target.value
                )
              }
              placeholder="Shipment origin"
              className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-600"
            />

          </div>

          {/* DESTINATION */}
          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Destination
            </label>

            <input
              type="text"
              value={destination}
              onChange={(e) =>
                setDestination(
                  e.target.value
                )
              }
              placeholder="Shipment destination"
              className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-600"
            />

          </div>

          {/* STATUS */}
          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Shipment Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-600"
            >

              <option>
                Shipment Created
              </option>

              <option>
                Package Received
              </option>

              <option>
                In Transit
              </option>

              <option>
                Out for Delivery
              </option>

              <option>
                Delivered
              </option>

            </select>

          </div>

          {/* BUTTON */}
          <button
            onClick={createShipment}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg transition"
          >

            {loading
              ? "Creating Shipment..."
              : "Create Shipment"}

          </button>

        </div>

      </div>

    </main>
  );
}
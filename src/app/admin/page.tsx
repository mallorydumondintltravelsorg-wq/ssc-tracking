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

  const [editMode, setEditMode] =
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
        editMode
          ? data.message ||
            "Shipment updated"
          : data.message ||
            data.error
      );

      setLoading(false);
    };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl border border-gray-200 p-8 md:p-10">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>

            <h1 className="text-4xl font-extrabold text-blue-700">
              Admin Shipment Management
            </h1>

            <p className="text-gray-600 mt-2">
              Manage shipment operations,
              tracking workflow, and delivery lifecycle.
            </p>

          </div>

          <div className="bg-blue-100 text-blue-700 px-5 py-3 rounded-2xl font-bold">
            Enterprise Dashboard
          </div>

        </div>

        {/* MODE TOGGLE */}

        <div className="flex gap-4 mb-8">

          <button
            onClick={() =>
              setEditMode(false)
            }
            className={`flex-1 py-4 rounded-xl font-bold transition ${
              !editMode
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Create Shipment
          </button>

          <button
            onClick={() =>
              setEditMode(true)
            }
            className={`flex-1 py-4 rounded-xl font-bold transition ${
              editMode
                ? "bg-orange-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Edit Shipment
          </button>

        </div>

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

          {/* OPERATION PANEL */}

          <div className="bg-gray-100 border border-gray-300 rounded-2xl p-6">

            <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
              Shipment Workflow
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

              {[
                "Shipment Created",
                "Package Received",
                "In Transit",
                "Out for Delivery",
                "Delivered",
              ].map((step, index) => (

                <div
                  key={index}
                  className={`rounded-xl p-4 text-center font-bold border-2 ${
                    status === step
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {step}
                </div>

              ))}

            </div>

          </div>

          {/* BUTTON */}

          <button
            onClick={createShipment}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition ${
              editMode
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >

            {loading
              ? editMode
                ? "Updating Shipment..."
                : "Creating Shipment..."
              : editMode
                ? "Update Shipment"
                : "Create Shipment"}

          </button>

        </div>

      </div>

    </main>
  );
}
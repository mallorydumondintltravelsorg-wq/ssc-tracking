"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  useSession,
  signOut,
} from "next-auth/react";

import { useRouter }
from "next/navigation";

export default function AdminPage() {

  // SESSION
  const { status } =
    useSession();

  const router =
    useRouter();

  // FORM STATE
  const [form, setForm] =
    useState({
      trackingNumber: "",
      senderName: "",
      receiverName: "",
      origin: "",
      destination: "",
      status: "",
    });

  // PROTECT PAGE
  useEffect(() => {

    if (
      status ===
      "unauthenticated"
    ) {

      router.push("/login");
    }

  }, [status, router]);

  // LOADING SCREEN
  if (status === "loading") {

    return (
      <p className="p-10">
        Loading...
      </p>
    );
  }

  // CREATE SHIPMENT
  const handleSubmit =
    async () => {

      const res = await fetch(
        "/api/admin/create-shipment",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data =
        await res.json();

      alert(
        data.message ||
        data.error
      );
    };

  // ADD EVENT
  const addTrackingEvent =
    async () => {

      const trackingNumber = (
        document.getElementById(
          "eventTracking"
        ) as HTMLInputElement
      ).value;

      const location = (
        document.getElementById(
          "eventLocation"
        ) as HTMLInputElement
      ).value;

      const description = (
        document.getElementById(
          "eventDescription"
        ) as HTMLInputElement
      ).value;

      const status = (
        document.getElementById(
          "eventStatus"
        ) as HTMLInputElement
      ).value;

      const res = await fetch(
        "/api/admin/add-event",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            location,
            description,
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
    };

  return (
    <main className="min-h-screen p-10 bg-gray-100">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>

        <button
          onClick={() =>
            signOut({
              callbackUrl:
                "/login",
            })
          }
          className="bg-red-600 text-white px-5 py-2 rounded"
        >
          Logout
        </button>

      </div>

      {/* CREATE SHIPMENT */}
      <div className="bg-white p-6 rounded shadow max-w-xl space-y-4">

        <h2 className="text-2xl font-bold">
          Create Shipment
        </h2>

        <input
          type="text"
          placeholder="Tracking Number"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setForm({
              ...form,
              trackingNumber:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Sender Name"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setForm({
              ...form,
              senderName:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Receiver Name"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setForm({
              ...form,
              receiverName:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Origin"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setForm({
              ...form,
              origin:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Destination"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setForm({
              ...form,
              destination:
                e.target.value,
            })
          }
        />

        <input
          type="text"
          placeholder="Status"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setForm({
              ...form,
              status:
                e.target.value,
            })
          }
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Create Shipment
        </button>

      </div>

      {/* ADD TRACKING EVENT */}
      <div className="bg-white p-6 rounded shadow max-w-xl space-y-4 mt-10">

        <h2 className="text-2xl font-bold">
          Add Tracking Event
        </h2>

        <input
          type="text"
          placeholder="Tracking Number"
          className="w-full p-3 border rounded"
          id="eventTracking"
        />

        <input
          type="text"
          placeholder="Current Location"
          className="w-full p-3 border rounded"
          id="eventLocation"
        />

        <input
          type="text"
          placeholder="Description"
          className="w-full p-3 border rounded"
          id="eventDescription"
        />

        <input
          type="text"
          placeholder="Shipment Status"
          className="w-full p-3 border rounded"
          id="eventStatus"
        />

        <button
          onClick={addTrackingEvent}
          className="bg-green-600 text-white px-6 py-3 rounded"
        >
          Add Tracking Event
        </button>

      </div>

    </main>
  );
}
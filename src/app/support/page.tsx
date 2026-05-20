"use client";

import { useState } from "react";

export default function SupportPage() {

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submitTicket =
    async () => {

      if (
        !subject ||
        !message
      ) {

        alert(
          "Please complete all fields"
        );

        return;
      }

      setLoading(true);

      try {

        const res = await fetch(
          "/api/support/create-ticket",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              subject,
              message,
            }),
          }
        );

        const data =
          await res.json();

        alert(
          data.message ||
          data.error
        );

        if (!data.error) {

          setSubject("");
          setMessage("");
        }

      } catch (error) {

        alert(
          "Failed to submit ticket"
        );
      }

      setLoading(false);
    };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-10">

        <div className="mb-10">

          <h1 className="text-4xl font-extrabold text-blue-700">
            Support Ticket Center
          </h1>

          <p className="text-gray-600 mt-3 text-lg">
            Submit shipment issues,
            delivery concerns, and logistics support requests.
          </p>

        </div>

        <div className="space-y-6">

          {/* SUBJECT */}

          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Ticket Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) =>
                setSubject(
                  e.target.value
                )
              }
              placeholder="Enter issue subject"
              className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-600"
            />

          </div>

          {/* MESSAGE */}

          <div>

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Support Message
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="Describe your issue..."
              rows={7}
              className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-blue-600"
            ></textarea>

          </div>

          {/* HELP BOX */}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">

            <h3 className="text-2xl font-extrabold text-blue-700 mb-3">
              Common Support Topics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[
                "Tracking Delays",
                "Shipment Not Updating",
                "Delivery Problems",
                "Wrong Destination",
                "Package Damage",
                "Customs Delays",
              ].map((item, index) => (

                <div
                  key={index}
                  className="bg-white border border-blue-200 rounded-xl p-4 font-semibold text-gray-700"
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

          {/* SUBMIT BUTTON */}

          <button
            onClick={submitTicket}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg transition"
          >

            {loading
              ? "Submitting Ticket..."
              : "Submit Support Ticket"}

          </button>

        </div>

      </div>

    </main>
  );
}
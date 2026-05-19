"use client";

import { useState } from "react";

export default function RegisterPage() {

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const handleRegister =
    async () => {

      const res = await fetch(
        "/api/register",
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded shadow w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-6"
          onChange={(e) =>
            setForm({
              ...form,
              password:
                e.target.value,
            })
          }
        />

        <button
          onClick={
            handleRegister
          }
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Register
        </button>

      </div>
    </main>
  );
}
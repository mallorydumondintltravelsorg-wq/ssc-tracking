"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    setLoading(true);

    const res = await fetch(
      "/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // AUTO LOGIN AFTER SIGNUP
    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (login?.ok) {
      router.push("/");
    } else {
      alert("Account created, but auto-login failed.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

        <h1 className="text-4xl font-extrabold mb-3 text-center text-gray-900">
          Create Account
        </h1>

        <p className="text-center text-gray-700 mb-8">
          Sign up to access shipment tracking and logistics tools.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 text-black text-lg placeholder-gray-500 focus:outline-none focus:border-blue-600"
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 text-black text-lg placeholder-gray-500 focus:outline-none focus:border-blue-600"
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
          className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 text-black text-lg placeholder-gray-500 focus:outline-none focus:border-blue-600"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl text-lg font-bold transition"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Sign In
          </a>
        </p>

      </div>
    </main>
  );
}
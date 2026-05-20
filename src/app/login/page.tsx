"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      alert("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">

        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-3">
          Welcome Back
        </h1>

        <p className="text-center text-gray-700 mb-8">
          Sign in to manage shipments and track packages.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-4 border-2 border-gray-300 rounded-xl mb-4 text-black text-lg placeholder-gray-500 focus:outline-none focus:border-blue-600"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 text-black text-lg placeholder-gray-500 focus:outline-none focus:border-blue-600"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl text-lg font-bold transition"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center mt-6 text-gray-700">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Create Account
          </a>
        </p>

      </div>
    </main>
  );
}
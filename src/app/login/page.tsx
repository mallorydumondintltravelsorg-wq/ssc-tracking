"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin =
    async () => {

      const result =
        await signIn(
          "credentials",
          {
            email,
            password,
            redirect: false,
          }
        );

      if (result?.error) {

        alert(
          "Invalid credentials"
        );

        return;
      }

      alert("Login successful");

      router.push("/admin");
    };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded shadow w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-6"
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Login
        </button>

      </div>
    </main>
  );
}
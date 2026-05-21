"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import NotificationCenter from "@/components/NotificationCenter";
import {
  FaBoxOpen,
  FaChartLine,
  FaComments,
  FaSearch,
  FaTruck,
} from "react-icons/fa";

type Shipment = {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  currentLocation?: string | null;
  createdAt: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
};

type DashboardData = {
  shipments: Shipment[];
  tickets: Ticket[];
  stats: {
    totalShipments: number;
    activeShipments: number;
    delivered: number;
    openTickets: number;
    unreadNotifications: number;
  };
};

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!session?.user || session.user.role === "admin") {
      return;
    }

    const res = await fetch("/api/customer/dashboard", {
      cache: "no-store",
    });

    if (!res.ok) {
      return;
    }

    setData(await res.json());
  }, [session?.user]);

  useEffect(() => {
    loadDashboard();

    const timer = window.setInterval(loadDashboard, 15000);

    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const filteredShipments = useMemo(() => {
    const term = search.toLowerCase();

    return (data?.shipments || []).filter((shipment) =>
      [
        shipment.trackingNumber,
        shipment.origin,
        shipment.destination,
        shipment.status,
        shipment.currentLocation || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [data?.shipments, search]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          Loading customer dashboard...
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-950">
            Dashboard access requires login
          </h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  if (session.user.role === "admin") {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-950">
            Customer dashboard is account-scoped
          </h1>
          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Open admin dashboard
          </Link>
        </div>
      </main>
    );
  }

  const stats = data?.stats || {
    totalShipments: 0,
    activeShipments: 0,
    delivered: 0,
    openTickets: 0,
    unreadNotifications: 0,
  };

  return (
    <main className="min-h-screen bg-slate-100 p-5 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-blue-700">
              Customer portal
            </p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">
              Shipment Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-700">
              Review account-linked shipments, support activity, and delivery
              progress from one secure workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NotificationCenter />
            <Link
              href="/support"
              className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-blue-800 transition hover:bg-blue-100"
            >
              Support
            </Link>
          </div>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Shipments", stats.totalShipments, <FaBoxOpen key="icon" />],
            ["Active", stats.activeShipments, <FaTruck key="icon" />],
            ["Delivered", stats.delivered, <FaChartLine key="icon" />],
            ["Open Tickets", stats.openTickets, <FaComments key="icon" />],
            ["Unread", stats.unreadNotifications, <FaSearch key="icon" />],
          ].map(([label, value, icon]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {icon}
              </div>
              <p className="text-sm font-bold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-extrabold text-slate-950">
                My Shipments
              </h2>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search shipments"
                className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-950 outline-none transition focus:border-blue-600"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-slate-50 text-sm uppercase text-slate-600">
                  <tr>
                    <th className="px-5 py-4">Tracking</th>
                    <th className="px-5 py-4">Route</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="px-5 py-4 font-extrabold text-slate-950">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {shipment.origin} to {shipment.destination}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {shipment.currentLocation || "Awaiting update"}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {new Date(shipment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredShipments.length === 0 && (
                <div className="p-6 font-semibold text-slate-600">
                  No account-linked shipments found.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Recent Support
              </h2>
            </div>
            <div className="space-y-3 p-4">
              {(data?.tickets || []).map((ticket) => (
                <Link
                  key={ticket.id}
                  href="/support"
                  className="block rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <p className="font-extrabold text-slate-950">
                    {ticket.subject}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {ticket.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
              {(data?.tickets || []).length === 0 && (
                <p className="p-2 font-semibold text-slate-600">
                  No support tickets yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

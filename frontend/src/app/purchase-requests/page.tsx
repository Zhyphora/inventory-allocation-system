"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiResponse } from "@/lib/api";
import { ErrorAlert, LoadingSpinner } from "@/components/ui";

interface PurchaseRequest {
  id: string;
  reference: string;
  warehouse_id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: { name: string };
  items?: Array<{ quantity: number }>;
  PurchaseRequestItems?: Array<{ quantity: number }>;
}

export default function PurchaseRequestsList() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = (await api.purchaseRequests.getAll?.()) as any;
      if (response?.statusCode === 200) {
        const requestsData = Array.isArray(response.data) ? response.data : [];
        const mappedRequests = requestsData.map((req: any) => ({
          ...req,
          warehouse: req.warehouse || { name: "Unknown" },
          items: req.items || req.PurchaseRequestItems || [],
        }));
        setRequests(mappedRequests);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.reference
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = !filterStatus || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalQuantity = (items: any[] = []) => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const stats = {
    total: requests.length,
    draft: requests.filter((r) => r.status === "DRAFT").length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Purchase Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all purchase requests and track their status
          </p>
        </div>
        <Link
          href="/purchase-requests/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + New Request
        </Link>
      </div>

      <ErrorAlert message={error} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <p className="text-gray-600 text-sm font-medium">Draft</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.completed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Reference
            </label>
            <input
              type="text"
              placeholder="e.g., PR00001"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Warehouse
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date Created
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p className="text-lg">No purchase requests found</p>
                    <p className="text-sm mt-1">
                      Try adjusting your filters or create a new one
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {req.reference}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {req.warehouse?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {getTotalQuantity(req.items)} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/purchase-requests/${req.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

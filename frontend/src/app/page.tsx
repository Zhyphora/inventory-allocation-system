"use client";

import { useEffect, useState } from "react";
import { api, ApiResponse } from "@/lib/api";
import { ErrorAlert, LoadingSpinner } from "@/components/ui";
import Link from "next/link";

interface StockData {
  id: string;
  warehouse_id: string;
  product_id: string;
  quantity: number;
  warehouse?: { id: string; name: string };
  product?: { id: string; name: string; sku?: string };
  Warehouse?: { name: string };
  Product?: { name: string; sku?: string };
}

interface PurchaseRequestData {
  id: string;
  reference: string;
  status: string;
  warehouse_id: string;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    product?: { name: string; sku?: string };
  }>;
}

export default function Dashboard() {
  const [allStocks, setAllStocks] = useState<StockData[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [purchaseRequest, setPurchaseRequest] =
    useState<PurchaseRequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prNumber, setPrNumber] = useState<string>("");
  const [showPRForm, setShowPRForm] = useState(false);
  const [filterSku, setFilterSku] = useState<string>("");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const stocksResponse = (await api.stocks.getAll()) as ApiResponse<any>;
      if (stocksResponse.statusCode === 200 && stocksResponse.data) {
        const stockData = Array.isArray(stocksResponse.data)
          ? stocksResponse.data
          : [];
        setAllStocks(stockData);
        setStocks(stockData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prNumber.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = (await api.purchaseRequests.getByReference(
        prNumber.trim()
      )) as ApiResponse<any>;

      if (response.statusCode === 200 && response.data) {
        setPurchaseRequest(response.data);
        const filteredStocks = allStocks.filter(
          (s) => s.warehouse_id === response.data.warehouse_id
        );
        setStocks(filteredStocks);
        setShowPRForm(false);
      } else {
        setError("Purchase Request not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to search PR");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrNumber("");
    setPurchaseRequest(null);
    setStocks(allStocks);
    setShowPRForm(false);
    setFilterSku("");
    setFilterWarehouse("");
  };

  const applyFilters = () => {
    let filtered = purchaseRequest ? stocks : allStocks;

    if (filterSku.trim()) {
      filtered = filtered.filter((s) =>
        (s.product?.sku || "").toUpperCase().includes(filterSku.toUpperCase())
      );
    }

    if (filterWarehouse.trim()) {
      filtered = filtered.filter((s) =>
        (s.warehouse?.name || s.Warehouse?.name || "Unknown")
          .toUpperCase()
          .includes(filterWarehouse.toUpperCase())
      );
    }

    setStocks(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filterSku, filterWarehouse, purchaseRequest]);

  if (loading && allStocks.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage inventory and track purchase requests
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {new Set(stocks.map((s) => s.product_id)).size}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Stock Units</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stocks.reduce((sum, s) => sum + s.quantity, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Warehouses</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {new Set(stocks.map((s) => s.warehouse_id)).size}
          </p>
        </div>
      </div>

      {/* Search PR Section */}
      {!purchaseRequest && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Track Purchase Request
            </h2>
            {showPRForm && (
              <button
                onClick={() => setShowPRForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          {showPRForm ? (
            <form onSubmit={handleSearchPR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Request Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., PR00001"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowPRForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Click here to enter PR number →
            </button>
          )}
        </div>
      )}

      {/* PR Details Section */}
      {purchaseRequest && (
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-900">
                Purchase Request: {purchaseRequest.reference}
              </h2>
              <p className="text-sm text-blue-700 mt-1">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    purchaseRequest.status === "COMPLETED"
                      ? "text-green-600"
                      : purchaseRequest.status === "PENDING"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {purchaseRequest.status}
                </span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {purchaseRequest.items.map((item, idx) => (
              <div key={idx} className="bg-white rounded p-3">
                <p className="text-gray-600 text-xs font-medium">SKU</p>
                <p className="font-semibold text-gray-900">
                  {item.product?.sku || "N/A"}
                </p>
                <p className="text-gray-600 text-xs font-medium mt-2">
                  Requested
                </p>
                <p className="font-semibold text-blue-600">
                  {item.quantity} units
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Inventory */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {purchaseRequest ? "Warehouse Stock Levels" : "Stock Inventory"}
        </h2>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by SKU
            </label>
            <input
              type="text"
              value={filterSku}
              onChange={(e) => setFilterSku(e.target.value.toUpperCase())}
              placeholder="e.g., ICYMINT"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Warehouse
            </label>
            <input
              type="text"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              placeholder="e.g., Surabaya Warehouse"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No stock data available
                  </td>
                </tr>
              ) : (
                stocks.map((stock, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {stock.product?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {stock.product?.sku || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {stock.warehouse?.name ||
                        stock.Warehouse?.name ||
                        "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {stock.quantity}
                      </span>
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

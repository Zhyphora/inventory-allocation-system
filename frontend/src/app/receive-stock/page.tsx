"use client";

import { useState, useEffect } from "react";
import { api, ApiResponse } from "@/lib/api";
import {
  ErrorAlert,
  SuccessAlert,
  LoadingSpinner,
  Button,
} from "@/components/ui";

interface PurchaseRequest {
  id: string;
  reference: string;
  warehouse_id: string;
  status: string;
  warehouse?: { name: string };
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    product?: { name: string; sku: string };
  }>;
}

interface ReceiveItem {
  product_name: string;
  sku_barcode: string;
  qty: number;
}

export default function ReceiveStock() {
  const [prRequests, setPRRequests] = useState<PurchaseRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [details, setDetails] = useState<ReceiveItem[]>([
    { product_name: "", sku_barcode: "", qty: 0 },
  ]);

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      setLoading(true);
      const response = (await api.purchaseRequests.getAll?.()) as any;
      if (response?.statusCode === 200) {
        const requests = Array.isArray(response.data) ? response.data : [];
        // Filter only PENDING requests
        const pendingRequests = requests.filter(
          (req: PurchaseRequest) => req.status === "PENDING"
        );
        setPRRequests(pendingRequests);
      }
    } catch (err: any) {
      setError("Failed to load purchase requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPR = (pr: PurchaseRequest) => {
    setSelectedPR(pr);
    setError(null);
    setSuccess(null);

    // Pre-populate items from PR
    if (pr.items && pr.items.length > 0) {
      const preFilledItems = pr.items.map((item) => ({
        product_name: item.product?.name || "",
        sku_barcode: item.product?.sku || "",
        qty: 0,
      }));
      setDetails(preFilledItems);
    } else {
      setDetails([{ product_name: "", sku_barcode: "", qty: 0 }]);
    }
  };

  const addItem = () => {
    setDetails([...details, { product_name: "", sku_barcode: "", qty: 0 }]);
  };

  const removeItem = (idx: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (
    idx: number,
    field: keyof ReceiveItem,
    value: string | number
  ) => {
    const newDetails = [...details];
    newDetails[idx] = { ...newDetails[idx], [field]: value };
    setDetails(newDetails);
  };

  const validateForm = (): boolean => {
    if (!selectedPR) {
      setError("Please select a purchase request");
      return false;
    }
    if (details.some((item) => !item.sku_barcode || item.qty <= 0)) {
      setError("Please fill all items with valid SKU and quantity");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const totalQty = details.reduce((sum, item) => sum + item.qty, 0);

      const payload = {
        vendor: "PT FOOM LAB GLOBAL",
        reference: selectedPR!.reference,
        qty_total: totalQty,
        details: details.map((item) => ({
          product_name: item.product_name,
          sku_barcode: item.sku_barcode,
          qty: item.qty,
        })),
      };

      const response = await fetch(
        "http://localhost:3000/api/webhook/receive-stock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setSuccess("Stock received successfully!");
        setTimeout(() => {
          setSelectedPR(null);
          setDetails([{ product_name: "", sku_barcode: "", qty: 0 }]);
          fetchPurchaseRequests();
        }, 2000);
      } else {
        setError(result.message || "Failed to receive stock");
      }
    } catch (err: any) {
      setError(err.message || "Failed to receive stock");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Receive Stock</h1>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Purchase Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Purchase Requests
          </h2>

          {prRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending purchase requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prRequests.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => handleSelectPR(pr)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedPR?.id === pr.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{pr.reference}</p>
                  <p className="text-sm text-gray-600">
                    {pr.warehouse?.name || "Unknown Warehouse"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Items: {pr.items?.length || 0}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Stock Details Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Stock Details
          </h2>

          {selectedPR ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Selected PR</p>
                <p className="font-semibold text-blue-900">
                  {selectedPR.reference}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Stock Items
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {details.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="grid grid-cols-1 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) =>
                              updateItem(idx, "product_name", e.target.value)
                            }
                            placeholder="e.g., Vanilla Dream"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            SKU / Barcode
                          </label>
                          <input
                            type="text"
                            value={item.sku_barcode}
                            onChange={(e) =>
                              updateItem(idx, "sku_barcode", e.target.value)
                            }
                            placeholder="e.g., VANADREAM"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                updateItem(idx, "qty", parseInt(e.target.value))
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          {details.length > 1 && (
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={submitting} className="w-full">
                Confirm Stock Reception
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a purchase request to receive stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

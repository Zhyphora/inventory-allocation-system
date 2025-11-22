"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiResponse } from "@/lib/api";
import {
  ErrorAlert,
  SuccessAlert,
  LoadingSpinner,
  Button,
} from "@/components/ui";

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface FormItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export default function CreatePurchaseRequest() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState<FormItem[]>([
    { product_id: "", quantity: 1 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const productsResponse =
        (await api.products.getAll()) as ApiResponse<any>;
      if (productsResponse.statusCode === 200) {
        setProducts(
          Array.isArray(productsResponse.data) ? productsResponse.data : []
        );
      }

      const stocksResponse = (await api.stocks.getAll()) as ApiResponse<any>;
      if (stocksResponse.statusCode === 200 && stocksResponse.data) {
        const warehouseList = Array.isArray(stocksResponse.data)
          ? Array.from(
              new Map(
                stocksResponse.data.map((s: any) => [
                  s.warehouse_id,
                  {
                    id: s.warehouse_id,
                    name: s.warehouse?.name || s.Warehouse?.name || "Unknown",
                  },
                ])
              ).values()
            )
          : [];
        setWarehouses(warehouseList);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const validateForm = (): boolean => {
    if (!warehouseId) {
      setError("Please select a warehouse");
      return false;
    }
    if (items.length === 0) {
      setError("Please add at least one item");
      return false;
    }
    if (items.some((item) => !item.product_id || item.quantity <= 0)) {
      setError("Please fill all items with valid product and quantity");
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

      const payload = {
        warehouse_id: warehouseId,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const response = (await api.purchaseRequests.create(
        payload
      )) as ApiResponse;

      if (response.statusCode === 201 || response.statusCode === 200) {
        setSuccess("Purchase request created successfully!");
        setTimeout(() => {
          router.push("/purchase-requests");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create purchase request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Create Purchase Request
        </h1>
        <p className="text-gray-600 mt-1">
          Add a new purchase request for your warehouse
        </p>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Warehouse Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Select Warehouse <span className="text-red-600">*</span>
          </label>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            <option value="">-- Choose a Warehouse --</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Items</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add products to this purchase request
              </p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-7">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Product
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(e) =>
                        updateItem(idx, "product_id", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", parseInt(e.target.value))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center font-semibold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {items.length > 0 && warehouseId && (
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium">Summary</p>
            <p className="text-lg font-bold text-blue-900 mt-2">
              {items.reduce((sum, item) => sum + item.quantity, 0)} total items
              in {items.length} product{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
          >
            {submitting ? "Creating..." : "Create Request"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

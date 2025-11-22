"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, ApiResponse } from "@/lib/api";
import {
  ErrorAlert,
  SuccessAlert,
  LoadingSpinner,
  Button,
} from "@/components/ui";

interface PurchaseRequestItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: { name: string; sku: string };
}

interface PurchaseRequest {
  id: string;
  reference: string;
  warehouse_id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  warehouse?: { name: string };
  PurchaseRequestItems?: PurchaseRequestItem[];
}

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function PurchaseRequestDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);

  useEffect(() => {
    if (id) {
      fetchRequestDetail();
      fetchData();
    }
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const response = (await api.purchaseRequests.getById?.(id)) as any;
      if (response?.statusCode === 200 && response.data) {
        const data = response.data;
        // Map items and warehouse properly
        const mappedData = {
          ...data,
          warehouse: data.warehouse || { name: "Unknown" },
          PurchaseRequestItems: data.items || data.PurchaseRequestItems || [],
        };
        setRequest(mappedData);
        setWarehouseId(data.warehouse_id);
        setItems(data.items || data.PurchaseRequestItems || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase request");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
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
      console.error("Failed to fetch data:", err);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = (await api.purchaseRequests.update(id, {
        status: newStatus,
      })) as ApiResponse;

      if (response.statusCode === 200 || response.statusCode === 201) {
        setSuccess(`Status updated to ${newStatus} successfully!`);
        setTimeout(() => {
          fetchRequestDetail();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this purchase request?"))
      return;

    try {
      setDeletingId(id);
      setError(null);

      const response = (await api.purchaseRequests.delete(id)) as ApiResponse;

      if (response.statusCode === 200 || response.statusCode === 204) {
        setSuccess("Purchase request deleted successfully!");
        setTimeout(() => {
          router.push("/purchase-requests");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete purchase request");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!request) return <ErrorAlert message="Purchase request not found" />;

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

  const totalQuantity = items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Request Details</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-1">Reference</p>
            <p className="text-lg font-semibold text-gray-900">
              {request.reference}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                request.status
              )}`}
            >
              {request.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Warehouse</p>
            <p className="text-lg font-semibold text-gray-900">
              {request.warehouse?.name || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Created Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      No items
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.product?.name || "Unknown Product"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.product?.sku || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {item.quantity}
                      </td>
                    </tr>
                  ))
                )}
                {items.length > 0 && (
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="px-4 py-3 text-right">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-blue-600">{totalQuantity}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {request.status === "DRAFT" && (
          <div className="flex gap-4">
            <Button
              onClick={() => handleUpdateStatus("PENDING")}
              loading={submitting}
              className="flex-1"
            >
              Move to PENDING
            </Button>
            <Button
              onClick={handleDelete}
              loading={deletingId === id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex-1"
            >
              Delete
            </Button>
          </div>
        )}

        {request.status === "PENDING" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⏳ This request is waiting for stock to be received. Once stock
              arrives, the status will be updated to COMPLETED.
            </p>
          </div>
        )}

        {request.status === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✓ This request has been completed and stock has been received.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

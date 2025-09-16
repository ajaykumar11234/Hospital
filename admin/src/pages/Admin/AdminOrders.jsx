import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";

function AdminOrders() {
  const { orders, ordersLoading, getAllOrders } = useContext(AdminContext);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getAllOrders();
  }, []);

  if (ordersLoading) return <p className="text-center mt-4">Loading orders...</p>;
  if (orders.length === 0)
    return <p className="text-center mt-4 text-gray-500">No orders found.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h2 className="text-2xl font-semibold mb-6 text-center">All Orders</h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Order ID:</span>
              <span>{order._id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">User:</span>
              <span>
                {order.userId?.name} ({order.userId?.email})
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Status:</span>
              <span
                className={`font-semibold ${
                  order.status === "Delivered"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex justify-between font-semibold mt-2">
              <span>Total:</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <button
              onClick={() => setSelectedOrder(order)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <h3 className="text-xl font-semibold mb-4">Order Details</h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-lg"
            >
              &times;
            </button>

            <div className="mb-2">
              <strong>Order ID:</strong> {selectedOrder._id}
            </div>
            <div className="mb-2">
              <strong>User:</strong>{" "}
              {selectedOrder.userId?.name} ({selectedOrder.userId?.email})
            </div>
            <div className="mb-2">
              <strong>Status:</strong>{" "}
              <span
                className={`font-semibold ${
                  selectedOrder.status === "Delivered"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {selectedOrder.status}
              </span>
            </div>
            <div className="mb-2">
              <strong>Created At:</strong>{" "}
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </div>
            <div className="mb-2">
              <strong>Medicines:</strong>
              <ul className="ml-4 mt-1">
                {selectedOrder.medicines.map((item) => (
                  <li key={item.medicineId?._id} className="mb-1">
                    {item.medicineId?.name || "Deleted Medicine"} × {item.quantity} - ₹
                    {(item.medicineId?.price || 0) * item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between font-semibold mt-4">
              <span>Total Amount:</span>
              <span>₹{selectedOrder.totalAmount}</span>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;

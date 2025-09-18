import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";

function AdminOrders() {
  const { orders, ordersLoading, getAllOrders } = useContext(AdminContext);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Fetch only if not already loaded
    if (!orders || orders.length === 0) {
      getAllOrders();
    }
  }, [orders, getAllOrders]);

  if (ordersLoading)
    return <p className="text-center mt-6 text-gray-600">Loading orders...</p>;
  if (!orders || orders.length === 0)
    return <p className="text-center mt-6 text-gray-500">No orders found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
        All Orders
      </h2>

      {/* Orders List */}
      <div className="grid gap-4 sm:gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <span className="font-semibold text-sm sm:text-base">
                Order ID:
              </span>
              <span className="text-sm sm:text-base break-words">
                {order._id}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <span className="font-semibold text-sm sm:text-base">User:</span>
              <span className="text-sm sm:text-base">
                {order.userId?.name} ({order.userId?.email})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
              <span className="font-semibold text-sm sm:text-base">
                Status:
              </span>
              <span
                className={`font-semibold text-sm sm:text-base ${
                  order.status === "Delivered"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center font-semibold mt-2">
              <span className="text-sm sm:text-base">Total:</span>
              <span className="text-sm sm:text-base">
                ₹{order.totalAmount}
              </span>
            </div>

            <button
              onClick={() => setSelectedOrder(order)}
              className="mt-4 w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Order Details
            </h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-lg"
            >
              &times;
            </button>

            <div className="space-y-2 text-sm sm:text-base">
              <div>
                <strong>Order ID:</strong> {selectedOrder._id}
              </div>
              <div>
                <strong>User:</strong>{" "}
                {selectedOrder.userId?.name} ({selectedOrder.userId?.email})
              </div>
              <div>
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
              <div>
                <strong>Created At:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Medicines:</strong>
                <ul className="ml-4 mt-1 list-disc">
                  {selectedOrder.medicines.map((item) => (
                    <li key={item.medicineId?._id} className="mb-1">
                      {item.medicineId?.name || "Deleted Medicine"} ×{" "}
                      {item.quantity} - ₹
                      {(item.medicineId?.price || 0) * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between font-semibold mt-4 text-sm sm:text-base">
              <span>Total Amount:</span>
              <span>₹{selectedOrder.totalAmount}</span>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
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

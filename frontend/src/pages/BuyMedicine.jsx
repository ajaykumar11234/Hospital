import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContextProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function BuyMedicine() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Fetch all medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/medicines/allStock`, {
          headers: { token },
        });
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to fetch medicines");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMedicines();
  }, [backendUrl, token]);

  const addToCart = (product) => {
    if (product.stock === 0) {
      toast.error("Out of Stock!");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing)
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item._id !== id));

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const initPay = (razorpayOrder) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Medicine Shop",
      description: "Medicine purchase",
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
          const { data } = await axios.post(
            `${backendUrl}/api/orders/verify`,
            { razorpay_payment_id, razorpay_order_id, razorpay_signature },
            { headers: { token } }
          );

          if (data.success) {
            toast.success("Payment successful & order placed!");
            setCart([]);
            navigate("/buy-medicine");
          }
        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || "Payment verification failed!");
        }
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    try {
      const medicines = cart.map((item) => ({ _id: item._id, qty: item.qty }));
      const { data } = await axios.post(
        `${backendUrl}/api/orders/checkout`,
        { cart: medicines },
        { headers: { token } }
      );

      if (data.success && data.razorpayOrder) {
        initPay(data.razorpayOrder);
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Checkout failed");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading medicines...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans">
      <h2 className="text-2xl font-semibold mb-6 text-center">Buy Medicine</h2>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-lg p-4 flex flex-col items-center shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <img
              src={product.imageUrl || "https://via.placeholder.com/100x100.png?text=No+Image"}
              alt={product.name}
              className="mb-4 w-28 h-28 object-contain"
            />
            <h3 className="font-semibold mb-1 text-center">{product.name}</h3>
            <p className="mb-1 text-center font-medium">₹{product.price}</p>
            <p
              className={`mb-4 text-center text-sm ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0 ? "" : "Out of Stock"}
            </p>

            {product.stock > 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Cart Section */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Cart</h3>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p>
                    ₹{item.price} × {item.qty}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="mt-2 sm:mt-0 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="text-right font-semibold text-lg">Total: ₹{totalPrice}</p>
            <button
              onClick={handleCheckout}
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyMedicine;

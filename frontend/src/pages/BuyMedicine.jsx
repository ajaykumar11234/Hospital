import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContextProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Search } from "lucide-react";

function BuyMedicine() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Fetch medicines
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

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, qty: Math.max(item.qty - 1, 1) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item._id !== id));

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Payment & Checkout (same as before)
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
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            response;
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
          toast.error(
            error.response?.data?.message || "Payment verification failed!"
          );
        }
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: { color: "#2563eb" },
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

  // === Filtered Products ===
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || p.category?.toLowerCase() === category.toLowerCase();
    const matchesMinPrice = minPrice ? p.price >= Number(minPrice) : true;
    const matchesMaxPrice = maxPrice ? p.price <= Number(maxPrice) : true;
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  if (loading) return <p className="text-center mt-8">Loading medicines...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
      {/* Left side: Products */}
      <div className="lg:col-span-3">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center lg:text-left">
          Buy Medicines Online
        </h2>

        {/* 🔎 Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="painkiller">Painkillers</option>
            <option value="antibiotic">Antibiotics</option>
            <option value="vitamin">Vitamins</option>
            <option value="other">Other</option>
          </select>

          {/* Price Range */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-20 px-2 py-2 border rounded-lg"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 px-2 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500">No medicines match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="border rounded-2xl p-4 bg-white shadow-sm hover:shadow-lg transition flex flex-col"
              >
                <img
                  src={
                    product.imageUrl ||
                    "https://via.placeholder.com/200x200.png?text=No+Image"
                  }
                  alt={product.name}
                  className="mb-4 w-full h-40 object-contain rounded-md"
                />
                <h3 className="font-semibold text-lg mb-1 text-gray-800 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {product.description || "No description available."}
                </p>
                <p className="font-medium text-gray-700 mb-2">
                  ₹{product.price.toFixed(2)}
                </p>
                <p
                  className={`mb-3 text-sm ${
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of Stock"}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`mt-auto w-full px-4 py-2 rounded-xl text-white font-medium transition ${
                    product.stock > 0
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Cart */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6 sticky top-6 h-fit">
        <div className="flex items-center mb-4">
          <ShoppingCart className="mr-2 text-blue-600" />
          <h3 className="text-xl font-semibold">Your Cart</h3>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price} × {item.qty}
                  </p>
                  <p className="font-medium text-gray-700">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => decreaseQty(item._id)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-2">{item.qty}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition mt-4"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyMedicine;

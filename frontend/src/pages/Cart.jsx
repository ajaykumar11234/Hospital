import React from "react";

function Cart({ cart, removeFromCart, placeOrder }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>Cart</h2>
      {cart.map(item => (
        <div key={item._id} className="flex justify-between">
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeFromCart(item._id)}>Remove</button>
        </div>
      ))}
      <h3>Total: ₹{total}</h3>
      <button onClick={placeOrder} className="bg-green-600 text-white px-3 py-1 rounded">
        Place Order
      </button>
    </div>
  );
}

export default Cart;

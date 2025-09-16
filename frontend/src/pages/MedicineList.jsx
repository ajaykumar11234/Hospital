import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

function MedicineList({ addToCart }) {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/medicines")
      .then(res => res.json())
      .then(setMedicines)
      .catch(() => toast.error("Failed to fetch medicines"));
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {medicines.map(med => (
        <div key={med._id} className="border p-4 rounded-md shadow-sm">
          <h3 className="font-semibold">{med.name}</h3>
          <p>{med.brand}</p>
          <p>₹{med.price}</p>
          <button onClick={() => addToCart(med)} className="bg-blue-600 text-white px-3 py-1 rounded">
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default MedicineList;

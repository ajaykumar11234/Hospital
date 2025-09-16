import React, { useEffect, useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";

const MedicineList = () => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const {
    medicines,
    medLoading,
    getAllMedicines,
    updateMedicine,
    deleteMedicine,
  } = useContext(AdminContext);

  // Fetch medicines on mount
  useEffect(() => {
    getAllMedicines();
  }, []);

  // Start editing
  const handleEdit = (med) => {
    setEditingId(med._id);
    setEditData({
      name: med.name,
      brand: med.brand,
      description: med.description,
      category: med.category,
      price: med.price,
      stock: med.stock,
    });
    setImageFile(null);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setImageFile(null);
  };

  // Save update
  const handleUpdate = (id) => {
    updateMedicine(id, editData, imageFile);
    handleCancel();
  };

  if (medLoading) return <p className="text-center mt-4">Loading medicines...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Available Medicines</h2>
      {medicines.length === 0 ? (
        <p>No medicines available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {medicines.map((med) => (
            <div
              key={med._id}
              className="border rounded-lg shadow-md p-4 flex flex-col bg-white"
            >
              <img
                src={imageFile && editingId === med._id ? URL.createObjectURL(imageFile) : med.imageUrl}
                alt={med.name}
                className="w-full h-48 object-contain rounded mb-3"
              />

              {editingId === med._id ? (
                <>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="border rounded px-2 py-1 mb-1 w-full"
                  />
                  <input
                    type="text"
                    value={editData.brand}
                    onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                    className="border rounded px-2 py-1 mb-1 w-full"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="border rounded px-2 py-1 mb-1 w-full"
                  />
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="border rounded px-2 py-1 mb-1 w-full"
                  >
                    <option value="General">General</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Painkiller">Painkiller</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    className="border rounded px-2 py-1 mb-1 w-full"
                  />
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                    className="border rounded px-2 py-1 mb-2 w-full"
                  />
                  <input
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="mb-2"
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleUpdate(med._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mt-2">{med.name}</h3>
                  <p className="text-gray-600">{med.description.length > 80 ? med.description.slice(0, 80) + "..." : med.description}</p>
                  <p className="mt-1">💰 Price: ₹{med.price}</p>
                  <p className="mt-1">📦 Stock: {med.stock}</p>
                  <p className="mt-1">🏷️ Category: {med.category}</p>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => handleEdit(med)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMedicine(med._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineList;

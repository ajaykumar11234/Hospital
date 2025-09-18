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

  // Fetch medicines only if not already loaded
  useEffect(() => {
    if (!medicines || medicines.length === 0) {
      getAllMedicines();
    }
  }, [medicines, getAllMedicines]);

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

  if (medLoading)
    return <p className="text-center mt-4 text-gray-600">Loading medicines...</p>;

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Available Medicines
      </h2>

      {(!medicines || medicines.length === 0) ? (
        <p className="text-gray-500 text-center">No medicines available</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med) => (
            <div
              key={med._id}
              className="border rounded-lg shadow-md p-4 flex flex-col bg-white hover:shadow-lg transition"
            >
              {/* Medicine Image */}
              <img
                src={
                  imageFile && editingId === med._id
                    ? URL.createObjectURL(imageFile)
                    : med.imageUrl
                }
                alt={med.name}
                className="w-full h-40 sm:h-48 object-contain rounded mb-3"
              />

              {/* Editing State */}
              {editingId === med._id ? (
                <>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="border rounded px-2 py-1 mb-1 w-full text-sm sm:text-base"
                    placeholder="Medicine Name"
                  />
                  <input
                    type="text"
                    value={editData.brand}
                    onChange={(e) =>
                      setEditData({ ...editData, brand: e.target.value })
                    }
                    className="border rounded px-2 py-1 mb-1 w-full text-sm sm:text-base"
                    placeholder="Brand"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    className="border rounded px-2 py-1 mb-1 w-full text-sm sm:text-base"
                    placeholder="Description"
                  />
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="border rounded px-2 py-1 mb-1 w-full text-sm sm:text-base"
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
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                    className="border rounded px-2 py-1 mb-1 w-full text-sm sm:text-base"
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) =>
                      setEditData({ ...editData, stock: e.target.value })
                    }
                    className="border rounded px-2 py-1 mb-2 w-full text-sm sm:text-base"
                    placeholder="Stock"
                  />
                  <input
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="mb-2 text-sm"
                  />
                  <div className="flex justify-between gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(med._id)}
                      className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm sm:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg sm:text-xl font-semibold mt-2">
                    {med.name}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {med.description.length > 80
                      ? med.description.slice(0, 80) + "..."
                      : med.description}
                  </p>
                  <p className="mt-1 text-sm sm:text-base">💰 Price: ₹{med.price}</p>
                  <p className="mt-1 text-sm sm:text-base">📦 Stock: {med.stock}</p>
                  <p className="mt-1 text-sm sm:text-base">🏷️ Category: {med.category}</p>
                  <div className="flex justify-between mt-3 gap-2">
                    <button
                      onClick={() => handleEdit(med)}
                      className="flex-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm sm:text-base"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMedicine(med._id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm sm:text-base"
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

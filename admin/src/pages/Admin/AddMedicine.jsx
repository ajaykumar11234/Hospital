import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets_admin/assets";

const AddMedicine = () => {
  const [medImg, setMedImg] = useState(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { backendUrl, aToken } = useContext(AdminContext);
  console.log("Admin token:", aToken);  // <--- add this for debugging


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setMedImg(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (medImg) formData.append("image", medImg);
      formData.append("name", name);
      formData.append("brand", brand);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", Number(price));
      formData.append("stock", Number(stock));

      const { data } = await axios.post(
        `${backendUrl}/api/medicines/add`,
        formData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message || "Medicine added successfully!");
        // reset form
        setMedImg(null);
        setName("");
        setBrand("");
        setDescription("");
        setCategory("General");
        setPrice("");
        setStock("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error(
        error.response?.data?.message || "An error occurred while adding medicine"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Add Medicine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Upload */}
          <div className="col-span-1 flex flex-col items-center">
            <label htmlFor="med-img" className="cursor-pointer">
              <img
                src={medImg ? URL.createObjectURL(medImg) : assets.upload_area}
                alt="Upload area"
                className="w-48 h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
              />
            </label>
            <input
              type="file"
              id="med-img"
              hidden
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-600">Upload medicine image</p>
          </div>

          {/* Main Form */}
          <div className="col-span-2 space-y-4">
            {/* Name + Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Medicine Name"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Brand"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Description */}
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Description"
              className="w-full px-3 py-2 border rounded-md"
            />

            {/* Category + Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="General">General</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Painkiller">Painkiller</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Price"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Stock */}
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Stock Quantity"
              className="w-full px-3 py-2 border rounded-md"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {isSubmitting ? "Adding..." : "Add Medicine"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine;

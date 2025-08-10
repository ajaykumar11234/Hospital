import React, { useState, useContext } from 'react';
import { assets } from '../../assets/assets_admin/assets';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('1 Year');
  const [fees, setFees] = useState('');
  const [about, setAbout] = useState('');
  const [speciality, setSpeciality] = useState('General physician');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading

  const { backendUrl, aToken } = useContext(AdminContext);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setDocImg(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading
    
    try {
      if (!docImg) {
        setIsSubmitting(false);
        return toast.error("Image Not Selected");
      }
      const formData = new FormData();
      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address', JSON.stringify([address1, address2]));

      const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } });

      if (data.success) {
        toast.success(data.message);
        // Clear form after successful submission
        setDocImg(null);
        setName('');
        setEmail('');
        setPassword('');
        setExperience('1 Year');
        setFees('');
        setAbout('');
        setSpeciality('General physician');
        setDegree('');
        setAddress1('');
        setAddress2('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.message.includes('email') || error.response.data.message.includes('Email')) {
          toast.error("Email already exists. Please use a different email address.");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("An error occurred while adding the doctor");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false); // Stop loading regardless of success/error
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Doctor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Upload Section */}
          <div className="col-span-1 flex flex-col items-center">
            <label htmlFor="doc-img" className="cursor-pointer">
              <img 
                src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} 
                alt="Upload area"
                className="w-48 h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
              />
            </label>
            <input 
              type="file" 
              id="doc-img" 
              hidden 
              onChange={handleImageUpload}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-600">Upload doctor picture</p>
          </div>
          
          {/* Main Form Section */}
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Email</label>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              {/* Professional Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <select 
                    name="experience" 
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Year">2 Year</option>
                    <option value="3 Year">3 Year</option>
                    <option value="4 Year">3 Year</option>
                    <option value="5 Year">3 Year</option>
                    <option value="5+ Year">3 Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fees</label>
                  <input 
                    type="number" 
                    placeholder="Fees" 
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                  <select 
                    name="speciality" 
                    id="speciality"
                    value={speciality}
                    onChange={(e) => setSpeciality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    <option value="General physician">General physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Education */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input 
                type="text" 
                placeholder="MBBS" 
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>
            
            {/* Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Address line 1" 
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  required 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                <input 
                  type="text" 
                  placeholder="Address line 2" 
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  required 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* About */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
              <textarea 
                placeholder="About the doctor" 
                rows={5} 
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className={`w-full ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Doctor...
                </>
              ) : (
                'Add Doctor'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddDoctor;
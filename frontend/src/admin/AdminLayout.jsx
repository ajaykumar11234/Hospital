import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Admin/Dashboard';
import DoctorsList from './pages/Admin/DoctorsList';
import AddDoctor from './pages/Admin/AddDoctor';
import AllAppointments from './pages/Admin/AllAppointments';
import MedicineList from './pages/Admin/MedicineList';
import AddMedicine from './pages/Admin/AddMedicine';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminContextProvider, { AdminContext } from './context/AdminContext';
import AppContext from './context/AppContext';

const AdminLayout = () => {
  return (
    <AppContext>
      <AdminContextProvider>
        <AdminRoutes />
      </AdminContextProvider>
    </AppContext>
  );
};

const AdminRoutes = () => {
  const { aToken } = useContext(AdminContext);

  // Check for aToken in both context and localStorage
  const hasAdminToken = aToken || localStorage.getItem('aToken');

  if (!hasAdminToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/appointments" element={<AllAppointments />} />
            <Route path="/medicines" element={<MedicineList />} />
            <Route path="/add-medicine" element={<AddMedicine />} />
            <Route path="/orders" element={<AdminOrders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

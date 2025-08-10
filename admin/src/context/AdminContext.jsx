import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const storedToken = localStorage.getItem('aToken') || '';
  const [aToken, setAToken] = useState(storedToken);
  const [doctors,setDoctors]=useState([]);
  
  const [appointments,setAppointments]=useState([])


  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors= async () => {
  try{
   const {data} =await axios.get(`${backendUrl}/api/admin/all-doctors`, {headers: { atoken: aToken }});
   if(data.success){
   console.log(data.doctors);
    setDoctors(data.doctors);
  }
  else{
  toast.error(data.message || 'Failed to fetch doctors');
  }
  }
  catch(error){
  toast.error(error.message || 'Server Error');
  }
  }


  const changeAvailability = async (docId) => {

  try{
  
    const {data} = await axios.post(`${backendUrl}/api/admin/change-availability`, { docId }, { headers: { atoken: aToken } });

    if(data.success){
    
      toast.success(data.message || 'Doctor availability changed successfully');
      getAllDoctors();
      }
      else{
      toast.error(data.message || 'Failed to change availability');
      }

  }catch(error){
  
  toast.error(error.message || 'Server Error');
  }
  }

const getAllAppointments= async()=>{
try{
const {data} =await axios.get(backendUrl+'/api/admin/appointments',{headers:{aToken}})

if(data.success==true){
console.log(data.appointments)
setAppointments(data.appointments)
}
else{
toast.error(data.message)
}
}
catch(error){
toast.error(error.message || 'Server Error');
}
}
  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,setAppointments,
    getAllAppointments
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;

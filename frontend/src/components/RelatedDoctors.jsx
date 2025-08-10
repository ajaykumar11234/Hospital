import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContextProvider';
import { Link } from 'react-router-dom'; // Only if you want to link to doctor details

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const [relDocs, setRelDocs] = useState([]);

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const filtered = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelDocs(filtered);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Related Doctors</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relDocs.map((doc) => (
          <Link
            to={`/appointment/${doc._id}`} // Optional
            key={doc._id}
            className="p-4 border rounded-lg hover:shadow-md transition bg-white"
          >
            <div className="flex items-center gap-4">
              <img
                src={doc.image}
                alt={doc.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-900">{doc.name}</p>
                <p className="text-sm text-gray-600">{doc.speciality}</p>
                <p className="text-xs text-gray-500">{doc.experience} Experience</p>
              </div>
            </div>
          </Link>
        ))}
        {relDocs.length === 0 && (
          <p className="text-gray-500 text-sm">No related doctors found.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedDoctors;

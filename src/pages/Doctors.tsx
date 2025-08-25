import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService, Doctor } from '../services/dataService';

export function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const doctorsData = await dataService.getAllDoctors();
      // Only show active doctors to patients
      const activeDoctors = doctorsData.filter(doctor => doctor.status === 'active');
      setDoctors(activeDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBookAppointment = (doctorName: string, specialty: string) => {
    navigate('/appointments', { 
      state: { 
        selectedDoctor: doctorName,
        selectedDepartment: specialty 
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Medical Team</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 hover:text-emerald-600 transition-colors duration-300">Our Medical Team</h1>
      {doctors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No doctors are currently available.</p>
          <p className="text-gray-500 mt-2">Please check back later or contact administration.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor) => (
            <div 
              key={doctor._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                  {doctor.name} {typeof doctor.age === 'number' && doctor.age > 0 ? <span className="text-gray-500 text-base">({doctor.age})</span> : null}
                </h3>
                <p className="text-emerald-600 font-medium mb-2">{doctor.specialty}</p>
                <div className="text-gray-600 text-sm space-y-1 group-hover:text-gray-900 transition-colors duration-300">
                  {doctor.education && <p>{doctor.education}</p>}
                  {doctor.experience && <p>Experience: {doctor.experience}</p>}
                  {doctor.phone && <p>Phone: {doctor.phone}</p>}
                </div>
                <button 
                  onClick={() => handleBookAppointment(doctor.name, doctor.specialty)}
                  className="mt-4 w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
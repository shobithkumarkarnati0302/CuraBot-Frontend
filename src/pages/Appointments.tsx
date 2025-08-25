import { useState, useEffect } from 'react';
import { Check, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useLocation } from 'react-router-dom';
import { dataService } from '../services/dataService';

interface AppointmentForm {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  department: string;
  doctor: string;
  reason: string;
  notes: string;
  insuranceProvider: string;
  insuranceNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface Appointment extends AppointmentForm {
  _id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// This will be populated from the database
const doctorsByDept: { [key: string]: string[] } = {};

export function Appointments() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'book' | 'history'>('book');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get pre-selected doctor and department from navigation state
  const navigationState = location.state as { selectedDoctor?: string; selectedDepartment?: string } | null;
  const preSelectedDepartment = navigationState?.selectedDepartment || '';
  const preSelectedDoctor = navigationState?.selectedDoctor || '';

  const [formData, setFormData] = useState<AppointmentForm>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    date: '',
    time: '',
    department: preSelectedDepartment,
    doctor: preSelectedDoctor,
    reason: '',
    notes: '',
    insuranceProvider: '',
    insuranceNumber: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'department') {
        // Find first doctor in selected specialty
        const doctorsInDept = doctors.filter(doc => doc.specialty === value);
        newData.doctor = doctorsInDept.length > 0 ? doctorsInDept[0].name : '';
      }
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Personal Information
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.phone.match(/^[\d\s\-\(\)\+]{10,}$/)) {
      newErrors.phone = 'Valid phone number is required';
    }
    
    // Appointment Details
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await dataService.createAppointment(formData);
        setIsSubmitted(true);
        setError(null);
      } catch (error: any) {
        console.error('Error booking appointment:', error);
        setError(error.message || 'Failed to book appointment. Please try again.');
      }
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const allAppointments = await dataService.getAllAppointments();
      
      // Filter appointments for current user by email
      const userAppointments = allAppointments.filter(apt => 
        apt.email === user.email || apt.patientEmail === user.email
      );
      
      setAppointments(userAppointments as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setAppointments(appointments.filter(apt => apt._id !== appointmentId));
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  useEffect(() => {
    fetchDoctors();
    if (activeTab === 'history') {
      fetchAppointments();
    }
    
    // Subscribe to appointment changes for real-time updates
    const unsubscribe = dataService.subscribeToDataChanges('appointments', fetchAppointments);
    const unsubscribePatient = dataService.subscribeToDataChanges('patient-dashboard', fetchAppointments);
    
    return () => {
      unsubscribe();
      unsubscribePatient();
    };
  }, [activeTab, user]);

  const fetchDoctors = async () => {
    try {
      const doctorsData = await dataService.getAllDoctors();
      // Only show active doctors
      const activeDoctors = doctorsData.filter(doctor => doctor.status === 'active');
      setDoctors(activeDoctors);
      
      // Update doctorsByDept for compatibility
      const deptMap: { [key: string]: string[] } = {};
      activeDoctors.forEach(doctor => {
        if (!deptMap[doctor.specialty]) {
          deptMap[doctor.specialty] = [];
        }
        deptMap[doctor.specialty].push(doctor.name);
      });
      Object.assign(doctorsByDept, deptMap);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: user?.name || '',
                email: user?.email || '',
                phone: '',
                date: '',
                time: '',
                department: 'General Medicine',
                doctor: doctorsByDept['General Medicine'][0],
                reason: '',
                notes: '',
                insuranceProvider: '',
                insuranceNumber: '',
                emergencyContact: '',
                emergencyPhone: ''
              });
            }}
            className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Appointments</h1>
        
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="flex border-b h-16 rounded-t-lg">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'book'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Book Appointment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Appointment History
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'book' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book New Appointment</h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors.fullName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details Section */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          {Object.keys(doctorsByDept).map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                        <select
                          name="doctor"
                          value={formData.doctor}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          {doctorsByDept[formData.department as keyof typeof doctorsByDept]?.map(doctor => (
                            <option key={doctor} value={doctor}>{doctor}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors.date ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                        <select
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors.time ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select a time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit *</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                            errors.reason ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Describe your symptoms or reason for visit"
                        />
                        {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                        <input
                          type="text"
                          name="insuranceProvider"
                          value={formData.insuranceProvider}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter your insurance provider"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
                        <input
                          type="text"
                          name="insuranceNumber"
                          value={formData.insuranceNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter your insurance number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Emergency contact name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Phone</label>
                        <input
                          type="tel"
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Emergency contact phone"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Any additional information or special requests"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex justify-center pt-6">
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-8 py-3 rounded-md hover:bg-emerald-700 transition-colors font-semibold text-lg"
                    >
                      Book Appointment
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Appointments</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading appointments...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'scheduled' ? 'bg-emerald-100 text-emerald-800' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-1">{appointment.department}</p>
                            <p className="text-gray-600 mb-1">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {appointment.date} at {appointment.time}
                            </p>
                            <p className="text-gray-600">{appointment.reason}</p>
                          </div>
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => cancelAppointment(appointment._id)}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Cancel appointment"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

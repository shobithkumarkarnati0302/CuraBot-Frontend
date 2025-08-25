import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Circle, Search, Filter } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { dataService, AppointmentData } from '../services/dataService';

export const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const allAppointments = await dataService.getAllAppointments();
      const allPatients = await dataService.getAllPatients();
      
      const doctorAppointments = allAppointments.filter((apt: AppointmentData) => {
        // Check all possible doctor name fields
        const doctorFields = [apt.doctorName, apt.doctor, (apt as any).fullName];
        const userName = user?.name?.toLowerCase() || '';
        
        const matches = doctorFields.some(field => {
          if (!field) return false;
          const fieldLower = field.toLowerCase();
          return fieldLower === userName || fieldLower.includes(userName);
        });
        
        return matches;
      });

      // Enhance appointments with patient details
      const enhancedAppointments = doctorAppointments.map(apt => {
        const patient = allPatients.find(p => 
          p.email === ((apt as any).email || apt.patientEmail) || 
          p.name === ((apt as any).fullName || apt.patientName)
        );
        
        return {
          ...apt,
          patientAge: patient?.age,
          patientBloodGroup: patient?.bloodGroup,
          patientGender: patient?.gender,
          patientAllergies: patient?.allergies,
          patientMedicalHistory: patient?.medicalHistory,
          patientPhone: (apt as any).phone || apt.patientPhone || patient?.phone,
          patientEmail: (apt as any).email || apt.patientEmail || patient?.email,
          condition: apt.condition || apt.reason || 'General consultation'
        };
      });

      setAppointments(enhancedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage({ type: 'error', text: 'Failed to fetch appointments' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (appointmentId: string, currentCompleted: boolean) => {
    try {
      const updatedStatus = currentCompleted ? 'confirmed' : 'completed';
      await dataService.updateAppointmentStatus(appointmentId, updatedStatus, !currentCompleted);
      
      setAppointments(prev => prev.map(apt => 
        apt._id === appointmentId 
          ? { ...apt, completed: !currentCompleted, status: updatedStatus }
          : apt
      ));
      
      setMessage({ 
        type: 'success', 
        text: `Appointment marked as ${!currentCompleted ? 'completed' : 'pending'}` 
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setMessage({ type: 'error', text: 'Failed to update appointment status' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = (appointment as any).fullName || appointment.patientName || '';
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (appointment.condition || appointment.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (appointment.patientEmail || appointment.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && appointment.completed) ||
                         (statusFilter === 'pending' && !appointment.completed);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (appointment: AppointmentData) => {
    if (appointment.completed) return 'bg-green-100 text-green-800';
    if (appointment.status === 'confirmed') return 'bg-blue-100 text-blue-800';
    if (appointment.status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (appointment: AppointmentData) => {
    if (appointment.completed) return 'Completed';
    return appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
  };

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage and track your patient appointments</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>


        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : appointments.length === 0 
                    ? 'No appointments have been booked yet'
                    : 'No appointments match your doctor profile'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {(appointment as any).fullName || appointment.patientName || 'Unknown Patient'}
                            {(appointment as any).patientAge && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Age: {(appointment as any).patientAge})
                              </span>
                            )}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment)}`}>
                          {getStatusText(appointment)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{(appointment as any).phone || appointment.patientPhone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{(appointment as any).email || appointment.patientEmail || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Condition:</span> {appointment.condition || appointment.reason || 'N/A'}
                        </p>
                        {(appointment as any).patientBloodGroup && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Blood Group:</span> {(appointment as any).patientBloodGroup}
                          </p>
                        )}
                        {(appointment as any).patientGender && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Gender:</span> {(appointment as any).patientGender}
                          </p>
                        )}
                        {(appointment as any).patientAllergies && (appointment as any).patientAllergies.length > 0 && (
                          <p className="text-sm text-red-600">
                            <span className="font-medium">Allergies:</span> {(appointment as any).patientAllergies.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-6">
                      <button
                        onClick={() => handleStatusToggle(appointment._id, appointment.completed || false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-emerald-50"
                        title={appointment.completed ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {appointment.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <span className={appointment.completed ? 'text-green-600' : 'text-gray-600'}>
                          {appointment.completed ? 'Completed' : 'Mark Complete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

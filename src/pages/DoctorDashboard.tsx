import React, { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Activity, Bell, FileText } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { dataService, AppointmentData, Doctor } from '../services/dataService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';



export function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
    completedToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [form, setForm] = useState({
    specialty: '',
    experience: '',
    education: '',
    age: '' as string,
    image: '' as string, // base64
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const fetchDoctorData = async () => {
    try {
      setIsLoading(true);
      
      // Use centralized data service to fetch appointments
      const allAppointments = await dataService.getAllAppointments();
      console.log('Doctor Dashboard - All appointments:', allAppointments);
      console.log('Doctor Dashboard - Current user:', user);
      
      // Filter appointments for current doctor by name
      const doctorAppointments = allAppointments.filter((apt: AppointmentData) => {
        const doctorFields = [apt.doctorName, apt.doctor, (apt as any).fullName];
        const userName = user?.name?.toLowerCase() || '';
        
        return doctorFields.some(field => {
          if (!field) return false;
          const fieldLower = field.toLowerCase();
          return fieldLower === userName || fieldLower.includes(userName);
        });
      });
      console.log('Doctor Dashboard - Filtered appointments:', doctorAppointments);
      setAppointments(doctorAppointments);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = doctorAppointments.filter((apt: AppointmentData) => 
        apt.date === today && apt.status === 'scheduled'
      ).length;
      const completedToday = doctorAppointments.filter((apt: AppointmentData) => 
        apt.date === today && apt.status === 'completed'
      ).length;

      // Get all patients to merge profile data
      const allPatients = await dataService.getAllPatients();
      
      // Create patient list from actual appointments, but only include patients that still exist in database
      const uniquePatients = doctorAppointments.reduce((acc: any[], apt: AppointmentData) => {
        // Use fullName from appointment if available, otherwise use patientName
        const patientName = (apt as any).fullName || apt.patientName;
        const patientEmail = (apt as any).email || apt.patientEmail;
        
        // Find matching patient profile data - ONLY include if patient still exists in database
        const patientProfile = allPatients.find(p => p.email === patientEmail);
        
        // Skip this appointment if the patient no longer exists in the database
        if (!patientProfile) {
          console.log('Patient not found in database, skipping:', patientEmail);
          return acc;
        }
        
        const existingPatient = acc.find(p => p.email === patientEmail);
        if (!existingPatient) {
          acc.push({
            _id: patientProfile._id, // Use patient's actual ID, not appointment ID
            name: patientProfile.name || patientName,
            email: patientProfile.email,
            phone: patientProfile.phone || (apt as any).phone || '',
            lastVisit: apt.date,
            condition: apt.reason || 'General consultation',
            // Include profile data from actual patient record
            age: patientProfile.age,
            bloodGroup: patientProfile.bloodGroup,
            gender: patientProfile.gender,
            allergies: patientProfile.allergies || [],
            medicalHistory: patientProfile.medicalHistory || [],
            createdAt: patientProfile.createdAt || apt.date
          });
        } else {
          // Update last visit if this appointment is more recent
          if (new Date(apt.date) > new Date(existingPatient.lastVisit)) {
            existingPatient.lastVisit = apt.date;
            existingPatient.condition = apt.reason || 'General consultation';
          }
        }
        return acc;
      }, []);
      
      setPatients(uniquePatients);
      
      setStats(prev => ({
        ...prev,
        todayAppointments,
        totalAppointments: doctorAppointments.length,
        completedToday,
        totalPatients: uniquePatients.length,
        pendingReports: Math.floor(Math.random() * 5) + 1 // Mock data
      }));
      
      // Fetch current doctor's profile by matching email
      const allDoctors = await dataService.getAllDoctors();
      const me = allDoctors.find(d => d.email.toLowerCase() === (user?.email || '').toLowerCase()) || null;
      setDoctorProfile(me);
      if (me) {
        setForm({
          specialty: me.specialty || '',
          experience: me.experience || '',
          education: me.education || '',
          age: typeof me.age === 'number' ? String(me.age) : '',
          image: me.image || ''
        });
        setImagePreview(me.image || '');
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  // Auto-refresh data every 30 seconds to sync with database changes
  useAutoRefresh(fetchDoctorData, { interval: 30000 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setForm(prev => ({ ...prev, image: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfile?._id) return;
    try {
      setSavingProfile(true);
      const updates: Partial<Doctor> = {
        specialty: form.specialty,
        experience: form.experience,
        education: form.education,
        image: form.image || undefined,
      };
      const ageNum = parseInt(form.age, 10);
      if (!isNaN(ageNum)) updates.age = ageNum;
      await dataService.updateDoctor(doctorProfile._id, updates);
      await fetchDoctorData();
    } catch (err) {
      console.error('Failed to save doctor profile', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
    try {
      console.log(`=== APPOINTMENT UPDATE DEBUG ===`);
      console.log(`Appointment ID: ${appointmentId}`);
      console.log(`New Status: ${status}`);
      console.log('Current user:', user);
      console.log('User token exists:', !!localStorage.getItem('token'));
      console.log('User role:', user?.role);
      
      // Check if appointment exists in current appointments list
      const appointment = appointments.find(apt => apt._id === appointmentId);
      console.log('Found appointment in local state:', appointment);
      
      if (!appointment) {
        throw new Error('Appointment not found in current data');
      }
      
      // Update appointment status via dataService
      console.log('Calling dataService.updateAppointmentStatus...');
      const result = await dataService.updateAppointmentStatus(appointmentId, status);
      console.log('Update result:', result);
      
      // Refresh data to reflect changes
      console.log('Refreshing doctor data...');
      await fetchDoctorData();
      
      console.log(`Successfully updated appointment ${appointmentId} to ${status}`);
      alert(`Appointment marked as ${status} successfully!`);
    } catch (error: any) {
      console.error('=== APPOINTMENT UPDATE ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Show the actual error message from the server
      alert(`Failed to update appointment status: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <DoctorLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today && apt.status === 'scheduled';
  });

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">Here's your medical practice overview for today</p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment._id} className="border-l-4 border-emerald-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{(appointment as any).fullName || appointment.patientName || 'Unknown Patient'}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.time}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment._id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleUpdateAppointmentStatus(appointment._id, 'cancelled')}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Patients</h2>
          
          {patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No patients have booked appointments with you yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-700">
                          {patient.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 transition-colors">
                        View Records
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                        Contact
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Condition:</span>
                      <p className="text-gray-600">{patient.condition}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Visit:</span>
                      <p className="text-gray-600">{new Date(patient.lastVisit).toLocaleDateString()}</p>
                    </div>
                    {patient.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <p className="text-gray-600">{patient.phone}</p>
                      </div>
                    )}
                    {patient.age && (
                      <div>
                        <span className="font-medium text-gray-700">Age:</span>
                        <p className="text-gray-600">{patient.age} years</p>
                      </div>
                    )}
                    {patient.bloodGroup && (
                      <div>
                        <span className="font-medium text-gray-700">Blood Group:</span>
                        <p className="text-gray-600">{patient.bloodGroup}</p>
                      </div>
                    )}
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Allergies:</span>
                        <p className="text-gray-600">{patient.allergies.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Settings */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <input
              type="text"
              value={form.specialty}
              onChange={(e) => setForm(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Cardiology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            <input
              type="text"
              value={form.experience}
              onChange={(e) => setForm(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 8 years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              value={form.education}
              onChange={(e) => setForm(prev => ({ ...prev, education: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., MBBS, MD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm(prev => ({ ...prev, age: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., 35"
              min={0}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <div className="flex items-center space-x-4">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border" />
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              disabled={savingProfile || !doctorProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <FileText className="h-6 w-6 text-emerald-600 mb-2" />
            <h3 className="font-medium text-gray-900">Create Report</h3>
            <p className="text-sm text-gray-600">Generate medical reports</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Users className="h-6 w-6 text-emerald-600 mb-2" />
            <h3 className="font-medium text-gray-900">Patient Records</h3>
            <p className="text-sm text-gray-600">View patient history</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Calendar className="h-6 w-6 text-emerald-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule Management</h3>
            <p className="text-sm text-gray-600">Manage appointments</p>
          </button>
        </div>
      </div>
      </div>
    </DoctorLayout>
  );
}

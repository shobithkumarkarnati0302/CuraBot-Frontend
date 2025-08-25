import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar, MapPin, AlertTriangle, Eye, Heart } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { dataService, Patient } from '../services/dataService';

interface PatientWithAppointments extends Patient {
  lastVisit?: string;
  totalAppointments?: number;
  conditions?: string[];
}

export const DoctorPatients: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientWithAppointments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAppointments | null>(null);

  useEffect(() => {
    fetchDoctorPatients();
  }, []);

  const fetchDoctorPatients = async () => {
    try {
      setIsLoading(true);
      const [allAppointments, allPatients] = await Promise.all([
        dataService.getAllAppointments(),
        dataService.getAllPatients()
      ]);

      // Filter appointments for this doctor
      const doctorAppointments = allAppointments.filter((apt: any) => 
        apt.doctorName === user?.name || apt.doctor === user?.name ||
        apt.doctorName?.toLowerCase().includes(user?.name?.toLowerCase() || '') ||
        apt.doctor?.toLowerCase().includes(user?.name?.toLowerCase() || '')
      );

      // Get unique patients who have appointments with this doctor
      const patientEmails = [...new Set(doctorAppointments.map((apt: any) => 
        apt.patientEmail || apt.email || apt.fullName
      ).filter(Boolean))];
      
      const doctorPatients = allPatients
        .filter(patient => 
          patientEmails.includes(patient.email) || 
          patientEmails.includes(patient.name) ||
          doctorAppointments.some(apt => 
            (apt.fullName === patient.name) || 
            (apt.patientName === patient.name) ||
            (apt.email === patient.email) ||
            (apt.patientEmail === patient.email)
          )
        )
        .map(patient => {
          const patientAppointments = doctorAppointments.filter((apt: any) => 
            apt.patientEmail === patient.email || 
            apt.email === patient.email ||
            apt.fullName === patient.name ||
            apt.patientName === patient.name
          );
          
          const lastAppointment = patientAppointments.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          
          return {
            ...patient,
            lastVisit: lastAppointment?.date,
            totalAppointments: patientAppointments.length,
            conditions: [...new Set(patientAppointments.map((apt: any) => 
              apt.condition || apt.reason || 'General consultation'
            ).filter(Boolean))]
          };
        });

      setPatients(doctorPatients);
    } catch (error) {
      console.error('Error fetching doctor patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    (patient.conditions && patient.conditions.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
          <p className="text-gray-600">Complete details of patients who have appointments with you</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search patients by name, email, phone, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Patients who book appointments with you will appear here'
                }
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {patient.image ? (
                      <img 
                        src={patient.image} 
                        alt={patient.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold text-lg">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        {patient.age && (
                          <p className="text-sm text-gray-600">{patient.age} years old</p>
                        )}
                        {patient.gender && (
                          <p className="text-sm text-gray-600">• {patient.gender}</p>
                        )}
                      </div>
                      {patient.bloodGroup && (
                        <p className="text-sm text-red-600 font-medium mt-1">Blood Group: {patient.bloodGroup}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="View full details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                  
                  {patient.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{patient.phone}</span>
                    </div>
                  )}

                  {patient.address && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{patient.address}</span>
                    </div>
                  )}

                  {patient.lastVisit && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Total appointments: {patient.totalAppointments || 0}</span>
                  </div>

                  {patient.occupation && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Occupation:</span>
                      <span>{patient.occupation}</span>
                    </div>
                  )}

                  {patient.maritalStatus && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Marital Status:</span>
                      <span>{patient.maritalStatus}</span>
                    </div>
                  )}

                  {(patient.height || patient.weight) && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {patient.height && (
                        <span><span className="font-medium">Height:</span> {patient.height}</span>
                      )}
                      {patient.weight && (
                        <span><span className="font-medium">Weight:</span> {patient.weight}</span>
                      )}
                    </div>
                  )}

                  {patient.emergencyContact && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Emergency Contact:</span> {patient.emergencyContact}
                      {patient.emergencyPhone && <span> - {patient.emergencyPhone}</span>}
                    </div>
                  )}

                  {patient.conditions && patient.conditions.length > 0 && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <Heart className="h-4 w-4 text-red-500" />
                      <div>
                        <span className="font-medium">Conditions: </span>
                        <span>{patient.conditions.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="flex items-start space-x-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="font-medium">Allergies: </span>
                        <span>{patient.allergies.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {patient.totalAppointments} appointment{patient.totalAppointments !== 1 ? 's' : ''}
                    </span>
                    {patient.gender && (
                      <span className="text-sm text-gray-500">{patient.gender}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    <div className="flex items-center space-x-4 mb-4">
                      {selectedPatient.image ? (
                        <img 
                          src={selectedPatient.image} 
                          alt={selectedPatient.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 font-semibold text-xl">
                            {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h4>
                        <p className="text-gray-600">{selectedPatient.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedPatient.phone && (
                        <p><span className="font-medium">Phone:</span> {selectedPatient.phone}</p>
                      )}
                      {selectedPatient.age && (
                        <p><span className="font-medium">Age:</span> {selectedPatient.age} years</p>
                      )}
                      {selectedPatient.gender && (
                        <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
                      )}
                      {selectedPatient.bloodGroup && (
                        <p><span className="font-medium">Blood Group:</span> {selectedPatient.bloodGroup}</p>
                      )}
                      {selectedPatient.height && (
                        <p><span className="font-medium">Height:</span> {selectedPatient.height}</p>
                      )}
                      {selectedPatient.weight && (
                        <p><span className="font-medium">Weight:</span> {selectedPatient.weight}</p>
                      )}
                      {selectedPatient.occupation && (
                        <p><span className="font-medium">Occupation:</span> {selectedPatient.occupation}</p>
                      )}
                      {selectedPatient.maritalStatus && (
                        <p><span className="font-medium">Marital Status:</span> {selectedPatient.maritalStatus}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact & Medical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact & Medical Info</h3>
                    
                    {selectedPatient.address && (
                      <div>
                        <p className="font-medium">Address:</p>
                        <p className="text-gray-600">{selectedPatient.address}</p>
                      </div>
                    )}
                    
                    {(selectedPatient.emergencyContact || selectedPatient.emergencyPhone) && (
                      <div>
                        <p className="font-medium">Emergency Contact:</p>
                        {selectedPatient.emergencyContact && (
                          <p className="text-gray-600">{selectedPatient.emergencyContact}</p>
                        )}
                        {selectedPatient.emergencyPhone && (
                          <p className="text-gray-600">{selectedPatient.emergencyPhone}</p>
                        )}
                      </div>
                    )}
                    
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
                      <div>
                        <p className="font-medium">Medical History:</p>
                        <ul className="text-gray-600 list-disc list-inside">
                          {selectedPatient.medicalHistory.map((history, index) => (
                            <li key={index}>{history}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <div>
                        <p className="font-medium text-red-600">Allergies:</p>
                        <ul className="text-red-600 list-disc list-inside">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <li key={index}>{allergy}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium">Appointment History:</p>
                      <p className="text-gray-600">
                        Total appointments: {selectedPatient.totalAppointments}
                      </p>
                      {selectedPatient.lastVisit && (
                        <p className="text-gray-600">
                          Last visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                        </p>
                      )}
                      {selectedPatient.conditions && selectedPatient.conditions.length > 0 && (
                        <p className="text-gray-600">
                          Conditions treated: {selectedPatient.conditions.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

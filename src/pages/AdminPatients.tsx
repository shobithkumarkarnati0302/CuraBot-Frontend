import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Activity, 
  Search, 
  Filter, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  User, 
  MapPin,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { AdminLayout } from '../layouts/AdminLayout';
import { dataService, Patient } from '../services/dataService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

export function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const patientsData = await dataService.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Auto-refresh data every 30 seconds
  useAutoRefresh(fetchPatients, { interval: 30000 });

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayRegistrations = patients.filter(patient => {
    const today = new Date().toDateString();
    return patient.createdAt && new Date(patient.createdAt).toDateString() === today;
  }).length;

  const totalBloodGroups = [...new Set(patients.map(patient => patient.bloodGroup).filter(Boolean))].length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage all registered patients</p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </button>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{todayRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Heart className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blood Groups</p>
                <p className="text-2xl font-bold text-gray-900">{totalBloodGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Activity className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                            {patient.image ? (
                              <img src={patient.image} alt={patient.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-lg font-medium text-gray-700">
                                {patient.name?.split(' ').map(n => n[0]).join('') || 'PT'}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{patient.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.age || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.bloodGroup || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button className="text-purple-600 hover:text-purple-900 mr-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients found. Patient registrations will appear here.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Patient Details</h3>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                  {selectedPatient.image ? (
                    <img src={selectedPatient.image} alt={selectedPatient.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-medium text-gray-700">
                      {selectedPatient.name?.split(' ').map(n => n[0]).join('') || 'PT'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{selectedPatient.name}</h4>
                  <p className="text-gray-600">{selectedPatient.age ? `${selectedPatient.age} years old` : 'Age not specified'}</p>
                  <p className="text-gray-600">{selectedPatient.gender || 'Gender not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPatient.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPatient.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm">{selectedPatient.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Medical Information</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Blood Group:</span>
                      <span className="text-sm ml-2">{selectedPatient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Height:</span>
                      <span className="text-sm ml-2">{selectedPatient.height || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Weight:</span>
                      <span className="text-sm ml-2">{selectedPatient.weight || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Marital Status:</span>
                      <span className="text-sm ml-2">{selectedPatient.maritalStatus || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedPatient.occupation && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Personal Information</h5>
                  <p className="text-sm text-gray-600">Occupation: {selectedPatient.occupation}</p>
                </div>
              )}
              
              {(selectedPatient.allergies && selectedPatient.allergies.length > 0) && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Allergies</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0) && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Medical History</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalHistory.map((condition, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPatient.emergencyContactName && (
                <div className="mt-6">
                  <h5 className="font-medium text-gray-900 mb-2">Emergency Contact</h5>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Name: {selectedPatient.emergencyContactName}</p>
                    <p className="text-sm text-gray-600">Phone: {selectedPatient.emergencyContactPhone || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

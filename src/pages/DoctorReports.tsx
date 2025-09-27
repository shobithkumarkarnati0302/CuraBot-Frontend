import React, { useState, useEffect } from 'react';
import { Eye, Plus, Search, X, FileText, Calendar, User, Edit, Clock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { DoctorLayout } from '../layouts/DoctorLayout';
import { dataService, AppointmentData } from '../services/dataService';
import axios from 'axios';

interface Report {
  _id: string;
  patientId: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
  };
  appointmentId: string;
  title: string;
  diagnosis: string;
  prescription: string;
  recommendations: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const DoctorReports: React.FC = () => {
  const { user } = useAuth();
  const [completedAppointments, setCompletedAppointments] = useState<AppointmentData[]>([]);
  const [existingReports, setExistingReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editReportForm, setEditReportForm] = useState({
    title: '',
    diagnosis: '',
    prescription: '',
    recommendations: '',
    notes: ''
  });
  const [reportForm, setReportForm] = useState({
    title: '',
    diagnosis: '',
    prescription: '',
    recommendations: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch completed appointments
      const allAppointments = await dataService.getAllAppointments();
      const allPatients = await dataService.getAllPatients();
      
      const doctorAppointments = allAppointments.filter((apt: AppointmentData) => {
        const doctorFields = [apt.doctorName, apt.doctor, (apt as any).fullName];
        const userName = user?.name?.toLowerCase() || '';
        
        const matches = doctorFields.some(field => {
          if (!field) return false;
          const fieldLower = field.toLowerCase();
          return fieldLower === userName || fieldLower.includes(userName);
        });
        
        return matches && apt.completed;
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
          patientPhone: (apt as any).phone || apt.patientPhone || patient?.phone,
          patientEmail: (apt as any).email || apt.patientEmail || patient?.email,
          condition: apt.condition || apt.reason || 'General consultation'
        };
      });

      setCompletedAppointments(enhancedAppointments);

      // Fetch existing reports
      const token = localStorage.getItem('token');
      try {
        const reportsResponse = await axios.get('http://localhost:5000/api/reports/doctor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ensure we always set an array
        setExistingReports(Array.isArray(reportsResponse.data) ? reportsResponse.data : []);
      } catch (reportsError) {
        console.error('Error fetching reports:', reportsError);
        // Set empty array if reports fetch fails
        setExistingReports([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setReportForm({
      title: `Medical Report - ${(appointment as any).fullName || appointment.patientName}`,
      diagnosis: '',
      prescription: '',
      recommendations: '',
      notes: ''
    });
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsSubmittingReport(true);
    try {
      const token = localStorage.getItem('token');
      const reportData = {
        appointmentId: selectedAppointment._id,
        title: reportForm.title,
        diagnosis: reportForm.diagnosis,
        prescription: reportForm.prescription,
        recommendations: reportForm.recommendations,
        notes: reportForm.notes
      };
      
      console.log('Creating report with data:', reportData);
      console.log('Selected appointment:', selectedAppointment);
      
      // Check if report already exists before making the API call
      const existingReport = existingReports.find(report => report.appointmentId === selectedAppointment._id);
      if (existingReport) {
        setMessage({ type: 'error', text: 'A report already exists for this appointment!' });
        return;
      }
      
      await axios.post('http://localhost:5000/api/reports', reportData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Report generated successfully!' });
      setShowReportModal(false);
      setSelectedAppointment(null);
      setReportForm({
        title: '',
        diagnosis: '',
        prescription: '',
        recommendations: '',
        notes: ''
      });
      
      // Refresh the data to update both appointments and reports
      await fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('=== FRONTEND ERROR ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('Request config:', error.config);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to generate report: ${error.message}` 
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedAppointment(null);
    setReportForm({
      title: '',
      diagnosis: '',
      prescription: '',
      recommendations: '',
      notes: ''
    });
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedReport(null);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setEditReportForm({
      title: report.title,
      diagnosis: report.diagnosis,
      prescription: report.prescription,
      recommendations: report.recommendations,
      notes: report.notes || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedReport(null);
    setEditReportForm({
      title: '',
      diagnosis: '',
      prescription: '',
      recommendations: '',
      notes: ''
    });
  };

  const handleEditReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !user?._id) return;

    setIsSubmittingReport(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/reports/${selectedReport._id}`,
        editReportForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'Report updated successfully!' });
        closeEditModal();
        await fetchData(); // Refresh the data
      }
    } catch (error: any) {
      console.error('Error updating report:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update report. Please try again.' 
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getAppointmentsWithoutReports = () => {
    // Ensure existingReports is an array before using .some()
    const reportsArray = Array.isArray(existingReports) ? existingReports : [];
    
    // Filter out appointments that already have reports
    const filtered = completedAppointments.filter(appointment => {
      const hasReport = reportsArray.some(report => {
        // Check both string and ObjectId formats for appointmentId
        return report.appointmentId === appointment._id || 
               report.appointmentId?.toString() === appointment._id?.toString();
      });
      return !hasReport;
    });
    
    return filtered;
  };

  const filteredAppointments = getAppointmentsWithoutReports().filter(appointment => {
    const patientName = (appointment as any).fullName || appointment.patientName || '';
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (appointment.condition || appointment.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredReports = Array.isArray(existingReports) ? existingReports.filter(report => 
    (report.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical Reports</h1>
          <p className="text-gray-600">Generate reports for completed appointments and view existing reports</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search appointments or reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Appointments Needing Reports */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Generate Reports ({filteredAppointments.length})
              </h2>
              
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Pending Reports</h3>
                  <p className="text-gray-500">All completed appointments have reports generated.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {(appointment as any).fullName || appointment.patientName}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{appointment.condition}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleGenerateReport(appointment)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Generate Report</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Reports */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Generated Reports ({filteredReports.length})
              </h2>
              
              {filteredReports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Reports Generated</h3>
                  <p className="text-gray-500">Reports you generate will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredReports.map((report) => (
                    <div key={report._id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                          <div className="text-sm text-gray-600 mb-3">
                            <span>Generated on {new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Diagnosis:</span> {report.diagnosis}</p>
                            <p className="text-sm"><span className="font-medium">Prescription:</span> {report.prescription}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View report details"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">View</span>
                          </button>
                          <button
                            onClick={() => handleEditReport(report)}
                            className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Edit report"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Generated
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report View Modal */}
        {showViewModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Medical Report Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Report Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Generated:</span>
                      <p className="text-gray-600">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Doctor:</span>
                      <p className="text-gray-600">Dr. {selectedReport.doctorId.name}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedReport.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedReport.diagnosis}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedReport.prescription}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedReport.recommendations}</p>
                </div>

                {selectedReport.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selectedReport.notes}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={closeViewModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Edit Modal */}
        {showEditModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Edit Medical Report</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleEditReportSubmit} className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Report Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Original Date:</span>
                      <p className="text-gray-600">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Patient:</span>
                      <p className="text-gray-600">{(selectedReport.patientId as any)?.name || selectedReport.patientId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    value={editReportForm.title}
                    onChange={(e) => setEditReportForm({ ...editReportForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    id="edit-diagnosis"
                    rows={3}
                    value={editReportForm.diagnosis}
                    onChange={(e) => setEditReportForm({ ...editReportForm, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-prescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription *
                  </label>
                  <textarea
                    id="edit-prescription"
                    rows={3}
                    value={editReportForm.prescription}
                    onChange={(e) => setEditReportForm({ ...editReportForm, prescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-recommendations" className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendations *
                  </label>
                  <textarea
                    id="edit-recommendations"
                    rows={3}
                    value={editReportForm.recommendations}
                    onChange={(e) => setEditReportForm({ ...editReportForm, recommendations: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="edit-notes"
                    rows={2}
                    value={editReportForm.notes}
                    onChange={(e) => setEditReportForm({ ...editReportForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Any additional notes or observations..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingReport ? 'Updating...' : 'Update Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Generation Modal */}
        {showReportModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Generate Medical Report</h3>
                <button
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Name:</span> {(selectedAppointment as any).fullName || selectedAppointment.patientName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(selectedAppointment.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Condition:</span> {selectedAppointment.condition || selectedAppointment.reason || 'N/A'}
                  </p>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={reportForm.title}
                    onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report title"
                  />
                </div>

                <div>
                  <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                    Diagnosis *
                  </label>
                  <textarea
                    id="diagnosis"
                    required
                    rows={3}
                    value={reportForm.diagnosis}
                    onChange={(e) => setReportForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter diagnosis details"
                  />
                </div>

                <div>
                  <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription *
                  </label>
                  <textarea
                    id="prescription"
                    required
                    rows={3}
                    value={reportForm.prescription}
                    onChange={(e) => setReportForm(prev => ({ ...prev, prescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter prescription details"
                  />
                </div>

                <div>
                  <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendations *
                  </label>
                  <textarea
                    id="recommendations"
                    required
                    rows={3}
                    value={reportForm.recommendations}
                    onChange={(e) => setReportForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter recommendations"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={reportForm.notes}
                    onChange={(e) => setReportForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any additional notes (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeReportModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmittingReport ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

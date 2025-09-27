import { useState, useEffect } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { FileText, Eye, Download, Filter, Search, TrendingUp, Calendar, User, X } from 'lucide-react';
import { dataService, Report, LabRecord } from '../services/dataService';
import { useAuth } from '../lib/AuthContext';
import { config } from '../config/environment';

export function AdminRecords() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'lab-records'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<Report | LabRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('AdminRecords: Fetching data...');
      console.log('AdminRecords: Current user:', user);
      console.log('AdminRecords: User role:', user?.role);
      
      // First, let's test the simple endpoint
      try {
        const testResponse = await fetch(`${config.API_BASE_URL}/reports/test`);
        const testData = await testResponse.json();
        console.log('AdminRecords: Test endpoint response:', testData);
      } catch (testError) {
        console.error('AdminRecords: Test endpoint failed:', testError);
      }
      
      const [reportsData, labRecordsData] = await Promise.all([
        dataService.getAllReports(),
        dataService.getAllLabRecords()
      ]);
      
      console.log('AdminRecords: Reports data received:', reportsData);
      console.log('AdminRecords: Lab records data received:', labRecordsData);
      
      setReports(reportsData);
      setLabRecords(labRecordsData);
    } catch (error) {
      console.error('AdminRecords: Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLabRecords = labRecords.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.doctorName && record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600 mt-1">Centralized medical records and reports management</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {reports.length} Reports • {labRecords.length} Lab Records
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lab Records</p>
                <p className="text-2xl font-bold text-gray-900">{labRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return reportDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <User className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set([...reports.map(r => r.patientId), ...labRecords.map(l => l.patientId)]).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medical Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('lab-records')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lab-records'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lab Records ({labRecords.length})
              </button>
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'reports' ? 'reports' : 'lab records'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : activeTab === 'reports' ? (
              filteredReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{report.patientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.doctorName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{report.diagnosis}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => setSelectedRecord(report)}
                              className="text-emerald-600 hover:text-emerald-900 mr-3 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No medical reports found</p>
                  <p className="text-sm mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'Reports will appear here as doctors generate them'}
                  </p>
                </div>
              )
            ) : (
              filteredLabRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLabRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{record.testType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{record.doctorName || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : record.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.testDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => setSelectedRecord(record)}
                              className="text-emerald-600 hover:text-emerald-900 mr-3 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No lab records found</p>
                  <p className="text-sm mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'Lab records will appear here as they are created'}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {'diagnosis' in selectedRecord ? 'Medical Report Details' : 'Lab Record Details'}
                  </h2>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Patient Name</label>
                        <p className="text-gray-900 font-medium">{selectedRecord.patientName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          {'diagnosis' in selectedRecord ? 'Doctor' : 'Test Type'}
                        </label>
                        <p className="text-gray-900">
                          {'diagnosis' in selectedRecord ? selectedRecord.doctorName : selectedRecord.testType}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Date Created</label>
                        <p className="text-gray-900">
                          {new Date('diagnosis' in selectedRecord ? selectedRecord.createdAt : selectedRecord.testDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Record ID</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedRecord._id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Report Details */}
                  {'diagnosis' in selectedRecord && (
                    <>
                      <div className="bg-emerald-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Medical Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-2">Diagnosis</label>
                            <p className="text-emerald-900 bg-white p-4 rounded-md border border-emerald-200">
                              {selectedRecord.diagnosis}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-2">Prescription</label>
                            <p className="text-emerald-900 bg-white p-4 rounded-md border border-emerald-200">
                              {selectedRecord.prescription}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-2">Recommendations</label>
                            <p className="text-emerald-900 bg-white p-4 rounded-md border border-emerald-200">
                              {selectedRecord.recommendations}
                            </p>
                          </div>
                          {selectedRecord.notes && (
                            <div>
                              <label className="block text-sm font-medium text-emerald-700 mb-2">Additional Notes</label>
                              <p className="text-emerald-900 bg-white p-4 rounded-md border border-emerald-200">
                                {selectedRecord.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Lab Record Details */}
                  {'testType' in selectedRecord && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Lab Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Test Type</label>
                            <p className="text-blue-900 font-medium">{selectedRecord.testType}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              selectedRecord.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : selectedRecord.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {selectedRecord.status}
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">Test Date</label>
                            <p className="text-blue-900">{new Date(selectedRecord.testDate).toLocaleDateString()}</p>
                          </div>
                          {selectedRecord.doctorName && (
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-1">Ordered by</label>
                              <p className="text-blue-900">{selectedRecord.doctorName}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Test Results</label>
                          <p className="text-blue-900 bg-white p-4 rounded-md border border-blue-200">
                            {selectedRecord.results}
                          </p>
                        </div>
                        {selectedRecord.notes && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-blue-700 mb-2">Notes</label>
                            <p className="text-blue-900 bg-white p-4 rounded-md border border-blue-200">
                              {selectedRecord.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}

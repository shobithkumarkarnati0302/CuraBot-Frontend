import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, User, Stethoscope, AlertCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import api from '../config/api';
import jsPDF from 'jspdf';

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

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/reports/patient', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setReports(data);
    } catch (error: any) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (report: Report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = '#059669'; // Emerald-600
    const secondaryColor = '#6B7280'; // Gray-500
    const textColor = '#1F2937'; // Gray-800
    
    // Header with CURABOT branding
    doc.setFillColor(5, 150, 105); // Emerald background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // CURABOT logo/title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CURABOT', 20, 25);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Healthcare Management System', 20, 32);
    
    // Report title
    doc.setTextColor(textColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL REPORT', 20, 55);
    
    // Report date and ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 62);
    doc.text(`Report ID: ${report._id.slice(-8).toUpperCase()}`, 20, 68);
    
    // Divider line
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.5);
    doc.line(20, 75, pageWidth - 20, 75);
    
    let yPosition = 85;
    
    // Patient Information Section
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 20, yPosition);
    yPosition += 10;
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user?.name || 'N/A'}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Report Date: ${new Date(report.createdAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;
    
    // Doctor Information Section
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDING PHYSICIAN', 20, yPosition);
    yPosition += 10;
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Doctor: Dr. ${report.doctorId.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Specialization: ${report.doctorId.specialization}`, 20, yPosition);
    yPosition += 15;
    
    // Report Title Section
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT TITLE', 20, yPosition);
    yPosition += 10;
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const titleLines = doc.splitTextToSize(report.title, pageWidth - 40);
    doc.text(titleLines, 20, yPosition);
    yPosition += titleLines.length * 7 + 10;
    
    // Diagnosis Section
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSIS', 20, yPosition);
    yPosition += 10;
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const diagnosisLines = doc.splitTextToSize(report.diagnosis, pageWidth - 40);
    doc.text(diagnosisLines, 20, yPosition);
    yPosition += diagnosisLines.length * 7 + 10;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Prescription Section
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', 20, yPosition);
    yPosition += 10;
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const prescriptionLines = doc.splitTextToSize(report.prescription, pageWidth - 40);
    doc.text(prescriptionLines, 20, yPosition);
    yPosition += prescriptionLines.length * 7 + 10;
    
    // Recommendations Section
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATIONS', 20, yPosition);
    yPosition += 10;
    
    doc.setTextColor(textColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const recommendationsLines = doc.splitTextToSize(report.recommendations, pageWidth - 40);
    doc.text(recommendationsLines, 20, yPosition);
    yPosition += recommendationsLines.length * 7 + 10;
    
    // Additional Notes (if any)
    if (report.notes && report.notes.trim()) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setTextColor(primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ADDITIONAL NOTES', 20, yPosition);
      yPosition += 10;
      
      doc.setTextColor(textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(report.notes, pageWidth - 40);
      doc.text(notesLines, 20, yPosition);
      yPosition += notesLines.length * 7 + 15;
    }
    
    // Footer
    const footerY = pageHeight - 20;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    doc.setTextColor(secondaryColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated medical report from CURABOT Healthcare Management System.', 20, footerY - 3);
    doc.text('For any queries, please contact your healthcare provider.', 20, footerY + 3);
    
    // Save the PDF
    const fileName = `CURABOT_Medical_Report_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(report.createdAt).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.doctorId.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'recent') {
      const reportDate = new Date(report.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && reportDate >= thirtyDaysAgo;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Reports</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access and download your medical reports generated by your doctors
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by title, diagnosis, or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="all">All Reports</option>
                <option value="recent">Recent (30 days)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reports Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterBy !== 'all' 
                ? 'No reports match your search criteria.' 
                : 'You don\'t have any medical reports yet. Reports will appear here after your doctor generates them.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-emerald-600" />
                          <span>Dr. {report.doctorId.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 mr-2 text-emerald-600" />
                          <span>{report.doctorId.specialization}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Diagnosis:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">{report.diagnosis}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Prescription:</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.prescription}</p>
                  </div>

                  <button
                    onClick={() => downloadReport(report)}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Construction, Clock } from 'lucide-react';
import { DoctorLayout } from '../layouts/DoctorLayout';

export const DoctorReports: React.FC = () => {
  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Patient reports, statistics, and medical analytics</p>
        </div>

        {/* Under Development Message */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
              <Construction className="h-12 w-12 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h2>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              The Reports & Analytics section is currently being developed. This feature will include:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <FileText className="h-8 w-8 text-blue-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Patient Reports</h3>
                <p className="text-sm text-gray-600">Detailed medical reports and patient history summaries</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <Clock className="h-8 w-8 text-green-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Appointment Analytics</h3>
                <p className="text-sm text-gray-600">Statistics on appointment trends and patient flow</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <FileText className="h-8 w-8 text-purple-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Medical Insights</h3>
                <p className="text-sm text-gray-600">Treatment outcomes and medical data analysis</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-blue-800 font-medium mb-2">Coming Soon!</p>
              <p className="text-blue-700 text-sm">
                We're working hard to bring you comprehensive reporting and analytics tools. 
                Stay tuned for updates in future releases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

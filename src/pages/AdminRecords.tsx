import { AdminLayout } from '../layouts/AdminLayout';
import { FileText, Construction, Clock } from 'lucide-react';

export function AdminRecords() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600 mt-1">Centralized medical records management system</p>
          </div>
        </div>

        {/* Under Development Message */}
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
              <Construction className="h-12 w-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h2>
            <p className="text-lg text-gray-600 mb-6">
              The Medical Records management system is currently being developed and will be available soon.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-start">
                <FileText className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                <div className="text-left">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Upcoming Features:</h3>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Patient medical history tracking</li>
                    <li>• Lab results and test reports</li>
                    <li>• Prescription management</li>
                    <li>• Digital document storage</li>
                    <li>• Medical imaging integration</li>
                    <li>• Treatment plan documentation</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center text-gray-500">
              <Clock className="h-5 w-5 mr-2" />
              <span>Expected completion: Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

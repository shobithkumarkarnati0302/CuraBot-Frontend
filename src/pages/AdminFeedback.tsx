import { AdminLayout } from '../layouts/AdminLayout';
import { MessageSquare, Construction, Clock } from 'lucide-react';

export function AdminFeedback() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Feedback</h1>
            <p className="text-gray-600 mt-1">Monitor and manage patient feedback and reviews</p>
          </div>
        </div>

        {/* Under Development Message */}
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
              <Construction className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Under Development</h2>
            <p className="text-lg text-gray-600 mb-6">
              The Patient Feedback management system is currently being developed and will be available soon.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-start">
                <MessageSquare className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div className="text-left">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Upcoming Features:</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Patient satisfaction surveys</li>
                    <li>• Doctor rating and review system</li>
                    <li>• Service quality feedback</li>
                    <li>• Complaint management</li>
                    <li>• Feedback analytics and reporting</li>
                    <li>• Response tracking and follow-up</li>
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
      </div>
    </AdminLayout>
  );
}

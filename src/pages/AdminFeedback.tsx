import { useState, useEffect } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { 
  MessageSquare, 
  Star, 
  Eye, 
  Reply, 
  Filter, 
  Search, 
  TrendingUp, 
  AlertCircle,
  Clock,
  User,
  Calendar,
  X
} from 'lucide-react';

interface Feedback {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  type: 'general' | 'doctor' | 'service' | 'complaint';
  rating: number;
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'responded' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  response?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'complaints' | 'reviews'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockFeedbacks: Feedback[] = [
      {
        _id: '1',
        patientId: 'p1',
        patientName: 'John Smith',
        doctorId: 'd1',
        doctorName: 'Dr. Sarah Wilson',
        appointmentId: 'a1',
        type: 'doctor',
        rating: 5,
        subject: 'Excellent consultation',
        message: 'Dr. Wilson was very thorough and explained everything clearly. Highly recommend!',
        status: 'reviewed',
        priority: 'low',
        createdAt: '2025-01-20T10:30:00Z'
      },
      {
        _id: '2',
        patientId: 'p2',
        patientName: 'Emily Johnson',
        type: 'complaint',
        rating: 2,
        subject: 'Long waiting time',
        message: 'Had to wait for over 2 hours for my appointment. This is unacceptable.',
        status: 'pending',
        priority: 'high',
        createdAt: '2025-01-19T14:15:00Z'
      },
      {
        _id: '3',
        patientId: 'p3',
        patientName: 'Michael Brown',
        doctorId: 'd2',
        doctorName: 'Dr. James Miller',
        type: 'service',
        rating: 4,
        subject: 'Good service overall',
        message: 'The staff was friendly and the facilities were clean. Minor issues with scheduling.',
        status: 'responded',
        priority: 'medium',
        response: 'Thank you for your feedback. We are working on improving our scheduling system.',
        respondedBy: 'Admin Team',
        createdAt: '2025-01-18T09:45:00Z'
      },
      {
        _id: '4',
        patientId: 'p4',
        patientName: 'Lisa Davis',
        type: 'general',
        rating: 5,
        subject: 'Amazing experience',
        message: 'From booking to treatment, everything was smooth and professional.',
        status: 'reviewed',
        priority: 'low',
        createdAt: '2025-01-17T16:20:00Z'
      }
    ];

    setTimeout(() => {
      setFeedbacks(mockFeedbacks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.doctorName && feedback.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'pending' && feedback.status === 'pending') ||
      (activeTab === 'complaints' && feedback.type === 'complaint') ||
      (activeTab === 'reviews' && (feedback.type === 'doctor' || feedback.type === 'service'));

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    complaints: feedbacks.filter(f => f.type === 'complaint').length,
    avgRating: feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0',
    highPriority: feedbacks.filter(f => f.priority === 'high').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Feedback</h1>
            <p className="text-gray-600 mt-1">Monitor and manage patient feedback and reviews</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {stats.total} Total • {stats.pending} Pending
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{stats.complaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <Star className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Feedback', count: stats.total },
                { key: 'pending', label: 'Pending Review', count: stats.pending },
                { key: 'complaints', label: 'Complaints', count: stats.complaints },
                { key: 'reviews', label: 'Reviews', count: feedbacks.filter(f => f.type === 'doctor' || f.type === 'service').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
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
                    placeholder="Search feedback by patient, subject, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Feedback List */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredFeedbacks.length > 0 ? (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{feedback.subject}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                            {feedback.status}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority} priority
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{feedback.patientName}</span>
                          </div>
                          {feedback.doctorName && (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{feedback.doctorName}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          {renderStars(feedback.rating)}
                          <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {feedback.type}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-3">{feedback.message}</p>

                        {feedback.response && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Reply className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Response by {feedback.respondedBy}</span>
                            </div>
                            <p className="text-blue-700">{feedback.response}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button 
                          onClick={() => setSelectedFeedback(feedback)}
                          className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        {feedback.status === 'pending' && (
                          <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                            <Reply className="h-4 w-4" />
                            <span>Respond</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No feedback found</p>
                <p className="text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Feedback will appear here as patients submit them'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                  <button 
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Feedback Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{selectedFeedback.subject}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Patient</label>
                        <p className="text-gray-900">{selectedFeedback.patientName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Type</label>
                        <p className="text-gray-900 capitalize">{selectedFeedback.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Rating</label>
                        <div className="flex items-center space-x-1">
                          {renderStars(selectedFeedback.rating)}
                          <span className="text-sm text-gray-600">({selectedFeedback.rating}/5)</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Status</label>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                          {selectedFeedback.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Message</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedFeedback.message}</p>
                  </div>

                  {/* Response Section */}
                  {selectedFeedback.response ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Response</label>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                        <p className="text-blue-700">{selectedFeedback.response}</p>
                        <p className="text-xs text-blue-600 mt-2">Responded by {selectedFeedback.respondedBy}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Add Response</label>
                      <textarea
                        rows={4}
                        className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Type your response here..."
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => setSelectedFeedback(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {!selectedFeedback.response && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      Send Response
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

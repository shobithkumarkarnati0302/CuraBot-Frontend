
// interface LabRecord {
//   id: string;
//   testName: string;
//   date: string;
//   doctor: string;
//   category: string;
//   status: 'completed' | 'pending' | 'processing';
//   result?: string;
// }

// const mockLabRecords: LabRecord[] = [
//   {
//     id: "LAB001",
//     testName: "Complete Blood Count",
//     date: "2024-03-15",
//     doctor: "Dr. Sarah Johnson",
//     category: "Hematology",
//     status: "completed",
//     result: "Normal"
//   },
//   {
//     id: "LAB002",
//     testName: "Lipid Profile",
//     date: "2024-03-14",
//     doctor: "Dr. Michael Chen",
//     category: "Biochemistry",
//     status: "completed",
//     result: "Slightly Elevated"
//   },
//   {
//     id: "LAB003",
//     testName: "Thyroid Function",
//     date: "2024-03-13",
//     doctor: "Dr. Emily Williams",
//     category: "Endocrinology",
//     status: "processing",
//     result: "Pending"
//   },
//   {
//     id: "LAB004",
//     testName: "Urinalysis",
//     date: "2024-03-12",
//     doctor: "Dr. James Wilson",
//     category: "Pathology",
//     status: "completed",
//     result: "Normal"
//   }
// ];

// export function LabRecords() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<string>('all');
//   const [selectedStatus, setSelectedStatus] = useState<string>('all');
//   const [labRecords, setLabRecords] = useState<LabRecord[]>(mockLabRecords);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newRecordFormData, setNewRecordFormData] = useState<Omit<LabRecord, 'id'>>({
//     testName: '',
//     date: '',
//     doctor: '',
//     category: '',
//     status: 'pending',
//     result: '',
//   });

//   const categories = ['all', 'Hematology', 'Biochemistry', 'Endocrinology', 'Pathology'];
//   const statuses = ['all', 'completed', 'pending', 'processing'];

//   const formCategories = categories.filter(cat => cat !== 'all');
//   const formStatuses = statuses.filter(stat => stat !== 'all');

//   const filteredRecords = labRecords.filter(record => {
//     const matchesSearch = record.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
//     const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    
//     return matchesSearch && matchesCategory && matchesStatus;
//   });

//   const downloadRecord = (record: LabRecord) => {
//     const pdf = new jsPDF();
    
//     // Add header
//     pdf.setFontSize(20);
//     pdf.text('Lab Test Report', 20, 20);
    
//     // Add hospital info
//     pdf.setFontSize(12);
//     pdf.text('MediCare Hospital', 20, 35);
//     pdf.text('123 Healthcare Ave, Medical District', 20, 42);
//     pdf.text('Phone: +1 (555) 123-4567', 20, 49);
    
//     // Add line
//     pdf.line(20, 55, 190, 55);
    
//     // Add test details
//     pdf.setFontSize(14);
//     pdf.text('Test Details', 20, 70);
    
//     pdf.setFontSize(12);
//     pdf.text(`Test ID: ${record.id}`, 20, 85);
//     pdf.text(`Test Name: ${record.testName}`, 20, 95);
//     pdf.text(`Date: ${new Date(record.date).toLocaleDateString()}`, 20, 105);
//     pdf.text(`Doctor: ${record.doctor}`, 20, 115);
//     pdf.text(`Category: ${record.category}`, 20, 125);
//     pdf.text(`Status: ${record.status}`, 20, 135);
//     pdf.text(`Result: ${record.result}`, 20, 145);
    
//     // Save the PDF
//     pdf.save(`lab-report-${record.id}.pdf`);
//   };

//   const getStatusColor = (status: LabRecord['status']) => {
//     switch (status) {
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'processing':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'pending':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setNewRecordFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleAddRecordSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const newRecord: LabRecord = {
//       id: `LAB${Date.now()}`,
//       ...newRecordFormData,
//       result: newRecordFormData.status === 'completed' ? newRecordFormData.result : undefined
//     };
//     setLabRecords(prevRecords => [...prevRecords, newRecord]);
//     setNewRecordFormData({
//       testName: '',
//       date: '',
//       doctor: '',
//       category: '',
//       status: 'pending',
//       result: '',
//     });
//     setShowAddForm(false);
//   };

//   const handleDeleteRecord = (recordId: string) => {
//     setLabRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-4">Lab Records</h1>
//         <p className="text-gray-600">
//           View and download your laboratory test results and reports.
//         </p>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//             <input
//               type="text"
//               placeholder="Search by test name or doctor..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
//             />
//           </div>
          
//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
//             >
//               {categories.map(category => (
//                 <option key={category} value={category}>
//                   {category.charAt(0).toUpperCase() + category.slice(1)}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//           </div>
          
//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//             <select
//               value={selectedStatus}
//               onChange={(e) => setSelectedStatus(e.target.value)}
//               className="pl-10 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
//             >
//               {statuses.map(status => (
//                 <option key={status} value={status}>
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//           </div>
//         </div>
//       </div>

//       {/* Add New Record Button */}
//       <div className="mb-6">
//         <button
//           onClick={() => setShowAddForm(true)}
//           className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
//         >
//           <PlusCircle className="h-5 w-5" />
//           <span>Add New Record</span>
//         </button>
//       </div>

//       {/* Add New Record Form */}
//       {showAddForm && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
//           <div className="relative p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
//             <button
//               onClick={() => setShowAddForm(false)}
//               className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
//             >
//               <X className="h-6 w-6" />
//             </button>
//             <h2 className="text-2xl font-bold mb-6">Add New Lab Record</h2>
//             <form className="space-y-4" onSubmit={handleAddRecordSubmit}>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
//                 <input
//                   type="text"
//                   name="testName"
//                   value={newRecordFormData.testName}
//                   onChange={handleAddFormChange}
//                   required
//                   className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//                 <input
//                   type="date"
//                   name="date"
//                   value={newRecordFormData.date}
//                   onChange={handleAddFormChange}
//                   required
//                   className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
//                 <input
//                   type="text"
//                   name="doctor"
//                   value={newRecordFormData.doctor}
//                   onChange={handleAddFormChange}
//                   required
//                   className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                 <select
//                   name="category"
//                   value={newRecordFormData.category}
//                   onChange={handleAddFormChange}
//                   required
//                   className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
//                 >
//                   <option value="">Select Category</option>
//                   {formCategories.map(category => (
//                     <option key={category} value={category}>
//                       {category.charAt(0).toUpperCase() + category.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <select
//                   name="status"
//                   value={newRecordFormData.status}
//                   onChange={handleAddFormChange}
//                   required
//                   className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
//                 >
//                   {formStatuses.map(status => (
//                     <option key={status} value={status}>
//                       {status.charAt(0).toUpperCase() + status.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               {newRecordFormData.status === 'completed' && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
//                   <textarea
//                     name="result"
//                     value={newRecordFormData.result}
//                     onChange={handleAddFormChange}
//                     rows={2}
//                     className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                     placeholder="Enter test result..."
//                   ></textarea>
//                 </div>
//               )}
//               <div>
//                 <button
//                   type="submit"
//                   className="w-full bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
//                 >
//                   Add Record
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Records List */}
//       <div className="space-y-4">
//         {filteredRecords.map((record) => (
//           <div
//             key={record.id}
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <div className="p-2 bg-emerald-50 rounded-full">
//                   <FileText className="h-6 w-6 text-emerald-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold">{record.testName}</h3>
//                   <p className="text-gray-600">{record.doctor}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => downloadRecord(record)}
//                   className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-md hover:bg-emerald-100 transition-colors text-sm"
//                 >
//                   <Download className="h-4 w-4" />
//                   <span>Download</span>
//                 </button>
//                 <button
//                   onClick={() => handleDeleteRecord(record.id)}
//                   className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors text-sm"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   <span>Delete</span>
//                 </button>
//               </div>
//             </div>
            
//             <div className="mt-4 flex items-center space-x-4 text-sm">
//               <div className="flex items-center text-gray-600">
//                 <Calendar className="h-4 w-4 mr-1" />
//                 {new Date(record.date).toLocaleDateString()}
//               </div>
//               <span className="text-gray-300">|</span>
//               <span className="text-gray-600">{record.category}</span>
//               <span className="text-gray-300">|</span>
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
//                 {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//               </span>
//               {record.status === 'completed' && (
//                 <>
//                   <span className="text-gray-300">|</span>
//                   <span className="text-gray-600">Result: {record.result}</span>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, PlusCircle, X, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../lib/AuthContext'; // Ensure this path is correct

// Interface for a Lab Record from the database
interface LabRecord {
  _id: string;
  testName: string;
  date: string;
  doctor: string;
  category: string;
  status: 'completed' | 'pending' | 'processing';
  result?: string;
}

// Interface for the data in the "Add New" form
interface NewRecordForm {
  testName: string;
  date: string;
  doctor: string;
  category: string;
  status: 'completed' | 'pending' | 'processing';
  result: string;
}

export function LabRecords() {
  const { token } = useAuth();
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newRecordFormData, setNewRecordFormData] = useState<NewRecordForm>({
    testName: '',
    date: '',
    doctor: '',
    category: 'Hematology',
    status: 'pending',
    result: '',
  });

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("Please log in to view records.");
      return;
    }

    const fetchLabRecords = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/lab-records', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch data.');
        const data = await response.json();
        setLabRecords(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLabRecords();
  }, [token]);

  // --- 2. EVENT HANDLERS ---
  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/lab-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRecordFormData)
      });

              // --- THIS IS THE NEW LOGIC ---
        // Check for specific error codes before throwing a generic error.
        if (response.status === 403) {
            alert("Access Denied: Only users with the 'doctor' or 'admin' role can add new lab records.");
            return; // Stop the function here.
        }
        
      if (!response.ok) throw new Error('Failed to save the record.');
      const savedRecord = await response.json();
      setLabRecords(prev => [...prev, savedRecord]);
      setShowAddForm(false);
      setNewRecordFormData({ testName: '', date: '', doctor: '', category: 'Hematology', status: 'pending', result: '' });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/lab-records/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete record.');
      setLabRecords(prev => prev.filter(record => record._id !== recordId));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setNewRecordFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- 3. HELPER FUNCTIONS (PDF & STYLING) ---
  const downloadRecord = (record: LabRecord) => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text('Lab Test Report', 20, 20);
    pdf.setFontSize(12);
    pdf.text('CuraBot Medical Center', 20, 35);
    pdf.line(20, 40, 190, 40);
    pdf.setFontSize(14);
    pdf.text('Test Details', 20, 50);
    pdf.setFontSize(12);
    pdf.text(`Test ID: ${record._id}`, 20, 65);
    pdf.text(`Test Name: ${record.testName}`, 20, 75);
    pdf.text(`Date: ${new Date(record.date).toLocaleDateString()}`, 20, 85);
    pdf.text(`Requesting Doctor: ${record.doctor}`, 20, 95);
    pdf.text(`Category: ${record.category}`, 20, 105);
    pdf.text(`Status: ${record.status}`, 20, 115);
    pdf.text(`Result: ${record.result || 'Not available'}`, 20, 125);
    pdf.save(`lab-report-${record._id}.pdf`);
  };

  const getStatusColor = (status: LabRecord['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formCategories = ['Hematology', 'Biochemistry', 'Endocrinology', 'Pathology', 'Microbiology'];
  const formStatuses = ['pending', 'processing', 'completed'];

  // --- 4. RENDER LOGIC ---
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">Loading records...</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-500">{error}</div>;
    }
    if (labRecords.length === 0) {
      return (
        <div className="text-center p-10 border-2 border-dashed rounded-lg text-gray-500">
          <FileText className="mx-auto h-12 w-12" />
          <h3 className="mt-2 text-sm font-medium">No lab records found</h3>
          <p className="mt-1 text-sm">Add a new record to get started.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {labRecords.map((record) => (
          <div key={record._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-full">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{record.testName}</h3>
                  <p className="text-sm text-gray-600">Requested by: {record.doctor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0 self-end sm:self-center">
                <button onClick={() => downloadRecord(record)} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors text-sm font-medium">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button onClick={() => handleDeleteRecord(record._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 pl-2 sm:pl-16 flex items-center space-x-4 text-sm border-t pt-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <span className="text-gray-300">|</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Lab Records</h1>
            <p className="mt-1 text-gray-600">View, add, and download your laboratory test results.</p>
        </div>
        <div className="mt-4 sm:mt-0">
            <button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                <PlusCircle className="h-5 w-5" />
                <span>Add New Record</span>
            </button>
        </div>
      </div>

      {/* Add New Record Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex justify-center items-center p-4">
          <div className="relative p-8 bg-white rounded-lg shadow-xl w-full max-w-lg">
            <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Lab Record</h2>
            <form className="space-y-4" onSubmit={handleAddRecordSubmit}>
                <input type="text" name="testName" placeholder="Test Name" value={newRecordFormData.testName} onChange={handleAddFormChange} required className="w-full p-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                <input type="date" name="date" value={newRecordFormData.date} onChange={handleAddFormChange} required className="w-full p-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                <input type="text" name="doctor" placeholder="Requesting Doctor's Name" value={newRecordFormData.doctor} onChange={handleAddFormChange} required className="w-full p-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                <select name="category" value={newRecordFormData.category} onChange={handleAddFormChange} required className="w-full p-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                  {formCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select name="status" value={newRecordFormData.status} onChange={handleAddFormChange} required className="w-full p-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                  {formStatuses.map(stat => <option key={stat} value={stat}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</option>)}
                </select>
                {newRecordFormData.status === 'completed' && (
                    <textarea name="result" placeholder="Enter test result summary..." value={newRecordFormData.result} onChange={handleAddFormChange} rows={3} className="w-full p-2 border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                )}
              <div className="flex justify-end space-x-4 pt-4">
                 <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-medium">Cancel</button>
                 <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Renders the list, or loading/error/empty states */}
      {renderContent()}
    </div>
  );
}
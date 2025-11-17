import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Plus, 
  Filter, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  BarChart3,
  X
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { AdminLayout } from '../layouts/AdminLayout';
import { dataService, Doctor, Patient, Report, LabRecord } from '../services/dataService';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  todayAppointments: number;
  pendingApprovals: number;
  totalRevenue: number;
  patientSatisfaction: number;
  totalReports: number;
  totalLabRecords: number;
  recentReports: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'registration' | 'complaint' | 'approval';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

interface DemographicsData {
  totalPatients: number;
  avgAge: number | null;
  knownAgeCount: number;
  genderCounts: {
    male: number;
    female: number;
    other: number;
    unknown: number;
  };
  ageGroups: {
    children: number;
    youngAdults: number;
    adults: number;
    seniors: number;
    unknown: number;
  };
  bloodGroups: [string, number][];
  topLocations: [string, number][];
  uniqueBloodGroups: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'appointments' | 'demographics' | 'records' | 'feedback'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalPatients: 0,
    todayAppointments: 0,
    pendingApprovals: 0,
    totalRevenue: 125000,
    patientSatisfaction: 4.7,
    totalReports: 0,
    totalLabRecords: 0,
    recentReports: 0
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedReportForView, setSelectedReportForView] = useState<Report | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const activityIconConfig = {
    appointment: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    registration: { icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    complaint: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    approval: { icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' }
  } as const;

  const chartColors = {
    female: '#ec4899',
    male: '#3b82f6',
    other: '#10b981',
    unknown: '#9ca3af',
    children: '#0ea5e9',
    youngAdults: '#6366f1',
    adults: '#8b5cf6',
    seniors: '#f97316',
    blood: ['#047857', '#0f766e', '#059669', '#10b981', '#34d399']
  };

  const calculateAge = useCallback((patient: Patient) => {
    if (typeof patient.age === 'number' && !Number.isNaN(patient.age)) {
      return patient.age;
    }
    if (patient.dateOfBirth) {
      const dob = new Date(patient.dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    }
    return null;
  }, []);

  const demographics = useMemo<DemographicsData>(() => {
    const genderCounts = { male: 0, female: 0, other: 0, unknown: 0 };
    const ageGroups = { children: 0, youngAdults: 0, adults: 0, seniors: 0, unknown: 0 };
    const bloodGroupCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    let ageSum = 0;
    let ageCount = 0;

    const normalizeGender = (value?: string) => {
      if (!value) return 'unknown';
      const normalized = value.toLowerCase().trim();
      if (['male', 'm'].includes(normalized)) return 'male';
      if (['female', 'f'].includes(normalized)) return 'female';
      if (['non-binary', 'nonbinary', 'nb', 'other'].includes(normalized)) return 'other';
      return 'unknown';
    };

    patients.forEach((patient) => {
      const genderKey = normalizeGender(patient.gender);
      genderCounts[genderKey as keyof typeof genderCounts] += 1;

      const age = calculateAge(patient);
      if (typeof age === 'number') {
        ageSum += age;
        ageCount += 1;
        if (age < 18) ageGroups.children += 1;
        else if (age < 36) ageGroups.youngAdults += 1;
        else if (age < 56) ageGroups.adults += 1;
        else ageGroups.seniors += 1;
      } else {
        ageGroups.unknown += 1;
      }

      const bloodGroup = (patient.bloodGroup || 'Unknown').toUpperCase();
      bloodGroupCounts[bloodGroup] = (bloodGroupCounts[bloodGroup] || 0) + 1;

      const location = patient.address?.split(',')[0]?.trim();
      const locationKey = location && location.length > 0 ? location : 'Unknown';
      locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
    });

    const bloodGroups = Object.entries(bloodGroupCounts).sort((a, b) => b[1] - a[1]);
    const topLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      totalPatients: patients.length,
      avgAge: ageCount ? ageSum / ageCount : null,
      knownAgeCount: ageCount,
      genderCounts,
      ageGroups,
      bloodGroups,
      topLocations,
      uniqueBloodGroups: bloodGroups.length,
    };
  }, [patients, calculateAge]);

  const AgeDistributionBarChart = () => {
    const categories = [
      { key: 'children', label: 'Children', subLabel: '< 18 yrs', color: chartColors.children },
      { key: 'youngAdults', label: 'Young Adults', subLabel: '18 - 35 yrs', color: chartColors.youngAdults },
      { key: 'adults', label: 'Adults', subLabel: '36 - 55 yrs', color: chartColors.adults },
      { key: 'seniors', label: 'Seniors', subLabel: '56+ yrs', color: chartColors.seniors },
      { key: 'unknown', label: 'Unknown', subLabel: 'Missing data', color: chartColors.unknown }
    ] as const;

    const counts = categories.map(({ key }) => demographics.ageGroups[key]);
    const maxValue = Math.max(...counts, 1);

    return (
      <div className="flex items-end justify-between gap-3 h-56">
        {categories.map(({ key, label, subLabel, color }) => {
          const count = demographics.ageGroups[key];
          const height = maxValue ? (count / maxValue) * 100 : 0;
          const percentage = demographics.totalPatients
            ? Math.round((count / demographics.totalPatients) * 100)
            : 0;

          return (
            <div key={key} className="flex-1 flex flex-col items-center space-y-3">
              <div className="w-full bg-gray-100 rounded-xl h-44 flex items-end">
                <div
                  className="w-full rounded-xl"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${color}aa, ${color})`
                  }}
                ></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{subLabel}</p>
                <p className="text-xs text-gray-600 mt-1">{count} pts • {percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleViewReport = (report: Report) => {
    setSelectedReportForView(report);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setSelectedReportForView(null);
  };

  const RecentActivityList = () => (
    <div className="space-y-4">
      {recentActivities.length > 0 ? (
        recentActivities.map((activity) => {
          const config = activityIconConfig[activity.type];
          const StatusIndicator = () => {
            const statusClasses = {
              success: 'bg-green-100 text-green-700',
              warning: 'bg-yellow-100 text-yellow-700',
              error: 'bg-red-100 text-red-700'
            } as const;
            const labelMap = {
              success: 'Success',
              warning: 'Pending',
              error: 'Attention'
            } as const;
            return (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses[activity.status]}`}>
                {labelMap[activity.status]}
              </span>
            );
          };

          const Icon = config?.icon || Calendar;

          return (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${config?.bg || 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                </div>
                <div className="h-full w-px bg-gray-200 mt-2" />
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-1">
                  <StatusIndicator />
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">Activity ID: {activity.id}</p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No recent activities found.</p>
          <p className="text-xs mt-1">Activities from the last 7 days will appear here.</p>
        </div>
      )}
    </div>
  );

  const GenderPieChart = () => {
    const segments = [
      { label: 'Female', value: demographics.genderCounts.female, color: chartColors.female },
      { label: 'Male', value: demographics.genderCounts.male, color: chartColors.male },
      { label: 'Other', value: demographics.genderCounts.other, color: chartColors.other },
      { label: 'Unspecified', value: demographics.genderCounts.unknown, color: chartColors.unknown }
    ];

    const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;
    let cumulative = 0;
    const gradientStops = segments
      .filter(seg => seg.value > 0)
      .map(seg => {
        const start = (cumulative / total) * 100;
        cumulative += seg.value;
        const end = (cumulative / total) * 100;
        return `${seg.color} ${start}% ${end}%`;
      })
      .join(', ');

    const pieStyle = {
      background: gradientStops ? `conic-gradient(${gradientStops})` : '#e5e7eb'
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <div className="relative w-52 h-52">
            <div className="w-full h-full rounded-full shadow-inner" style={pieStyle}></div>
            <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center">
              <p className="text-xs text-gray-500">Documented</p>
              <p className="text-xl font-semibold text-gray-900">{total}</p>
              <p className="text-xs text-gray-400">patients</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {segments.map(({ label, value, color }) => {
            const percent = demographics.totalPatients
              ? Math.round((value / demographics.totalPatients) * 100)
              : 0;
            return (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {value} pts • {percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BloodGroupBarChart = () => {
    const groups = demographics.bloodGroups.slice(0, 6);
    const maxValue = Math.max(...groups.map(([, count]) => count), 1);

    return (
      <div className="space-y-4">
        {groups.length ? (
          groups.map(([group, count], index) => {
            const width = maxValue ? (count / maxValue) * 100 : 0;
            const percent = demographics.totalPatients
              ? Math.round((count / demographics.totalPatients) * 100)
              : 0;
            const color = chartColors.blood[index % chartColors.blood.length];
            return (
              <div key={group}>
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>{group}</span>
                  <span>{count} pts • {percent}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full mt-2">
                  <div
                    className="h-3 rounded-full"
                    style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No blood group data available yet.</p>
        )}
      </div>
    );
  };

  // Generate recent activities from real data
  const generateRecentActivities = (doctorsData: Doctor[], patientsData: Patient[], appointmentsData: any[]) => {
    const activities: RecentActivity[] = [];

    // Recent doctor registrations (last 7 days)
    const recentDoctors = doctorsData
      .filter(doctor => doctor.createdAt && new Date(doctor.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3);

    recentDoctors.forEach(doctor => {
      const timeAgo = getTimeAgo(new Date(doctor.createdAt!));
      activities.push({
        id: `doctor-${doctor._id}`,
        type: 'registration',
        message: `New doctor Dr. ${doctor.name} registered (${doctor.specialty})`,
        time: timeAgo,
        status: 'success'
      });
    });

    // Recent patient registrations (last 7 days)
    const recentPatients = patientsData
      .filter(patient => patient.createdAt && new Date(patient.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3);

    recentPatients.forEach(patient => {
      const timeAgo = getTimeAgo(new Date(patient.createdAt!));
      activities.push({
        id: `patient-${patient._id}`,
        type: 'registration',
        message: `New patient ${patient.name} registered`,
        time: timeAgo,
        status: 'success'
      });
    });

    // Recent appointments (last 3 days)
    const recentAppointments = appointmentsData
      .filter(apt => apt.createdAt && new Date(apt.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, 4);

    recentAppointments.forEach(apt => {
      const timeAgo = getTimeAgo(new Date(apt.createdAt || apt.date));
      const patientName = apt.fullName || apt.patientName || 'Unknown Patient';
      const doctorName = apt.doctorName || apt.doctor || 'Unknown Doctor';
      
      activities.push({
        id: `appointment-${apt._id}`,
        type: 'appointment',
        message: `Appointment scheduled: ${patientName} with Dr. ${doctorName}`,
        time: timeAgo,
        status: apt.status === 'cancelled' ? 'error' : apt.completed ? 'success' : 'warning'
      });
    });

    // Sort all activities by most recent and take top 6
    return activities
      .sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      })
      .slice(0, 6);
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  // Helper function to parse time ago for sorting
  const parseTimeAgo = (timeAgo: string) => {
    const match = timeAgo.match(/(\d+)\s+(min|hour|day)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 'min') return value;
    if (unit === 'hour') return value * 60;
    if (unit === 'day') return value * 60 * 24;
    return 0;
  };

  // Fetch all data with auto-refresh
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [doctorsData, patientsData, appointmentsData, reportsData, labRecordsData] = await Promise.all([
        dataService.getAllDoctors(),
        dataService.getAllPatients(),
        dataService.getAllAppointments(),
        dataService.getAllReports(),
        dataService.getAllLabRecords()
      ]);

      setDoctors(doctorsData);
      setPatients(patientsData);
      setAppointments(appointmentsData);
      setReports(reportsData);
      setLabRecords(labRecordsData);

      // Generate recent activities from real data
      const activities = generateRecentActivities(doctorsData, patientsData, appointmentsData);
      setRecentActivities(activities);

      // Update stats
      const today = new Date().toDateString();
      const todayAppointments = appointmentsData.filter((apt: any) => 
        new Date(apt.date).toDateString() === today
      ).length;

      // Calculate recent reports (last 7 days)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentReports = reportsData.filter(report => 
        new Date(report.createdAt) > weekAgo
      ).length;

      setStats(prev => ({
        ...prev,
        totalDoctors: doctorsData.length,
        totalPatients: patientsData.length,
        todayAppointments,
        pendingApprovals: appointmentsData.filter((apt: any) => apt.status === 'pending').length,
        totalReports: reportsData.length,
        totalLabRecords: labRecordsData.length,
        recentReports
      }));
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch and auto-refresh setup
  useEffect(() => {
    fetchAllData();
    
    // Subscribe to appointment changes for real-time updates
    const unsubscribe = dataService.subscribeToDataChanges('appointments', fetchAllData);
    const unsubscribeAdmin = dataService.subscribeToDataChanges('admin-dashboard', fetchAllData);
    
    return () => {
      unsubscribe();
      unsubscribeAdmin();
    };
  }, []);

  // Auto-refresh data every 30 seconds
  useAutoRefresh(fetchAllData, { interval: 30000 });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Medical Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lab Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLabRecords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <p className="text-sm text-gray-500">Latest doctor, patient, and appointment updates</p>
          </div>
          <span className="text-xs text-gray-400">Auto-refresh every 30s</span>
        </div>
        <RecentActivityList />
      </div>
    </div>
  );

  const renderDoctorManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Doctor</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(doctors || []).filter(doctor => 
                  doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {doctor.image ? (
                          <img src={doctor.image} alt={doctor.name} className="h-10 w-10 rounded-full object-cover border" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name} {typeof doctor.age === 'number' && doctor.age > 0 ? <span className="text-gray-500">({doctor.age})</span> : null}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.specialty}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.experience || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedDoctor(doctor)}
                        className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">
                        {doctor.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(doctors || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No doctors found. Add your first doctor to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">Manage your healthcare system from this central dashboard</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'doctors', label: 'Doctors', icon: UserCheck },
                { key: 'patients', label: 'Patients', icon: Users },
                { key: 'appointments', label: 'Appointments', icon: Calendar },
                { key: 'demographics', label: 'Demographics', icon: TrendingUp },
                { key: 'records', label: 'Records', icon: FileText },
                { key: 'feedback', label: 'Feedback', icon: Star }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'doctors' && renderDoctorManagement()}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Patient</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(patients || []).filter(patient => 
                        patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                        patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                        (patient.phone && patient.phone.includes(patientSearchTerm))
                      ).map((patient) => (
                        <tr key={patient._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-500">{patient.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.phone || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => setSelectedPatient(patient)}
                              className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button className="text-purple-600 hover:text-purple-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(patients || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No patients found. Patient registrations will appear here.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Appointment Management</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Total: {appointments.length} appointments</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search appointments by patient name, doctor, or reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.map((appointment: any) => (
                        <tr key={appointment._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {(appointment.fullName || appointment.patientName || 'Unknown').split(' ').map((n: string) => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.fullName || appointment.patientName || 'Unknown Patient'}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.email || appointment.patientEmail || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.doctorName || appointment.doctor || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">{appointment.time || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.reason || appointment.condition || 'General consultation'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.completed || appointment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.completed || appointment.status === 'completed' 
                                ? 'Completed' 
                                : appointment.status === 'cancelled'
                                ? 'Cancelled'
                                : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button className="text-purple-600 hover:text-purple-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Cancel</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {appointments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No appointments found. Appointments will appear here as they are scheduled.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Patient Demographics</h2>
                <p className="text-gray-600">Understand the makeup of your patient population</p>
              </div>
              <div className="text-sm text-gray-500">
                Updated in real-time from patient records
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{demographics.totalPatients}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {demographics.totalPatients > 0 ? 'Includes all registered patients' : 'Awaiting patient registrations'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm font-medium text-gray-600">Average Age</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {demographics.avgAge ? `${Math.round(demographics.avgAge)} yrs` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {demographics.knownAgeCount} patient records
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm font-medium text-gray-600">Gender Ratio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {demographics.genderCounts.female}:{demographics.genderCounts.male}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Female • Male distribution
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm font-medium text-gray-600">Blood Groups</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{demographics.uniqueBloodGroups}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Unique blood group profiles recorded
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Age Distribution</h3>
                  <span className="text-xs text-gray-500">Scaled to max cohort</span>
                </div>
                <AgeDistributionBarChart />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gender Distribution</h3>
                  <span className="text-xs text-gray-500">Live patient data</span>
                </div>
                <GenderPieChart />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Blood Group Mix</h3>
                  <span className="text-xs text-gray-500">Top cohorts</span>
                </div>
                <BloodGroupBarChart />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span>Top Locations</span>
                </h3>
                <div className="space-y-3">
                  {demographics.topLocations.length ? (
                    demographics.topLocations.map(([location, count]) => {
                      const percentage = demographics.totalPatients
                        ? Math.round((count / demographics.totalPatients) * 100)
                        : 0;
                      return (
                        <div key={location} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{location}</span>
                          <span className="text-gray-900 font-medium">{count} ({percentage}%)</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Patient location data will appear here.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>
                    Most common blood group: <span className="font-semibold">{demographics.bloodGroups[0]?.[0] || 'N/A'}</span>
                  </li>
                  <li>
                    Largest patient cluster: <span className="font-semibold">{demographics.topLocations[0]?.[0] || 'N/A'}</span>
                  </li>
                  <li>
                    Youngest segment: <span className="font-semibold">{(() => {
                      const entries = Object.entries(demographics.ageGroups) as [keyof DemographicsData['ageGroups'], number][];
                      const sorted = entries.sort((a, b) => b[1] - a[1]);
                      const keyMap: Record<string, string> = {
                        children: 'Children',
                        youngAdults: 'Young Adults',
                        adults: 'Adults',
                        seniors: 'Seniors',
                        unknown: 'Unknown',
                      };
                      return keyMap[sorted[0]?.[0] || 'unknown'];
                    })()}</span>
                  </li>
                  <li>
                    Documented age data for <span className="font-semibold">{demographics.knownAgeCount}</span> patients
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Medical Records & Reports</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {reports.length} Reports • {labRecords.length} Lab Records
                </span>
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Reports</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : reports.length > 0 ? (
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
                      {reports.slice(0, 10).map((report) => (
                        <tr key={report._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{report.patientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.doctorName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.diagnosis.substring(0, 50)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No medical reports found.</p>
                  <p className="text-xs mt-1">Reports will appear here as doctors generate them.</p>
                </div>
              )}
            </div>

            {/* Lab Records Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Records</h3>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : labRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {labRecords.slice(0, 10).map((record) => (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{record.testType}</div>
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
                            <button className="text-blue-600 hover:text-blue-900 mr-3 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No lab records found.</p>
                  <p className="text-xs mt-1">Lab records will appear here as they are created.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Feedback</h2>
            <p className="text-gray-600">Feedback management interface coming soon...</p>
          </div>
        )}

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900">{selectedDoctor.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">{selectedDoctor.email}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">{selectedDoctor.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Status</label>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedDoctor.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedDoctor.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Specialty</label>
                        <p className="text-gray-900">{selectedDoctor.specialty}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Experience</label>
                        <p className="text-gray-900">{selectedDoctor.experience || 'Not specified'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Education</label>
                        <p className="text-gray-900">{selectedDoctor.education || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Registration Date</label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">
                            {selectedDoctor.createdAt 
                              ? new Date(selectedDoctor.createdAt).toLocaleDateString()
                              : 'Not available'
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Doctor ID</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedDoctor._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Edit Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Profile Photo and Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="flex items-start space-x-6 mb-4">
                      {selectedPatient.image ? (
                        <img 
                          src={selectedPatient.image} 
                          alt={selectedPatient.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 font-semibold text-lg">
                            {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h4>
                        <p className="text-gray-600">{selectedPatient.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Phone</label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">{selectedPatient.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Age</label>
                        <p className="text-gray-900">
                          {selectedPatient.age || (selectedPatient.dateOfBirth 
                            ? new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()
                            : 'Not provided'
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Blood Group</label>
                        <p className="text-gray-900">{selectedPatient.bloodGroup || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Gender</label>
                        <p className="text-gray-900">{selectedPatient.gender || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">
                            {selectedPatient.dateOfBirth 
                              ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                              : 'Not provided'
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Marital Status</label>
                        <p className="text-gray-900">{selectedPatient.maritalStatus || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Height</label>
                        <p className="text-gray-900">{selectedPatient.height || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Weight</label>
                        <p className="text-gray-900">{selectedPatient.weight || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Occupation</label>
                        <p className="text-gray-900">{selectedPatient.occupation || 'Not provided'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Address</label>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                          <p className="text-gray-900">{selectedPatient.address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Medical History</label>
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {selectedPatient.medicalHistory || 'No medical history recorded'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Allergies</label>
                        <p className="text-gray-900">
                          {selectedPatient.allergies || 'No known allergies'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
                        <p className="text-gray-900">
                          {selectedPatient.emergencyContact || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Registration Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Registration Date</label>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <p className="text-gray-900">
                            {selectedPatient.createdAt 
                              ? new Date(selectedPatient.createdAt).toLocaleDateString()
                              : 'Not available'
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Patient ID</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedPatient._id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Edit Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {isReportModalOpen && selectedReportForView && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">Report Details</p>
                <h3 className="text-2xl font-bold text-gray-900">{selectedReportForView.title || 'Medical Report'}</h3>
              </div>
              <button onClick={closeReportModal} className="p-2 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b">
              <div>
                <p className="text-xs text-gray-500 uppercase">Patient</p>
                <p className="text-lg font-semibold text-gray-900">{selectedReportForView.patientName}</p>
                <p className="text-sm text-gray-500 mt-1">Patient ID: {selectedReportForView.patientId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Doctor</p>
                <p className="text-lg font-semibold text-gray-900">{selectedReportForView.doctorName}</p>
                <p className="text-sm text-gray-500 mt-1">Doctor ID: {selectedReportForView.doctorId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Appointment</p>
                <p className="text-sm text-gray-700">{selectedReportForView.appointmentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Generated On</p>
                <p className="text-sm text-gray-700">{new Date(selectedReportForView.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Diagnosis</p>
                <p className="text-gray-800 leading-relaxed">{selectedReportForView.diagnosis || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Prescription</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedReportForView.prescription || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Recommendations</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedReportForView.recommendations || 'Not provided'}</p>
              </div>
              {selectedReportForView.notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Additional Notes</p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedReportForView.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 border-t px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeReportModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              >
                Print / Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

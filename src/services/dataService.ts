// Centralized data service for managing doctors, patients, and appointments
export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  phone?: string;
  experience?: string;
  education?: string;
  status: 'active' | 'inactive';
  image?: string;
  age?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  bloodGroup?: string;
  gender?: string;
  height?: string;
  weight?: string;
  occupation?: string;
  maritalStatus?: string;
  address?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string[];
  allergies?: string[];
  image?: string;
  // Backend uses timestamps createdAt/updatedAt
  createdAt: string;
  updatedAt?: string;
}

export interface AppointmentData {
  _id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  fullName?: string; // Patient's full name from appointment form
  email?: string; // Patient's email from appointment form
  phone?: string; // Patient's phone from appointment form
  patientEmail?: string; // Alternative email field
  patientPhone?: string; // Alternative phone field
  date: string;
  time: string;
  department: string;
  doctor?: string; // Doctor name (alternative field)
  reason: string;
  condition?: string; // Patient condition/reason for visit
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  completed?: boolean; // Completion status
  notes?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  _id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  prescription: string;
  recommendations: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LabRecord {
  _id: string;
  patientId: string;
  doctorId?: string;
  patientName: string;
  doctorName?: string;
  testType: string;
  testDate: string;
  results: string;
  status: 'pending' | 'completed' | 'reviewed';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Enhanced data service with real-time synchronization

// Event emitter for data changes
class DataChangeNotifier {
  private listeners: Map<string, Set<() => void>> = new Map();

  subscribe(dataType: string, callback: () => void) {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, new Set());
    }
    this.listeners.get(dataType)!.add(callback);

    return () => {
      const callbacks = this.listeners.get(dataType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(dataType);
        }
      }
    };
  }

  notify(dataType: string) {
    const callbacks = this.listeners.get(dataType);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
}

const dataChangeNotifier = new DataChangeNotifier();

class DataService {
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? 'https://curabot-backend.onrender.com/api' : 'http://localhost:5000/api');

  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Helper function to get auth headers
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Doctor Management
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/doctors`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async createDoctor(doctorData: Omit<Doctor, '_id' | 'createdAt'>): Promise<Doctor | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/doctors`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(doctorData)
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getDoctor(doctorId: string): Promise<Doctor | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/doctors/${doctorId}`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async updateDoctor(doctorId: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/doctors/${doctorId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Patient Management
  async getAllPatients(): Promise<Patient[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/patients`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async createPatient(patientData: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>): Promise<Patient | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/patients`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(patientData)
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async updatePatient(patientId: string, patientData: Partial<Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Patient | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(patientData)
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Appointment Management
  async getAllAppointments(): Promise<AppointmentData[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/appointments`, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  // Helper method to handle authentication errors
  private handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  }

  async createAppointment(appointmentData: Omit<AppointmentData, '_id'>): Promise<AppointmentData> {
    const headers = this.getAuthHeaders();
    
    // Check if we have a token before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    
    const response = await fetch(`${this.API_BASE_URL}/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 401) {
        this.handleAuthError();
        throw new Error('Your session has expired. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Permission denied. You may not have rights to create appointments.');
      } else {
        throw new Error(`Failed to create appointment: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }

    const result = await response.json();
    
    // Notify all components that appointment data has changed
    dataChangeNotifier.notify('appointments');
    dataChangeNotifier.notify('patients');
    return result;
  }

  async updateAppointment(appointmentId: string, updates: Partial<AppointmentData>): Promise<AppointmentData> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled', completed?: boolean): Promise<AppointmentData> {
    try {
      // Test basic connectivity first
      try {
        await fetch(`${this.API_BASE_URL}/appointments`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
      } catch (testError) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      
      const requestBody = { status, completed: completed ?? (status === 'completed') };
      
      const response = await fetch(`${this.API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Permission denied. You may not have rights to update this appointment.');
        } else if (response.status === 404) {
          throw new Error('Appointment not found.');
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorData}`);
        }
      }

      const result = await response.json();
      
      // Notify all components that appointment data has changed
      dataChangeNotifier.notify('appointments');
      dataChangeNotifier.notify('admin-dashboard');
      dataChangeNotifier.notify('patient-dashboard');
      return result;
    } catch (error: any) {
      throw error; // Re-throw the original error instead of wrapping it
    }
  }

  // Subscribe to data changes for real-time updates
  subscribeToDataChanges(dataType: string, callback: () => void) {
    return dataChangeNotifier.subscribe(dataType, callback);
  }

  async getAppointmentsByDoctor(doctorName: string): Promise<AppointmentData[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/appointments/doctor/${encodeURIComponent(doctorName)}`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async getAppointmentsByPatient(patientId: string): Promise<AppointmentData[]> {
    try {
      const allAppointments = await this.getAllAppointments();
      return allAppointments.filter(apt => apt.patientId === patientId);
    } catch (error) {
      return [];
    }
  }

  // Reports Management
  async getAllReports(): Promise<Report[]> {
    try {
      console.log('DataService: Fetching all reports from:', `${this.API_BASE_URL}/reports/all`);
      console.log('DataService: Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(`${this.API_BASE_URL}/reports/all`, {
        headers: this.getAuthHeaders()
      });
      
      console.log('DataService: Reports response status:', response.status);
      console.log('DataService: Reports response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('DataService: Reports data received:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('DataService: Reports API error:', response.status, errorText);
      }
      return [];
    } catch (error) {
      console.error('DataService: Reports fetch error:', error);
      return [];
    }
  }

  async getReportsByPatient(patientId: string): Promise<Report[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports/patient/${patientId}`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async getReportsByDoctor(doctorId: string): Promise<Report[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/reports/doctor/${doctorId}`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Lab Records Management
  async getAllLabRecords(): Promise<LabRecord[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/lab-records`, {
        headers: this.getAuthHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // Statistics
  async getDashboardStats() {
    try {
      const [doctors, patients, appointments, reports, labRecords] = await Promise.all([
        this.getAllDoctors(),
        this.getAllPatients(),
        this.getAllAppointments(),
        this.getAllReports(),
        this.getAllLabRecords()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => apt.date === today);
      const completedToday = todayAppointments.filter(apt => apt.status === 'completed');

      return {
        totalDoctors: doctors.length,
        activeDoctors: doctors.filter(d => d.status === 'active').length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        todayAppointments: todayAppointments.length,
        completedToday: completedToday.length,
        pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
        totalReports: reports.length,
        totalLabRecords: labRecords.length,
        recentReports: reports.filter(r => {
          const reportDate = new Date(r.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return reportDate > weekAgo;
        }).length
      };
    } catch (error) {
      return {
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        completedToday: 0,
        pendingAppointments: 0,
        totalReports: 0,
        totalLabRecords: 0,
        recentReports: 0
      };
    }
  }
}

export const dataService = new DataService();

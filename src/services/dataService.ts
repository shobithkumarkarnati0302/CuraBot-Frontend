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
}

// Enhanced data service with real-time synchronization
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
  private API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://curabot-backend-production.up.railway.app/api';

  // Helper function to get auth headers
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    console.log('DataService: Getting auth headers, token exists:', !!token);
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
      console.error('Error fetching doctors:', error);
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
      console.error('Error creating doctor:', error);
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
      console.error('Error fetching doctor:', error);
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
      console.error('Error updating doctor:', error);
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
      console.error('Error fetching patients:', error);
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
      console.error('Error creating patient:', error);
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
      console.error('Error updating patient:', error);
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
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async createAppointment(appointmentData: Omit<AppointmentData, '_id'>): Promise<AppointmentData> {
    const response = await fetch(`${this.API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      throw new Error('Failed to create appointment');
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
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled', completed?: boolean): Promise<AppointmentData> {
    try {
      console.log(`DataService: Updating appointment ${appointmentId} to status ${status}`);
      
      // Test basic connectivity first
      try {
        const testResponse = await fetch(`${this.API_BASE_URL}/appointments`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
        console.log(`DataService: Test connection status ${testResponse.status}`);
      } catch (testError) {
        console.error('DataService: Cannot connect to server:', testError);
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      
      const requestBody = { status, completed: completed ?? (status === 'completed') };
      console.log('DataService: Request body:', requestBody);
      console.log('DataService: Request URL:', `${this.API_BASE_URL}/appointments/${appointmentId}/status`);
      
      const response = await fetch(`${this.API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      console.log(`DataService: Response status ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('DataService: Error response:', errorData);
        
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
      console.log('DataService: Update successful:', result);
      
      // Notify all components that appointment data has changed
      dataChangeNotifier.notify('appointments');
      dataChangeNotifier.notify('admin-dashboard');
      dataChangeNotifier.notify('patient-dashboard');
      return result;
    } catch (error: any) {
      console.error('DataService: Error in updateAppointmentStatus:', error);
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
      console.error('Error fetching doctor appointments:', error);
      return [];
    }
  }

  async getAppointmentsByPatient(patientId: string): Promise<AppointmentData[]> {
    try {
      const allAppointments = await this.getAllAppointments();
      return allAppointments.filter(apt => apt.patientId === patientId);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  }

  // Statistics
  async getDashboardStats() {
    try {
      const [doctors, patients, appointments] = await Promise.all([
        this.getAllDoctors(),
        this.getAllPatients(),
        this.getAllAppointments()
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
        pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        completedToday: 0,
        pendingAppointments: 0
      };
    }
  }
}

export const dataService = new DataService();

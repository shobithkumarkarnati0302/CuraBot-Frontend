import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Heart, UserPlus, Stethoscope, Shield } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      
      // If registering as doctor or patient, sync with centralized data service
      if (formData.role === 'doctor') {
        try {
          await dataService.createDoctor({
            name: formData.name,
            email: formData.email,
            specialty: 'General Practice', // Default specialty
            status: 'active',
            phone: '',
            experience: '',
            education: ''
          });
        } catch (syncError) {
          console.warn('Failed to sync doctor data:', syncError);
        }
      } else if (formData.role === 'patient') {
        try {
          await dataService.createPatient({
            name: formData.name,
            email: formData.email,
            phone: '',
            age: undefined,
            bloodGroup: '',
            gender: '',
            height: '',
            weight: '',
            occupation: '',
            maritalStatus: '',
            address: '',
            emergencyContact: '',
            emergencyPhone: '',
            medicalHistory: [],
            allergies: [],
            image: ''
          });
        } catch (syncError) {
          console.warn('Failed to sync patient data:', syncError);
        }
      }
      
      // Navigate based on role
      if (formData.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else if (formData.role === 'patient') {
        // Use window.location.href to ensure full page reload and proper state update
        window.location.href = '/';
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="h-5 w-5" />;
      default:
        return <UserPlus className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-blue-600 p-12 items-center justify-center">
          <div className="max-w-md text-white">
            <div className="flex items-center mb-8">
              <Heart className="h-12 w-12 text-white mr-4" />
              <h1 className="text-4xl font-bold">CuraBot</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-6">Join Our Healthcare Community</h2>
            <p className="text-lg text-emerald-100 mb-8">
              Create your account to access personalized healthcare services, connect with medical professionals, and manage your health journey.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserPlus className="h-6 w-6 mr-3 text-emerald-200" />
                <span className="text-emerald-100">Easy Registration Process</span>
              </div>
              <div className="flex items-center">
                <Stethoscope className="h-6 w-6 mr-3 text-emerald-200" />
                <span className="text-emerald-100">Professional Medical Care</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-3 text-emerald-200" />
                <span className="text-emerald-100">Secure & Confidential</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4 lg:hidden">
                  <Heart className="h-10 w-10 text-emerald-600 mr-3" />
                  <h1 className="text-3xl font-bold text-gray-900">CuraBot</h1>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">Join our healthcare platform today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4" aria-live="polite">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none bg-white"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="patient">Patient - Access healthcare services</option>
                      <option value="doctor">Doctor - Provide medical care</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      {getRoleIcon(formData.role)}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 
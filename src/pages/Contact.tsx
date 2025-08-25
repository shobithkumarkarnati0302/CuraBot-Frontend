import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 hover:text-emerald-600 transition-colors duration-300">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
          <h2 className="text-2xl font-semibold mb-6 hover:text-emerald-600 transition-colors duration-300">Get in Touch</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 hover:text-emerald-600 transition-colors duration-300">
                Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 hover:text-emerald-600 transition-colors duration-300">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 hover:text-emerald-600 transition-colors duration-300">
                Subject
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 hover:text-emerald-600 transition-colors duration-300">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300 hover:border-emerald-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-2xl font-semibold mb-6 hover:text-emerald-600 transition-colors duration-300">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 group">
                <MapPin className="h-6 w-6 text-emerald-600 transform transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <h3 className="font-medium group-hover:text-emerald-600 transition-colors duration-300">Address</h3>
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">123, Health Street, Medical Enclave, New Delhi, Delhi 110001, India</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <Phone className="h-6 w-6 text-emerald-600 transform transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <h3 className="font-medium group-hover:text-emerald-600 transition-colors duration-300">Phone</h3>
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">+91 11 2345 6789</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <Mail className="h-6 w-6 text-emerald-600 transform transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <h3 className="font-medium group-hover:text-emerald-600 transition-colors duration-300">Email</h3>
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">contact@curabot.in</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <Clock className="h-6 w-6 text-emerald-600 transform transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <h3 className="font-medium group-hover:text-emerald-600 transition-colors duration-300">Hours</h3>
                  <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                    Monday - Friday: 9:00 AM - 7:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-2xl font-semibold mb-6 hover:text-emerald-600 transition-colors duration-300">Emergency Contact</h2>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 group hover:bg-red-100 transition-colors duration-300">
              <p className="text-red-700 font-medium group-hover:text-red-800 transition-colors duration-300">24/7 Emergency Hotline</p>
              <p className="text-red-600 text-2xl font-bold group-hover:text-red-700 transition-colors duration-300">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
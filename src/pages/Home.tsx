import React from 'react';
import { Calendar, Users, Stethoscope, Phone, ArrowRight, Clock, Shield, Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative min-h-[600px] group overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQ4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnptMC0xMmMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] animate-[move_20s_linear_infinite]" />
        </div>

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80"
            alt="Hospital"
            className="w-full h-full object-cover opacity-40 transform transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-800/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="w-full md:w-2/3 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                Your Health,{' '}
                <span className="text-emerald-400 relative">
                  Our Priority
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </span>
              </h1>
              <p className="text-xl text-emerald-50 mb-8 leading-relaxed max-w-2xl">
                Experience world-class healthcare services with our team of expert medical professionals.
                Your well-being is at the heart of everything we do.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/appointments"
                  className="group relative inline-flex items-center px-8 py-3 overflow-hidden rounded-full bg-emerald-500 text-white transition-all duration-300 hover:bg-emerald-600 hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  <span className="absolute left-0 w-0 h-full bg-white/20 transform skew-x-12 transition-all duration-300 group-hover:w-full" />
                  <span className="relative flex items-center">
                    Book Appointment
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>

                <Link
                  to="/services"
                  className="group inline-flex items-center px-8 py-3 rounded-full border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  Our Services
                  <ChevronRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { number: '15+', label: 'Years Experience' },
                  { number: '50+', label: 'Specialist Doctors' },
                  { number: '10k+', label: 'Happy Patients' },
                  { number: '24/7', label: 'Emergency Care' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-2xl font-bold text-emerald-400">{stat.number}</div>
                    <div className="text-sm text-emerald-50">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            className="relative w-full h-24 text-warm-bg"
            preserveAspectRatio="none"
            viewBox="0 0 1440 74"
            fill="currentColor"
          >
            <path d="M456.464 0.0433865C277.158 -1.70575 0 50.0141 0 50.0141V74H1440V50.0141C1440 50.0141 1320.4 31.1925 1243.09 27.0276C1099.33 19.2816 1019.08 53.1981 875.138 50.0141C710.527 46.3727 621.108 1.64949 456.464 0.0433865Z" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <Calendar className="h-12 w-12 text-emerald-600 mb-4 transform transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Easy Scheduling</h3>
            <p className="text-gray-600 group-hover:text-gray-900 transition-colors">Book appointments online at your convenience</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <Users className="h-12 w-12 text-emerald-600 mb-4 transform transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Expert Doctors</h3>
            <p className="text-gray-600 group-hover:text-gray-900 transition-colors">Access to qualified healthcare professionals</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <Stethoscope className="h-12 w-12 text-emerald-600 mb-4 transform transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Quality Care</h3>
            <p className="text-gray-600 group-hover:text-gray-900 transition-colors">State-of-the-art facilities and equipment</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <Phone className="h-12 w-12 text-emerald-600 mb-4 transform transition-transform duration-300 group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">24/7 Support</h3>
            <p className="text-gray-600 group-hover:text-gray-900 transition-colors">Round-the-clock medical assistance</p>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 hover:text-emerald-600 transition-colors">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Emergency Care",
              image: "https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&q=80",
              description: "24/7 emergency medical services",
              icon: <Clock className="h-6 w-6" />
            },
            {
              title: "Laboratory Services",
              image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80",
              description: "Advanced diagnostic testing",
              icon: <Shield className="h-6 w-6" />
            },
            {
              title: "Specialized Care",
              image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80",
              description: "Expert specialized treatments",
              icon: <Award className="h-6 w-6" />
            }
          ].map((service, index) => (
            <div key={index} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-emerald-600 transform transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-emerald-600 transition-colors">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 group-hover:text-gray-900 transition-colors">{service.description}</p>
                <Link
                  to="/services"
                  className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-800 transition-colors group/link"
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 transform transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
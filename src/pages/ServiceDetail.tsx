import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Stethoscope, Heart, Brain, Bone, Baby, FlaskRound as Flask, Ban as Bandage, Activity, ArrowLeft } from 'lucide-react';

// Define a type for the service object
interface Service {
  icon: React.ReactElement;
  title: string;
  description: string;
  details: string;
}

export function ServiceDetail() {
  const { servicename } = useParams<{ servicename: string }>();
  const location = useLocation();
  const service = location.state?.service as Service | undefined;

  // Fallback if service data is not passed via state (e.g., direct URL access)
  // In a real application, you might fetch the service details from an API here
  const allServices: Service[] = [
    {
      icon: <Stethoscope className="h-12 w-12" />,
      title: "General Medicine",
      description: "Comprehensive medical care for various health conditions",
      details: "General Medicine provides comprehensive primary healthcare for adults, focusing on the diagnosis, treatment, and prevention of common illnesses. Our experienced physicians offer personalized care, managing chronic conditions, conducting routine check-ups, and coordinating specialized treatments when necessary. We emphasize a holistic approach to health, promoting wellness and disease prevention through patient education and lifestyle guidance."
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: "Cardiology",
      description: "Expert care for heart and cardiovascular conditions",
      details: "Cardiology services at CuraBot offer advanced diagnostic and treatment options for a wide range of heart and cardiovascular conditions. Our team of highly skilled cardiologists specializes in managing hypertension, coronary artery disease, heart failure, and arrhythmias. We utilize state-of-the-art technology for accurate diagnoses and provide comprehensive care plans, including lifestyle modifications, medication management, and interventional procedures, to ensure optimal heart health."
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: "Neurology",
      description: "Specialized treatment for neurological disorders",
      details: "Neurology at CuraBot focuses on the diagnosis and treatment of disorders affecting the brain, spinal cord, and nervous system. Our expert neurologists provide compassionate care for conditions such as migraines, epilepsy, stroke, Parkinson's disease, and multiple sclerosis. We offer advanced diagnostic tools, personalized treatment plans, and rehabilitation services to help patients regain function and improve their quality of life."
    },
    {
      icon: <Bone className="h-12 w-12" />,
      title: "Orthopedics",
      description: "Treatment for bone and joint related conditions",
      details: "Orthopedics at CuraBot provides specialized care for musculoskeletal conditions, including bone, joint, ligament, tendon, and muscle injuries. Our orthopedic surgeons and specialists offer comprehensive treatment for fractures, arthritis, sports injuries, and spinal disorders. We provide both surgical and non-surgical interventions, focusing on pain relief, restoring mobility, and improving overall function through personalized rehabilitation programs."
    },
    {
      icon: <Baby className="h-12 w-12" />,
      title: "Pediatrics",
      description: "Specialized healthcare for children and adolescents",
      details: "Pediatrics at CuraBot is dedicated to the health and well-being of infants, children, and adolescents. Our pediatricians provide comprehensive healthcare services, including routine check-ups, vaccinations, developmental screenings, and management of acute and chronic childhood illnesses. We create a child-friendly environment, ensuring that young patients receive the best possible care in a comforting and supportive setting."
    },
    {
      icon: <Flask className="h-12 w-12" />,
      title: "Laboratory Services",
      description: "Advanced diagnostic and testing facilities",
      details: "CuraBot's Laboratory Services offer a full range of advanced diagnostic tests to support accurate and timely medical diagnoses. Our state-of-the-art laboratory is equipped to perform blood tests, urine analyses, pathology, microbiology, and genetic testing. We ensure precise results through rigorous quality control and efficient processes, providing essential information for effective patient care."
    },
    {
      icon: <Bandage className="h-12 w-12" />,
      title: "Emergency Care",
      description: "24/7 emergency medical services",
      details: "CuraBot provides 24/7 Emergency Care for urgent medical conditions and injuries. Our emergency department is staffed by highly trained physicians, nurses, and support staff who are equipped to handle a wide range of medical emergencies. We prioritize rapid assessment and immediate intervention, ensuring that patients receive critical care when every second counts."
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Preventive Care",
      description: "Regular check-ups and health monitoring",
      details: "Preventive Care at CuraBot focuses on maintaining your health and preventing the onset of diseases. We offer comprehensive health screenings, regular check-ups, vaccinations, and personalized wellness plans. Our goal is to empower patients with the knowledge and tools to make informed lifestyle choices, reduce health risks, and promote long-term well-being."
    }
  ];

  const currentService = service || allServices.find(s => s.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === servicename);

  if (!currentService) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Service Not Found</h1>
        <p className="text-gray-600">The service you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link 
        to="/services" 
        className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </Link>
      
      <h1 className="text-3xl font-bold mb-8 hover:text-emerald-600 transition-colors duration-300">{currentService.title}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="text-emerald-600 mr-4">
            {currentService.icon}
          </div>
          <h2 className="text-2xl font-semibold">{currentService.title}</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">{currentService.details}</p>
      </div>
    </div>
  );
}

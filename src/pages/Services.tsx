import { Stethoscope, Heart, Brain, Bone, Baby, FlaskRound as Flask, Ban as Bandage, Activity } from 'lucide-react';

export function Services() {
  const services = [
    {
      icon: <Stethoscope className="h-12 w-12" />,
      title: "General Medicine",
      description: "Comprehensive medical care for various health conditions",
      details: "General Medicine provides comprehensive primary healthcare for adults, focusing on the diagnosis, treatment, and prevention of common illnesses. Our experienced physicians offer personalized care, managing chronic conditions, conducting routine check-ups, and coordinating specialized treatments when necessary. We emphasize a holistic approach to health, promoting wellness and disease prevention through patient education and lifestyle guidance.",
      features: [
        "Annual Health Check-ups",
        "Chronic Disease Management",
        "Preventive Care & Vaccinations",
        "Health Screenings & Diagnostics",
        "Lifestyle Counseling",
        "Referral Coordination"
      ],
      commonConditions: [
        "Diabetes Management",
        "Hypertension Control",
        "Respiratory Infections",
        "Digestive Disorders",
        "Skin Conditions",
        "Mental Health Support"
      ],
      doctors: ["Dr. Sarah Johnson", "Dr. Michael Chen", "Dr. Amanda Rodriguez"],
      equipment: ["Digital X-Ray", "ECG Machine", "Blood Pressure Monitors", "Glucose Testing Kits"]
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: "Cardiology",
      description: "Expert care for heart and cardiovascular conditions",
      details: "Cardiology services at CuraBot offer advanced diagnostic and treatment options for a wide range of heart and cardiovascular conditions. Our team of highly skilled cardiologists specializes in managing hypertension, coronary artery disease, heart failure, and arrhythmias. We utilize state-of-the-art technology for accurate diagnoses and provide comprehensive care plans, including lifestyle modifications, medication management, and interventional procedures, to ensure optimal heart health.",
      features: [
        "Cardiac Catheterization",
        "Echocardiography",
        "Stress Testing",
        "Holter Monitoring",
        "Pacemaker Implantation",
        "Angioplasty & Stenting"
      ],
      commonConditions: [
        "Coronary Artery Disease",
        "Heart Failure",
        "Arrhythmias",
        "Valvular Heart Disease",
        "Hypertension",
        "Chest Pain Evaluation"
      ],
      doctors: ["Dr. James Wilson", "Dr. Emma Davis", "Dr. Robert Martinez"],
      equipment: ["Cardiac Catheterization Lab", "3D Echocardiogram", "Stress Test Equipment", "Holter Monitors"]
    },
    {
      icon: <Brain className="h-12 w-12" />,
      title: "Neurology",
      description: "Specialized treatment for neurological disorders",
      details: "Neurology at CuraBot focuses on the diagnosis and treatment of disorders affecting the brain, spinal cord, and nervous system. Our expert neurologists provide compassionate care for conditions such as migraines, epilepsy, stroke, Parkinson's disease, and multiple sclerosis. We offer advanced diagnostic tools, personalized treatment plans, and rehabilitation services to help patients regain function and improve their quality of life.",
      features: [
        "EEG & EMG Testing",
        "MRI & CT Neuroimaging",
        "Stroke Treatment",
        "Epilepsy Management",
        "Movement Disorder Care",
        "Neurological Rehabilitation"
      ],
      commonConditions: [
        "Migraines & Headaches",
        "Epilepsy & Seizures",
        "Stroke Recovery",
        "Parkinson's Disease",
        "Multiple Sclerosis",
        "Memory Disorders"
      ],
      doctors: ["Dr. John Taylor", "Dr. Maria Garcia", "Dr. Lisa Thompson"],
      equipment: ["MRI Scanner", "EEG Machine", "EMG Equipment", "Neurological Assessment Tools"]
    },
    {
      icon: <Bone className="h-12 w-12" />,
      title: "Orthopedics",
      description: "Treatment for bone and joint related conditions",
      details: "Orthopedics at CuraBot provides specialized care for musculoskeletal conditions, including bone, joint, ligament, tendon, and muscle injuries. Our orthopedic surgeons and specialists offer comprehensive treatment for fractures, arthritis, sports injuries, and spinal disorders. We provide both surgical and non-surgical interventions, focusing on pain relief, restoring mobility, and improving overall function through personalized rehabilitation programs.",
      features: [
        "Joint Replacement Surgery",
        "Arthroscopic Procedures",
        "Sports Medicine",
        "Spine Surgery",
        "Fracture Treatment",
        "Physical Therapy"
      ],
      commonConditions: [
        "Arthritis & Joint Pain",
        "Sports Injuries",
        "Fractures & Trauma",
        "Back & Spine Problems",
        "Shoulder & Knee Issues",
        "Osteoporosis"
      ],
      doctors: ["Dr. Robert Smith", "Dr. Lisa Anderson", "Dr. Kevin Park"],
      equipment: ["Digital X-Ray", "MRI Scanner", "Arthroscopy Equipment", "Physical Therapy Tools"]
    },
    {
      icon: <Baby className="h-12 w-12" />,
      title: "Pediatrics",
      description: "Specialized healthcare for children and adolescents",
      details: "Pediatrics at CuraBot is dedicated to the health and well-being of infants, children, and adolescents. Our pediatricians provide comprehensive healthcare services, including routine check-ups, vaccinations, developmental screenings, and management of acute and chronic childhood illnesses. We create a child-friendly environment, ensuring that young patients receive the best possible care in a comforting and supportive setting.",
      features: [
        "Well-Child Visits",
        "Immunizations & Vaccines",
        "Growth & Development Monitoring",
        "Newborn Care",
        "Adolescent Medicine",
        "Behavioral Health Support"
      ],
      commonConditions: [
        "Common Childhood Illnesses",
        "Asthma & Allergies",
        "ADHD & Learning Disabilities",
        "Growth Disorders",
        "Skin Conditions",
        "Nutritional Counseling"
      ],
      doctors: ["Dr. Emily Williams", "Dr. David Brown", "Dr. Jennifer Lee"],
      equipment: ["Pediatric Examination Tools", "Growth Charts", "Vaccination Supplies", "Child-Friendly Environment"]
    },
    {
      icon: <Flask className="h-12 w-12" />,
      title: "Laboratory Services",
      description: "Advanced diagnostic and testing facilities",
      details: "CuraBot's Laboratory Services offer a full range of advanced diagnostic tests to support accurate and timely medical diagnoses. Our state-of-the-art laboratory is equipped to perform blood tests, urine analyses, pathology, microbiology, and genetic testing. We ensure precise results through rigorous quality control and efficient processes, providing essential information for effective patient care.",
      features: [
        "Blood Chemistry Analysis",
        "Hematology Testing",
        "Microbiology & Culture",
        "Pathology Services",
        "Genetic Testing",
        "Rapid Diagnostic Tests"
      ],
      commonConditions: [
        "Diabetes Monitoring",
        "Cholesterol Screening",
        "Infection Detection",
        "Cancer Screening",
        "Hormone Level Testing",
        "Drug Testing"
      ],
      doctors: ["Dr. Patricia Kumar", "Dr. Mark Stevens", "Dr. Rachel Green"],
      equipment: ["Automated Analyzers", "Microscopes", "Centrifuges", "PCR Machines"]
    },
    {
      icon: <Bandage className="h-12 w-12" />,
      title: "Emergency Care",
      description: "24/7 emergency medical services",
      details: "CuraBot provides 24/7 Emergency Care for urgent medical conditions and injuries. Our emergency department is staffed by highly trained physicians, nurses, and support staff who are equipped to handle a wide range of medical emergencies. We prioritize rapid assessment and immediate intervention, ensuring that patients receive critical care when every second counts.",
      features: [
        "24/7 Emergency Department",
        "Trauma Care",
        "Cardiac Emergency Response",
        "Stroke Treatment",
        "Critical Care Unit",
        "Emergency Surgery"
      ],
      commonConditions: [
        "Heart Attack & Chest Pain",
        "Stroke & Neurological Emergencies",
        "Trauma & Accidents",
        "Severe Infections",
        "Respiratory Distress",
        "Poisoning & Overdose"
      ],
      doctors: ["Dr. Michael Torres", "Dr. Sarah Kim", "Dr. Alex Johnson"],
      equipment: ["Advanced Life Support", "Defibrillators", "Ventilators", "Emergency Surgical Suite"]
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Preventive Care",
      description: "Regular check-ups and health monitoring",
      details: "Preventive Care at CuraBot focuses on maintaining your health and preventing the onset of diseases. We offer comprehensive health screenings, regular check-ups, vaccinations, and personalized wellness plans. Our goal is to empower patients with the knowledge and tools to make informed lifestyle choices, reduce health risks, and promote long-term well-being.",
      features: [
        "Annual Physical Exams",
        "Health Risk Assessments",
        "Cancer Screenings",
        "Vaccination Programs",
        "Wellness Coaching",
        "Nutritional Counseling"
      ],
      commonConditions: [
        "High Blood Pressure",
        "High Cholesterol",
        "Diabetes Prevention",
        "Obesity Management",
        "Smoking Cessation",
        "Stress Management"
      ],
      doctors: ["Dr. Catherine White", "Dr. Thomas Anderson", "Dr. Nicole Parker"],
      equipment: ["Body Composition Analyzers", "Blood Pressure Monitors", "Fitness Assessment Tools", "Nutritional Analysis Software"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 hover:text-emerald-600 transition-colors duration-300">Our Services</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
          >
            <div className="text-emerald-600 mb-4 transform transition-transform duration-300 group-hover:scale-110">
              {service.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors duration-300">
              {service.title}
            </h3>
            <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
              {service.description}
            </p>
            <button
              onClick={() => {
                console.log('Learn More clicked for:', service.title);
                const servicePath = `/services/${service.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                console.log('Navigating to:', servicePath);
                window.location.href = servicePath;
              }}
              className="mt-4 text-emerald-600 font-semibold hover:text-emerald-800 transition-all duration-300 group-hover:translate-x-2 inline-flex items-center bg-transparent border-none cursor-pointer"
            >
              Learn More
              <svg
                className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
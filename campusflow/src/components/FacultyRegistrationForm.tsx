import React, { useState } from 'react';
import { XMarkIcon, UserIcon, AcademicCapIcon, HomeIcon, PhoneIcon, DocumentTextIcon, StarIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface FacultyRegistrationFormProps {
  onClose: () => void;
  onSubmit: (facultyData: any) => void;
  isOpen: boolean;
}

const FacultyRegistrationForm: React.FC<FacultyRegistrationFormProps> = ({ onClose, onSubmit, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    designation: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    joiningDate: new Date().toISOString().split('T')[0],
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    
    // Emergency Contact
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
      email: ''
    },
    
    // Professional Details
    professionalDetails: {
      qualification: '',
      specialization: '',
      experience: 0,
      previousInstitution: '',
      researchAreas: '',
      publications: '',
      awards: '',
      certifications: ''
    },
    
    // Family Information
    familyDetails: {
      maritalStatus: 'Single',
      spouseName: '',
      spouseOccupation: '',
      children: 0,
      fatherName: '',
      motherName: '',
      guardianName: '',
      guardianPhone: ''
    },
    
    // Medical Information
    medicalDetails: {
      allergies: '',
      medications: '',
      medicalConditions: '',
      emergencyMedicalInfo: ''
    },
    
    // Documents
    documents: {
      aadharNumber: '',
      panNumber: '',
      passportNumber: '',
      drivingLicense: '',
      bankAccountNumber: '',
      ifscCode: ''
    },
    
    // Additional Information
    additionalInfo: {
      hobbies: '',
      achievements: '',
      specialSkills: '',
      notes: ''
    }
  });

  const steps = [
    { id: 1, name: 'Basic Information', icon: UserIcon },
    { id: 2, name: 'Address & Contact', icon: HomeIcon },
    { id: 3, name: 'Professional Details', icon: BriefcaseIcon },
    { id: 4, name: 'Family Information', icon: PhoneIcon },
    { id: 5, name: 'Medical & Documents', icon: DocumentTextIcon },
    { id: 6, name: 'Additional Information', icon: StarIcon }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const facultyData = {
      ...formData,
      role: 'faculty',
      createdAt: new Date(),
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      joiningDate: new Date(formData.joiningDate)
    };
    onSubmit(facultyData);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Faculty Registration</h2>
              <p className="text-orange-100">Complete faculty profile setup</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center overflow-x-auto pb-2 space-x-2 scrollbar-hide">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-500 transform ${
                    currentStep >= step.id 
                      ? 'bg-white text-orange-600 shadow-xl scale-110 rotate-0' 
                      : 'bg-orange-300 text-white scale-100'
                  } ${currentStep === step.id ? 'animate-pulse shadow-2xl' : ''} ${currentStep > step.id ? 'animate-bounce' : ''}`}>
                    {currentStep > step.id ? (
                      <XMarkIcon className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 min-w-0">
                    <span className={`text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step.id ? 'text-white' : 'text-orange-200'
                    } ${currentStep === step.id ? 'font-bold text-lg' : ''}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step.id ? 'bg-white' : 'bg-orange-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="animate-fadeIn">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-slideInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="faculty@college.edu"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="EMP2024001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="Computer Science"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation *
                    </label>
                    <select
                      required
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Designation</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Visiting Faculty">Visiting Faculty</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joiningDate}
                      onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address & Contact */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-slideInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HomeIcon className="w-6 h-6 mr-2 text-green-600" />
                  Address & Contact Information
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Permanent Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="House No., Street Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="City"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="State"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.address.pincode}
                        onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="123456"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="Emergency contact name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation *
                      </label>
                      <select
                        required
                        value={formData.emergencyContact.relation}
                        onChange={(e) => handleInputChange('emergencyContact.relation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <option value="">Select Relation</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Child">Child</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.emergencyContact.phone}
                        onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.emergencyContact.email}
                        onChange={(e) => handleInputChange('emergencyContact.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                        placeholder="emergency@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Professional Details */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-slideInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BriefcaseIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Professional Details
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Academic & Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Qualification *
                      </label>
                      <select
                        required
                        value={formData.professionalDetails.qualification}
                        onChange={(e) => handleInputChange('professionalDetails.qualification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      >
                        <option value="">Select Qualification</option>
                        <option value="Ph.D">Ph.D</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="M.E">M.E</option>
                        <option value="M.Sc">M.Sc</option>
                        <option value="M.A">M.A</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.E">B.E</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.professionalDetails.specialization}
                        onChange={(e) => handleInputChange('professionalDetails.specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        placeholder="Computer Science, Mathematics, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.professionalDetails.experience}
                        onChange={(e) => handleInputChange('professionalDetails.experience', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        min="0"
                        max="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Institution
                      </label>
                      <input
                        type="text"
                        value={formData.professionalDetails.previousInstitution}
                        onChange={(e) => handleInputChange('professionalDetails.previousInstitution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        placeholder="Previous workplace"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Research Areas
                      </label>
                      <textarea
                        value={formData.professionalDetails.researchAreas}
                        onChange={(e) => handleInputChange('professionalDetails.researchAreas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        rows={3}
                        placeholder="Machine Learning, AI, Data Science, etc."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publications
                      </label>
                      <textarea
                        value={formData.professionalDetails.publications}
                        onChange={(e) => handleInputChange('professionalDetails.publications', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        rows={3}
                        placeholder="List your publications, papers, etc."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Awards & Recognition
                      </label>
                      <textarea
                        value={formData.professionalDetails.awards}
                        onChange={(e) => handleInputChange('professionalDetails.awards', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        rows={3}
                        placeholder="Awards, recognition, achievements"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certifications
                      </label>
                      <textarea
                        value={formData.professionalDetails.certifications}
                        onChange={(e) => handleInputChange('professionalDetails.certifications', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        rows={3}
                        placeholder="Professional certifications, courses completed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Family Information */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-slideInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-6 h-6 mr-2 text-orange-600" />
                  Family Information
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Personal & Family Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marital Status *
                      </label>
                      <select
                        required
                        value={formData.familyDetails.maritalStatus}
                        onChange={(e) => handleInputChange('familyDetails.maritalStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Children
                      </label>
                      <input
                        type="number"
                        value={formData.familyDetails.children}
                        onChange={(e) => handleInputChange('familyDetails.children', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        min="0"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spouse Name
                      </label>
                      <input
                        type="text"
                        value={formData.familyDetails.spouseName}
                        onChange={(e) => handleInputChange('familyDetails.spouseName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        placeholder="Spouse full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spouse Occupation
                      </label>
                      <input
                        type="text"
                        value={formData.familyDetails.spouseOccupation}
                        onChange={(e) => handleInputChange('familyDetails.spouseOccupation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        placeholder="Occupation"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        value={formData.familyDetails.fatherName}
                        onChange={(e) => handleInputChange('familyDetails.fatherName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        placeholder="Father's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Name
                      </label>
                      <input
                        type="text"
                        value={formData.familyDetails.motherName}
                        onChange={(e) => handleInputChange('familyDetails.motherName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        placeholder="Mother's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Name
                      </label>
                      <input
                        type="text"
                        value={formData.familyDetails.guardianName}
                        onChange={(e) => handleInputChange('familyDetails.guardianName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        placeholder="Guardian's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.familyDetails.guardianPhone}
                        onChange={(e) => handleInputChange('familyDetails.guardianPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Medical & Documents */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-slideInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-red-600" />
                  Medical & Document Information
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies
                      </label>
                      <textarea
                        value={formData.medicalDetails.allergies}
                        onChange={(e) => handleInputChange('medicalDetails.allergies', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        rows={3}
                        placeholder="List any known allergies"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Medications
                      </label>
                      <textarea
                        value={formData.medicalDetails.medications}
                        onChange={(e) => handleInputChange('medicalDetails.medications', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        rows={3}
                        placeholder="List any current medications"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Conditions
                      </label>
                      <textarea
                        value={formData.medicalDetails.medicalConditions}
                        onChange={(e) => handleInputChange('medicalDetails.medicalConditions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        rows={3}
                        placeholder="Any medical conditions or disabilities"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Medical Information
                      </label>
                      <textarea
                        value={formData.medicalDetails.emergencyMedicalInfo}
                        onChange={(e) => handleInputChange('medicalDetails.emergencyMedicalInfo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        rows={3}
                        placeholder="Important medical information for emergencies"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Document Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={formData.documents.aadharNumber}
                        onChange={(e) => handleInputChange('documents.aadharNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        placeholder="1234 5678 9012"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.documents.panNumber}
                        onChange={(e) => handleInputChange('documents.panNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={formData.documents.passportNumber}
                        onChange={(e) => handleInputChange('documents.passportNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        placeholder="Passport number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driving License
                      </label>
                      <input
                        type="text"
                        value={formData.documents.drivingLicense}
                        onChange={(e) => handleInputChange('documents.drivingLicense', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        placeholder="Driving license number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.documents.bankAccountNumber}
                        onChange={(e) => handleInputChange('documents.bankAccountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        placeholder="Bank account number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.documents.ifscCode}
                        onChange={(e) => handleInputChange('documents.ifscCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        placeholder="IFSC code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Additional Information */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-slideInUp">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="w-6 h-6 mr-2 text-yellow-600" />
                  Additional Information
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hobbies & Interests
                      </label>
                      <textarea
                        value={formData.additionalInfo.hobbies}
                        onChange={(e) => handleInputChange('additionalInfo.hobbies', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                        rows={3}
                        placeholder="Sports, music, reading, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Achievements & Awards
                      </label>
                      <textarea
                        value={formData.additionalInfo.achievements}
                        onChange={(e) => handleInputChange('additionalInfo.achievements', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                        rows={3}
                        placeholder="Professional achievements, awards, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Skills
                      </label>
                      <textarea
                        value={formData.additionalInfo.specialSkills}
                        onChange={(e) => handleInputChange('additionalInfo.specialSkills', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                        rows={3}
                        placeholder="Technical skills, languages, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.additionalInfo.notes}
                        onChange={(e) => handleInputChange('additionalInfo.notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
                        rows={4}
                        placeholder="Any additional information or special requirements"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 rounded-md font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
                  >
                    Create Faculty Account
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyRegistrationForm;

import React, { useState } from 'react';
import { XMarkIcon, UserIcon, AcademicCapIcon, HomeIcon, PhoneIcon, DocumentTextIcon, HeartIcon, StarIcon, CheckIcon } from '@heroicons/react/24/outline';
import { courses, branches, getSubjectsByCourse } from '../data/courses';
import { SemesterSubject } from '../types';

interface StudentRegistrationFormProps {
  onClose: () => void;
  onSubmit: (studentData: any) => void;
  isOpen: boolean;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({ onClose, onSubmit, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    enrollmentNumber: '',
    rollNumber: '',
    admissionYear: new Date().getFullYear(),
    currentSemester: 1,
    section: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    courseId: '',
    courseName: '',
    branchId: '',
    branchName: '',
    selectedSubjects: [] as SemesterSubject[],
    
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
    
    // Parent Details
    parentDetails: {
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      fatherOccupation: '',
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      motherOccupation: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      guardianRelation: ''
    },
    
    // Academic Details
    academicDetails: {
      previousSchool: '',
      previousQualification: '',
      percentage: 0,
      board: '',
      yearOfPassing: new Date().getFullYear() - 1
    },
    
    // Medical Details
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
      drivingLicense: ''
    },
    
    // Additional Info
    additionalInfo: {
      hobbies: '',
      achievements: '',
      specialSkills: '',
      notes: ''
    }
  });

  const steps = [
    { id: 1, name: 'Basic Information', icon: UserIcon },
    { id: 2, name: 'Course & Subjects', icon: AcademicCapIcon },
    { id: 3, name: 'Address & Contact', icon: HomeIcon },
    { id: 4, name: 'Parent Details', icon: PhoneIcon },
    { id: 5, name: 'Academic Background', icon: DocumentTextIcon },
    { id: 6, name: 'Medical & Documents', icon: HeartIcon },
    { id: 7, name: 'Additional Information', icon: StarIcon }
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

  const handleCourseChange = (courseId: string) => {
    const selectedCourse = courses.find(course => course.id === courseId);
    if (selectedCourse) {
      const courseSubjects = getSubjectsByCourse(courseId);
      setFormData(prev => ({
        ...prev,
        courseId: courseId,
        courseName: selectedCourse.name,
        branchId: selectedCourse.branchId,
        branchName: selectedCourse.branchName,
        selectedSubjects: courseSubjects
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData = {
      ...formData,
      role: 'student',
      createdAt: new Date(),
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
    };
    onSubmit(studentData);
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
              <h2 className="text-2xl font-bold">Student Registration</h2>
              <p className="text-orange-100">Complete student profile setup</p>
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
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold ${
                    currentStep >= step.id 
                      ? 'bg-white text-orange-600 shadow-lg' 
                      : 'bg-orange-300 text-white'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 min-w-0">
                    <span className={`text-sm font-semibold ${
                      currentStep >= step.id ? 'text-white' : 'text-orange-200'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-4 rounded-full ${
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
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="student@college.edu"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.enrollmentNumber}
                      onChange={(e) => handleInputChange('enrollmentNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="EN2024001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="001"
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      Course *
                    </label>
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={formData.branchName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      placeholder="Selected automatically based on course"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admission Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.admissionYear}
                      onChange={(e) => handleInputChange('admissionYear', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="2020"
                      max="2030"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Semester *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.currentSemester}
                      onChange={(e) => handleInputChange('currentSemester', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="A, B, C"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Course & Subjects */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Course & Subject Selection
                </h3>
                
                {formData.courseId ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">Selected Course</h4>
                      <p className="text-green-700">{formData.courseName}</p>
                      <p className="text-sm text-green-600">Branch: {formData.branchName}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Subjects by Semester</h4>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => {
                          const semesterSubjects = formData.selectedSubjects.filter(subject => subject.semester === semester);
                          if (semesterSubjects.length === 0) return null;
                          
                          return (
                            <div key={semester} className="border border-gray-200 rounded-lg p-4">
                              <h5 className="font-medium text-gray-800 mb-3">Semester {semester}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {semesterSubjects.map(subject => (
                                  <div key={subject.id} className="flex items-center justify-between bg-white p-3 rounded border">
                                    <div>
                                      <span className="font-medium text-gray-900">{subject.subjectName}</span>
                                      <span className="text-sm text-gray-500 ml-2">({subject.subjectCode})</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {subject.credits} credits
                                      {subject.isElective && <span className="ml-2 text-blue-600">(Elective)</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800">Please select a course in the previous step to view subjects.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Address & Contact */}
            {currentStep === 3 && (
              <div className="space-y-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Relation</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Guardian">Guardian</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="emergency@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Parent Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="w-6 h-6 mr-2 text-purple-600" />
                  Parent/Guardian Details
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Father's Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.parentDetails.fatherName}
                        onChange={(e) => handleInputChange('parentDetails.fatherName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Father's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.parentDetails.fatherPhone}
                        onChange={(e) => handleInputChange('parentDetails.fatherPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Email
                      </label>
                      <input
                        type="email"
                        value={formData.parentDetails.fatherEmail}
                        onChange={(e) => handleInputChange('parentDetails.fatherEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="father@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Occupation
                      </label>
                      <input
                        type="text"
                        value={formData.parentDetails.fatherOccupation}
                        onChange={(e) => handleInputChange('parentDetails.fatherOccupation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Occupation"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Mother's Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.parentDetails.motherName}
                        onChange={(e) => handleInputChange('parentDetails.motherName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mother's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.parentDetails.motherPhone}
                        onChange={(e) => handleInputChange('parentDetails.motherPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Email
                      </label>
                      <input
                        type="email"
                        value={formData.parentDetails.motherEmail}
                        onChange={(e) => handleInputChange('parentDetails.motherEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mother@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother's Occupation
                      </label>
                      <input
                        type="text"
                        value={formData.parentDetails.motherOccupation}
                        onChange={(e) => handleInputChange('parentDetails.motherOccupation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Occupation"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Guardian Information (If Different)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian's Name
                      </label>
                      <input
                        type="text"
                        value={formData.parentDetails.guardianName}
                        onChange={(e) => handleInputChange('parentDetails.guardianName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Guardian's full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian's Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.parentDetails.guardianPhone}
                        onChange={(e) => handleInputChange('parentDetails.guardianPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian's Email
                      </label>
                      <input
                        type="email"
                        value={formData.parentDetails.guardianEmail}
                        onChange={(e) => handleInputChange('parentDetails.guardianEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="guardian@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation to Student
                      </label>
                      <input
                        type="text"
                        value={formData.parentDetails.guardianRelation}
                        onChange={(e) => handleInputChange('parentDetails.guardianRelation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Uncle, Aunt, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Academic Background */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2 text-orange-600" />
                  Academic Background
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Previous Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous School/College *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.academicDetails.previousSchool}
                        onChange={(e) => handleInputChange('academicDetails.previousSchool', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Previous school name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification *
                      </label>
                      <select
                        required
                        value={formData.academicDetails.previousQualification}
                        onChange={(e) => handleInputChange('academicDetails.previousQualification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Qualification</option>
                        <option value="10th">10th Standard</option>
                        <option value="12th">12th Standard</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Board/University
                      </label>
                      <input
                        type="text"
                        value={formData.academicDetails.board}
                        onChange={(e) => handleInputChange('academicDetails.board', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="CBSE, State Board, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Passing *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.academicDetails.yearOfPassing}
                        onChange={(e) => handleInputChange('academicDetails.yearOfPassing', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="2000"
                        max="2030"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Percentage/Marks *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.academicDetails.percentage}
                        onChange={(e) => handleInputChange('academicDetails.percentage', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="85.5"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Medical & Documents */}
            {currentStep === 6 && (
              <div className="space-y-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Driving license number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Additional Information */}
            {currentStep === 7 && (
              <div className="space-y-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Academic achievements, sports awards, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Skills
                      </label>
                      <textarea
                        value={formData.additionalInfo.specialSkills}
                        onChange={(e) => handleInputChange('additionalInfo.specialSkills', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Programming, languages, technical skills, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.additionalInfo.notes}
                        onChange={(e) => handleInputChange('additionalInfo.notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`px-4 py-2 rounded-md font-medium ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Create Student Account
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

export default StudentRegistrationForm;

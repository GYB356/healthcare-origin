import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiFileText, FiUser, FiCalendar, FiClock, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PrescriptionForm = ({ prescription, onClose, onSave }) => {
  const { currentUser } = useAuth();
  const isEditing = !!prescription;
  
  const [formData, setFormData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    patientId: '',
    prescribedById: currentUser?._id || '',
    prescribedDate: new Date(),
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    refillsAllowed: 0,
    refillsRemaining: 0,
    notes: '',
    type: 'medication',
    discontinued: false
  });
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // If editing, populate form with prescription data
    if (isEditing && prescription) {
      setFormData({
        medication: prescription.medication || '',
        dosage: prescription.dosage || '',
        frequency: prescription.frequency || '',
        duration: prescription.duration || '',
        instructions: prescription.instructions || '',
        patientId: prescription.patient?._id || '',
        prescribedById: prescription.prescribedBy?._id || currentUser?._id || '',
        prescribedDate: prescription.prescribedDate ? new Date(prescription.prescribedDate) : new Date(),
        expiryDate: prescription.expiryDate ? new Date(prescription.expiryDate) : new Date(new Date().setMonth(new Date().getMonth() + 3)),
        refillsAllowed: prescription.refillsAllowed || 0,
        refillsRemaining: prescription.refillsRemaining || 0,
        notes: prescription.notes || '',
        type: prescription.type || 'medication',
        discontinued: prescription.discontinued || false
      });
    }
    
    // Load patients if user is a doctor
    if (currentUser?.role === 'doctor' || currentUser?.role === 'admin') {
      fetchPatients();
    }
  }, [prescription, currentUser]);
  
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError('Error loading patients. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'refillsAllowed') {
      // If not editing, set refillsRemaining to the same value
      if (!isEditing) {
        setFormData(prev => ({
          ...prev,
          [name]: parseInt(value, 10) || 0,
          refillsRemaining: parseInt(value, 10) || 0
        }));
        return;
      }
    }
    
    if (name === 'discontinued' && value === 'true') {
      // If discontinuing, set refillsRemaining to 0
      setFormData(prev => ({
        ...prev,
        [name]: value === 'true',
        refillsRemaining: 0
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'refillsAllowed' || name === 'refillsRemaining' 
        ? parseInt(value, 10) || 0 
        : name === 'discontinued' 
          ? value === 'true' 
          : value
    }));
  };
  
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  const validateForm = () => {
    if (!formData.medication) {
      setError('Please enter a medication name');
      return false;
    }
    
    if (!formData.dosage) {
      setError('Please enter a dosage');
      return false;
    }
    
    if (!formData.frequency) {
      setError('Please enter a frequency');
      return false;
    }
    
    if (!formData.instructions) {
      setError('Please enter instructions');
      return false;
    }
    
    if (!formData.patientId) {
      setError('Please select a patient');
      return false;
    }
    
    if (!formData.expiryDate) {
      setError('Please select an expiry date');
      return false;
    }
    
    if (formData.expiryDate < formData.prescribedDate) {
      setError('Expiry date must be after prescribed date');
      return false;
    }
    
    if (formData.refillsAllowed < 0) {
      setError('Refills allowed cannot be negative');
      return false;
    }
    
    if (formData.refillsRemaining < 0 || formData.refillsRemaining > formData.refillsAllowed) {
      setError('Refills remaining must be between 0 and refills allowed');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const url = isEditing 
        ? `/api/prescriptions/${prescription._id}` 
        : '/api/prescriptions';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save prescription');
      }
      
      const savedPrescription = await response.json();
      
      // Call the onSave callback with the saved prescription
      if (onSave) {
        onSave(savedPrescription);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Error saving prescription. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {isEditing ? 'Edit Prescription' : 'New Prescription'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 m-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="medication" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Medication Name*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="medication"
                id="medication"
                value={formData.medication}
                onChange={handleChange}
                className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="e.g. Amoxicillin"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Dosage*
              </label>
              <input
                type="text"
                name="dosage"
                id="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 500mg"
                required
              />
            </div>
            
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Frequency*
              </label>
              <input
                type="text"
                name="frequency"
                id="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="e.g. 3 times daily"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              id="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 10 days"
            />
          </div>
          
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instructions*
            </label>
            <textarea
              name="instructions"
              id="instructions"
              rows="3"
              value={formData.instructions}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="e.g. Take with food. Complete the full course of treatment."
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Patient*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="patientId"
                id="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                disabled={loading || isEditing}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prescribedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prescribed Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <DatePicker
                  selected={formData.prescribedDate}
                  onChange={(date) => handleDateChange(date, 'prescribedDate')}
                  dateFormat="MMMM d, yyyy"
                  className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  maxDate={new Date()}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiry Date*
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="h-5 w-5 text-gray-400" />
                </div>
                <DatePicker
                  selected={formData.expiryDate}
                  onChange={(date) => handleDateChange(date, 'expiryDate')}
                  dateFormat="MMMM d, yyyy"
                  className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  minDate={formData.prescribedDate}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="refillsAllowed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Refills Allowed
              </label>
              <input
                type="number"
                name="refillsAllowed"
                id="refillsAllowed"
                value={formData.refillsAllowed}
                onChange={handleChange}
                min="0"
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="refillsRemaining" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Refills Remaining
              </label>
              <input
                type="number"
                name="refillsRemaining"
                id="refillsRemaining"
                value={formData.refillsRemaining}
                onChange={handleChange}
                min="0"
                max={formData.refillsAllowed}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prescription Type
            </label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="medication">Medication</option>
              <option value="controlled">Controlled Substance</option>
              <option value="otc">Over-the-Counter</option>
              <option value="equipment">Medical Equipment</option>
              <option value="supplement">Supplement</option>
            </select>
          </div>
          
          {isEditing && (
            <div>
              <label htmlFor="discontinued" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="discontinued"
                id="discontinued"
                value={formData.discontinued.toString()}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="false">Active</option>
                <option value="true">Discontinued</option>
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (for healthcare providers only)
            </label>
            <textarea
              name="notes"
              id="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Additional notes for healthcare providers"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                submitting
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiCheck className="mr-2" />
                  {isEditing ? 'Update Prescription' : 'Create Prescription'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionForm;

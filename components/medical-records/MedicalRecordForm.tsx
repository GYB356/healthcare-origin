import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface MedicalRecordFormProps {
  patientId: string;
  onSuccess?: () => void;
  initialData?: any;
}

export default function MedicalRecordForm({ patientId, onSuccess, initialData }: MedicalRecordFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    diagnosis: initialData?.diagnosis || '',
    prescription: initialData?.prescription || '',
    notes: initialData?.notes || '',
    bloodPressure: initialData?.bloodPressure || '',
    heartRate: initialData?.heartRate || '',
    temperature: initialData?.temperature || '',
    respiratoryRate: initialData?.respiratoryRate || '',
    oxygenSaturation: initialData?.oxygenSaturation || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/medical-records', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId,
          id: initialData?.id,
        }),
      });

      if (response.ok) {
        toast.success(`Medical record ${initialData ? 'updated' : 'created'} successfully`);
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save medical record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prescription</label>
          <input
            type="text"
            name="prescription"
            value={formData.prescription}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
          <input
            type="text"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleChange}
            placeholder="120/80"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Heart Rate</label>
          <input
            type="text"
            name="heartRate"
            value={formData.heartRate}
            onChange={handleChange}
            placeholder="bpm"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Temperature</label>
          <input
            type="text"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="°C"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Height</label>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="cm"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="kg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Record' : 'Create Record'}
        </button>
      </div>
    </form>
  );
} 
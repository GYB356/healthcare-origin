import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface InvoiceFormProps {
  patientId: string;
  onSuccess?: () => void;
  initialData?: any;
}

export default function InvoiceForm({ patientId, onSuccess, initialData }: InvoiceFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    tax: initialData?.tax || '',
    discount: initialData?.discount || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = (
        parseFloat(formData.amount) +
        parseFloat(formData.tax || '0') -
        parseFloat(formData.discount || '0')
      ).toFixed(2);

      const response = await fetch('/api/invoices', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: initialData?.id,
          patientId,
          totalAmount: parseFloat(totalAmount),
        }),
      });

      if (response.ok) {
        toast.success(`Invoice ${initialData ? 'updated' : 'created'} successfully`);
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save invoice');
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tax</label>
          <input
            type="number"
            name="tax"
            value={formData.tax}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
} 
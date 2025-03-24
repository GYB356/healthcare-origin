import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import InvoiceForm from "./InvoiceForm";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  description: string;
  dueDate: string;
  status: string;
  patient: {
    name: string;
  };
  createdAt: string;
}

interface InvoiceListProps {
  patientId?: string;
}

export default function InvoiceList({ patientId }: InvoiceListProps) {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`/api/invoices${patientId ? `?patientId=${patientId}` : ""}`);
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [patientId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Invoice deleted successfully");
        fetchInvoices();
      } else {
        toast.error("Failed to delete invoice");
      }
    } catch (error) {
      toast.error("Error deleting invoice");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Invoice status updated successfully");
        fetchInvoices();
      } else {
        toast.error("Failed to update invoice status");
      }
    } catch (error) {
      toast.error("Error updating invoice status");
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">
              {selectedInvoice ? "Edit Invoice" : "New Invoice"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedInvoice(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
          <InvoiceForm
            patientId={patientId || ""}
            initialData={selectedInvoice}
            onSuccess={() => {
              setShowForm(false);
              setSelectedInvoice(null);
              fetchInvoices();
            }}
          />
        </div>
      ) : (
        <>
          {(session?.user?.role === "STAFF" || session?.user?.role === "ADMIN") && patientId && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create New Invoice
            </button>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${invoice.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session?.user?.role === "STAFF" || session?.user?.role === "ADMIN" ? (
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                          <option value="PARTIALLY_PAID">Partially Paid</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : invoice.status === "PARTIALLY_PAID"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invoice.status.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(session?.user?.role === "STAFF" || session?.user?.role === "ADMIN") && (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

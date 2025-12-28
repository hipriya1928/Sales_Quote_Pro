'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IQuotation } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function QuotationDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [quotation, setQuotation] = useState<IQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations/${id}`);
      const result = await response.json();

      if (result.success) {
        setQuotation(result.data);
      } else {
        setError(result.error || 'Failed to fetch quotation');
      }
    } catch (err) {
      setError('Failed to fetch quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/pdf/${id}`, '_blank');
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setQuotation(result.data);
        alert('Status updated successfully!');
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading quotation...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600">{error || 'Quotation not found'}</p>
          <Button variant="primary" onClick={() => router.push('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="secondary" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>

        {/* Header */}
        <Card className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {quotation.quotationNumber}
              </h1>
              <p className="text-gray-600">
                Date: {new Date(quotation.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  quotation.status
                )}`}
              >
                {quotation.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={quotation.status === 'sent' ? 'primary' : 'secondary'}
              onClick={() => handleStatusChange('sent')}
              disabled={quotation.status === 'sent'}
            >
              Mark as Sent
            </Button>
            <Button
              size="sm"
              variant={quotation.status === 'accepted' ? 'success' : 'secondary'}
              onClick={() => handleStatusChange('accepted')}
              disabled={quotation.status === 'accepted'}
            >
              Mark as Accepted
            </Button>
            <Button
              size="sm"
              variant={quotation.status === 'rejected' ? 'danger' : 'secondary'}
              onClick={() => handleStatusChange('rejected')}
              disabled={quotation.status === 'rejected'}
            >
              Mark as Rejected
            </Button>
          </div>
        </Card>

        {/* Client Information */}
        <Card title="Client Information" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{quotation.client.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{quotation.client.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{quotation.client.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">
                {quotation.client.address}, {quotation.client.city}, {quotation.client.state}{' '}
                {quotation.client.zipCode}, {quotation.client.country}
              </p>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card title="Products" className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotation.products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ${product.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      ${product.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${quotation.subtotal.toFixed(2)}</span>
              </div>
              {quotation.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">
                    -${quotation.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({quotation.taxRate}%):</span>
                <span className="font-medium">${quotation.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">${quotation.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes and Terms */}
        {quotation.notes && (
          <Card title="Notes" className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
          </Card>
        )}

        {quotation.terms && (
          <Card title="Terms & Conditions" className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{quotation.terms}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

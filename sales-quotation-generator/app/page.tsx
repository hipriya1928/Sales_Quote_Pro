'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IQuotation } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  const [quotations, setQuotations] = useState<IQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotations');
      const result = await response.json();

      if (result.success) {
        setQuotations(result.data.quotations);
      } else {
        setError(result.error || 'Failed to fetch quotations');
      }
    } catch (err) {
      setError('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchQuotations();
      } else {
        alert(result.error || 'Failed to delete quotation');
      }
    } catch (err) {
      alert('Failed to delete quotation');
    }
  };

  const handleDownloadPDF = (id: string, quotationNumber: string) => {
    window.open(`/api/pdf/${id}`, '_blank');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Quotation Generator</h1>
            <p className="text-gray-600 mt-1">Manage and create professional quotations</p>
          </div>
          <Link href="/quotations/new">
            <Button variant="primary" size="lg">
              Create New Quotation
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card>
            <p className="text-center text-gray-600">Loading quotations...</p>
          </Card>
        ) : error ? (
          <Card>
            <p className="text-center text-red-600">{error}</p>
          </Card>
        ) : quotations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first quotation</p>
              <Link href="/quotations/new">
                <Button variant="primary">Create Quotation</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quotations.map((quotation) => (
              <Card key={quotation._id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quotation.quotationNumber}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          quotation.status
                        )}`}
                      >
                        {quotation.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      <strong>Client:</strong> {quotation.client.name}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Valid Until:</strong>{' '}
                      {new Date(quotation.validUntil).toLocaleDateString()}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      Total: ${quotation.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        handleDownloadPDF(quotation._id!, quotation.quotationNumber)
                      }
                    >
                      Download PDF
                    </Button>
                    <Link href={`/quotations/${quotation._id}`}>
                      <Button size="sm" variant="primary">
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(quotation._id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

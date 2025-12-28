'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quotationFormSchema } from '@/lib/validations';
import { QuotationFormData, IClient, IProductMaster } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function NewQuotation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [products, setProducts] = useState<IProductMaster[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      client: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      products: [
        {
          name: '',
          description: '',
          unitPrice: 0,
          quantity: 1,
          total: 0,
        },
      ],
      taxRate: 0,
      discount: 0,
      discountType: 'percentage',
      notes: '',
      terms: 'Payment due within 30 days',
      validityDays: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const watchedProducts = watch('products');
  const taxRate = watch('taxRate');
  const discount = watch('discount');
  const discountType = watch('discountType');

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const result = await response.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch clients');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'manual') {
      setShowClientForm(true);
      setValue('client', {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      });
    } else if (clientId) {
      setShowClientForm(false);
      const selectedClient = clients.find((c) => c._id === clientId);
      if (selectedClient) {
        setValue('client', selectedClient);
      }
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    if (productId) {
      const selectedProduct = products.find((p) => p._id === productId);
      if (selectedProduct) {
        setValue(`products.${index}.name`, selectedProduct.name);
        setValue(`products.${index}.description`, selectedProduct.description);
        setValue(`products.${index}.unitPrice`, selectedProduct.unitPrice);
      }
    }
  };

  // Calculate totals
  const subtotal = watchedProducts.reduce(
    (sum, product) => sum + (product.unitPrice || 0) * (product.quantity || 0),
    0
  );

  const discountAmount =
    discountType === 'percentage' ? (subtotal * (discount || 0)) / 100 : discount || 0;

  const amountAfterDiscount = subtotal - discountAmount;
  const tax = (amountAfterDiscount * (taxRate || 0)) / 100;
  const total = amountAfterDiscount + tax;

  const onSubmit = async (data: QuotationFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('Quotation created successfully!');
        router.push('/');
      } else {
        alert(result.error || 'Failed to create quotation');
      }
    } catch (error) {
      alert('Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Quotation</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Client Information */}
          <Card title="Client Information" className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Client --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} - {client.email}
                  </option>
                ))}
                <option value="manual">Enter Manually</option>
              </select>
            </div>

            {(showClientForm || selectedClientId === 'manual' || selectedClientId) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client Name"
                  {...register('client.name')}
                  error={errors.client?.name?.message}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  {...register('client.email')}
                  error={errors.client?.email?.message}
                  required
                />
                <Input
                  label="Phone"
                  {...register('client.phone')}
                  error={errors.client?.phone?.message}
                  required
                />
                <Input
                  label="Address"
                  {...register('client.address')}
                  error={errors.client?.address?.message}
                  required
                />
                <Input
                  label="City"
                  {...register('client.city')}
                  error={errors.client?.city?.message}
                  required
                />
                <Input
                  label="State"
                  {...register('client.state')}
                  error={errors.client?.state?.message}
                  required
                />
                <Input
                  label="Zip Code"
                  {...register('client.zipCode')}
                  error={errors.client?.zipCode?.message}
                  required
                />
                <Input
                  label="Country"
                  {...register('client.country')}
                  error={errors.client?.country?.message}
                  required
                />
              </div>
            )}
          </Card>

          {/* Products */}
          <Card title="Products" className="mb-6">
            {fields.map((field, index) => (
              <div key={field.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Product {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Product
                  </label>
                  <select
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Product or Enter Manually --</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.unitPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Product Name"
                    {...register(`products.${index}.name`)}
                    error={errors.products?.[index]?.name?.message}
                    required
                  />
                  <Input
                    label="Description"
                    {...register(`products.${index}.description`)}
                    error={errors.products?.[index]?.description?.message}
                    required
                  />
                  <Input
                    label="Unit Price"
                    type="number"
                    step="0.01"
                    {...register(`products.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                    error={errors.products?.[index]?.unitPrice?.message}
                    required
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    {...register(`products.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    error={errors.products?.[index]?.quantity?.message}
                    required
                  />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Product Total: $
                    {((watchedProducts[index]?.unitPrice || 0) * (watchedProducts[index]?.quantity || 0)).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  name: '',
                  description: '',
                  unitPrice: 0,
                  quantity: 1,
                  total: 0,
                })
              }
            >
              Add Product
            </Button>
          </Card>

          {/* Pricing */}
          <Card title="Pricing & Terms" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                {...register('taxRate', { valueAsNumber: true })}
                error={errors.taxRate?.message}
              />
              <Input
                label="Validity (Days)"
                type="number"
                {...register('validityDays', { valueAsNumber: true })}
                error={errors.validityDays?.message}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  {...register('discountType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <Input
                label={`Discount ${discountType === 'percentage' ? '(%)' : '($)'}`}
                type="number"
                step="0.01"
                {...register('discount', { valueAsNumber: true })}
                error={errors.discount?.message}
              />
            </div>

            {/* Totals Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({taxRate}%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  {...register('terms')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { z } from 'zod';

// Client validation schema
export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(3, 'Zip code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  total: z.number().min(0, 'Total must be greater than or equal to 0'),
});

// Quotation form validation schema
export const quotationFormSchema = z.object({
  client: clientSchema,
  products: z
    .array(productSchema)
    .min(1, 'At least one product is required')
    .max(50, 'Maximum 50 products allowed'),
  taxRate: z.number().min(0, 'Tax rate must be 0 or greater').max(100, 'Tax rate cannot exceed 100%'),
  discount: z.number().min(0, 'Discount must be 0 or greater'),
  discountType: z.enum(['percentage', 'fixed']),
  notes: z.string().optional(),
  terms: z.string().optional(),
  validityDays: z.number().int().min(1, 'Validity must be at least 1 day').max(365, 'Validity cannot exceed 365 days'),
});

// API request validation
export const createQuotationSchema = quotationFormSchema;

export const updateQuotationSchema = quotationFormSchema.partial().extend({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
});

// Utility function to calculate quotation totals
export function calculateQuotationTotals(data: {
  products: { unitPrice: number; quantity: number }[];
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
}) {
  // Calculate subtotal
  const subtotal = data.products.reduce(
    (sum, product) => sum + product.unitPrice * product.quantity,
    0
  );

  // Calculate discount amount
  const discountAmount =
    data.discountType === 'percentage'
      ? (subtotal * data.discount) / 100
      : data.discount;

  // Calculate amount after discount
  const amountAfterDiscount = subtotal - discountAmount;

  // Calculate tax
  const tax = (amountAfterDiscount * data.taxRate) / 100;

  // Calculate total
  const total = amountAfterDiscount + tax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

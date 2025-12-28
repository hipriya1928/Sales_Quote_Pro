import mongoose, { Schema, Model, Document } from 'mongoose';
import { IQuotation, IClient, IProduct } from '@/types';

// Client Schema (embedded)
const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

// Product Schema (embedded)
const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
}, { _id: false });

// Quotation Schema
const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: {
      type: String,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    client: {
      type: ClientSchema,
      required: true,
    },
    products: {
      type: [ProductSchema],
      required: true,
      validate: {
        validator: (v: IProduct[]) => v.length > 0,
        message: 'At least one product is required',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    terms: {
      type: String,
      default: 'Payment due within 30 days',
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Generate quotation number before saving
QuotationSchema.pre('save', async function () {
  if (!this.quotationNumber) {
    const count = await (this.constructor as Model<IQuotation>).countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.quotationNumber = `QT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Create or reuse existing model
const Quotation: Model<IQuotation> =
  mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);

export default Quotation;

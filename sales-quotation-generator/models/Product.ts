import mongoose, { Schema, Model } from 'mongoose';

export interface IProductMaster {
  _id?: string;
  name: string;
  description: string;
  unitPrice: number;
  sku?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProductMaster>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    category: { type: String, default: 'General' },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProductMaster> =
  mongoose.models.Product || mongoose.model<IProductMaster>('Product', ProductSchema);

export default Product;

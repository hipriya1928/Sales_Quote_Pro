// Client Types
export interface IClient {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Product Types
export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

// Product Master Types
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

// Quotation Types
export interface IQuotation {
  _id?: string;
  quotationNumber: string;
  date: Date;
  validUntil: Date;
  client: IClient;
  products: IProduct[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

// Form Data Types (for react-hook-form)
export interface QuotationFormData {
  client: IClient;
  products: IProduct[];
  taxRate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  notes?: string;
  terms?: string;
  validityDays: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QuotationListResponse {
  quotations: IQuotation[];
  total: number;
  page: number;
  limit: number;
}

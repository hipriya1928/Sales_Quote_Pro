import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quotation from '@/models/Quotation';
import { createQuotationSchema, calculateQuotationTotals } from '@/lib/validations';
import { IQuotation } from '@/types';

// GET /api/quotations - Get all quotations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const quotations = await Quotation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Quotation.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        quotations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quotations',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/quotations - Create a new quotation
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate request body
    const validationResult = createQuotationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { client, products, taxRate, discount, discountType, notes, terms, validityDays } =
      validationResult.data;

    // Calculate product totals
    const productsWithTotals = products.map((product) => ({
      ...product,
      total: product.unitPrice * product.quantity,
    }));

    // Calculate quotation totals
    const totals = calculateQuotationTotals({
      products: productsWithTotals,
      taxRate,
      discount,
      discountType,
    });

    // Create quotation
    const quotation = new Quotation({
      date: new Date(),
      validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
      client,
      products: productsWithTotals,
      subtotal: totals.subtotal,
      tax: totals.tax,
      taxRate,
      discount: totals.discount,
      discountType,
      total: totals.total,
      notes: notes || '',
      terms: terms || 'Payment due within 30 days',
      status: 'draft',
    });

    await quotation.save();

    return NextResponse.json(
      {
        success: true,
        data: quotation,
        message: 'Quotation created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create quotation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

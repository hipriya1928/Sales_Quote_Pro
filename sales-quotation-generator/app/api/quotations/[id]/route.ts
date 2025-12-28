import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quotation from '@/models/Quotation';
import { updateQuotationSchema, calculateQuotationTotals } from '@/lib/validations';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/quotations/[id] - Get a single quotation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid quotation ID',
        },
        { status: 400 }
      );
    }

    const quotation = await Quotation.findById(id).lean();

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quotation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
    });
  } catch (error: any) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quotation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/quotations/[id] - Update a quotation
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid quotation ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateQuotationSchema.safeParse(body);

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

    const updateData: any = {};

    // If products, taxRate, discount, or discountType are being updated, recalculate totals
    if (
      validationResult.data.products ||
      validationResult.data.taxRate !== undefined ||
      validationResult.data.discount !== undefined ||
      validationResult.data.discountType
    ) {
      const existingQuotation = await Quotation.findById(id);

      if (!existingQuotation) {
        return NextResponse.json(
          {
            success: false,
            error: 'Quotation not found',
          },
          { status: 404 }
        );
      }

      const products = validationResult.data.products || existingQuotation.products;
      const taxRate = validationResult.data.taxRate ?? existingQuotation.taxRate;
      const discount = validationResult.data.discount ?? existingQuotation.discount;
      const discountType = validationResult.data.discountType || existingQuotation.discountType;

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

      updateData.products = productsWithTotals;
      updateData.taxRate = taxRate;
      updateData.discount = totals.discount;
      updateData.discountType = discountType;
      updateData.subtotal = totals.subtotal;
      updateData.tax = totals.tax;
      updateData.total = totals.total;
    }

    // Update other fields
    if (validationResult.data.client) updateData.client = validationResult.data.client;
    if (validationResult.data.notes !== undefined) updateData.notes = validationResult.data.notes;
    if (validationResult.data.terms !== undefined) updateData.terms = validationResult.data.terms;
    if (validationResult.data.status) updateData.status = validationResult.data.status;

    if (validationResult.data.validityDays) {
      updateData.validUntil = new Date(Date.now() + validationResult.data.validityDays * 24 * 60 * 60 * 1000);
    }

    const quotation = await Quotation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quotation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotation,
      message: 'Quotation updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update quotation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/quotations/[id] - Delete a quotation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid quotation ID',
        },
        { status: 400 }
      );
    }

    const quotation = await Quotation.findByIdAndDelete(id);

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quotation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete quotation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

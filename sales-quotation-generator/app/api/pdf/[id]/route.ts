import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quotation from '@/models/Quotation';
import { generateQuotationPDF } from '@/lib/pdf-generator';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/pdf/[id] - Generate PDF for a quotation
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

    // Generate PDF
    const pdf = generateQuotationPDF(quotation);
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate PDF',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

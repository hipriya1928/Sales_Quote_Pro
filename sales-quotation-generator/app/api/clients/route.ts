import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import { clientSchema } from '@/lib/validations';

// GET /api/clients - Get all clients
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch clients',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate request body
    const validationResult = clientSchema.safeParse(body);

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

    const client = new Client(validationResult.data);
    await client.save();

    return NextResponse.json(
      {
        success: true,
        data: client,
        message: 'Client created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating client:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create client',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

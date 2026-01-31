import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import { getUserFromRequest } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const customers = await Customer.find({ user: user._id }).sort({ createdAt: -1 })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerName, businessName, address, gstin, phone, email } = await request.json()

    if (!customerName || !address) {
      return NextResponse.json(
        { error: 'Customer name and address are required' },
        { status: 400 }
      )
    }

    await connectDB()
    const customer = new Customer({
      user: user._id,
      customerName,
      businessName,
      address,
      gstin,
      phone,
      email
    })

    await customer.save()
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

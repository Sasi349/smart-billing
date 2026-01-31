import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Supplier from '@/models/Supplier'
import { getUserFromRequest } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const suppliers = await Supplier.find({ user: user._id }).sort({ createdAt: -1 })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Get suppliers error:', error)
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

    const { 
      supplierName, 
      businessName, 
      address, 
      gstin, 
      pan, 
      accountNumber, 
      ifscCode, 
      accountName, 
      phone, 
      email 
    } = await request.json()

    if (!supplierName || !businessName || !address || !gstin || !pan || !accountNumber || !ifscCode) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    await connectDB()
    const supplier = new Supplier({
      user: user._id,
      supplierName,
      businessName,
      address,
      gstin,
      pan,
      accountNumber,
      ifscCode,
      accountName,
      phone,
      email
    })

    await supplier.save()
    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

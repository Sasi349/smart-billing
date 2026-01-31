import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Supplier from '@/models/Supplier'
import { getUserFromRequest } from '@/lib/middleware'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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

    await connectDB()
    
    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, user: user._id },
      { 
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
      },
      { new: true }
    )

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Update supplier error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const supplier = await Supplier.findOneAndDelete({
      _id: id,
      user: user._id
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    console.error('Delete supplier error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

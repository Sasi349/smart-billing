import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword, generateToken } from '@/lib/auth'
import { validatePassword } from '@/lib/password-validation'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      const errors = []
      if (!passwordValidation.minLength) errors.push('at least 8 characters')
      if (!passwordValidation.hasUppercase) errors.push('uppercase letter')
      if (!passwordValidation.hasLowercase) errors.push('lowercase letter')
      if (!passwordValidation.hasNumber) errors.push('number')
      if (!passwordValidation.hasSpecialChar) errors.push('special character')

      return NextResponse.json(
        { 
          error: `Password must contain ${errors.join(', ')}`,
          passwordValidation 
        },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = new User({
      email,
      password: hashedPassword
    })
    await user.save()

    const token = generateToken(user._id.toString())

    const response = NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

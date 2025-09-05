import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let user;
    if (session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user && session.user.id) {
      user = await User.findById(session.user.id);
    }
    
    if (!user) {
      return NextResponse.json({
        id: session.user.id || 'temp-id',
        name: session.user.name || 'User',
        email: session.user.email || '',
        image: session.user.image || null,
        authenticated: true
      });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image || session.user.image,
      createdAt: user.createdAt,
      authenticated: true
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
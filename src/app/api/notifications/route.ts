import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id') || user?.id;

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.appNotification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const { id, markAll, userId } = body;

    const targetUserId = userId || user?.id;

    if (markAll && targetUserId) {
      await prisma.appNotification.updateMany({
        where: { user_id: targetUserId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (id) {
      const updated = await prisma.appNotification.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json({ notification: updated });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

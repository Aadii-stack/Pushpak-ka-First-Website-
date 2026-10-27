import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transportId = searchParams.get('transport_id');
    const status = searchParams.get('status');

    const where: any = {};
    if (transportId) where.transport_id = transportId;
    if (status) where.status = status;

    const issues = await prisma.issueFlag.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { transport: true },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { transport_id, issue_type, description, severity } = body;

    const transport = await prisma.transportRecord.findUnique({
      where: { id: transport_id },
      include: {
        tie_up: {
          include: {
            restaurant: true,
            ngo: true,
          },
        },
      },
    });

    if (!transport) {
      return NextResponse.json({ error: 'Transport record not found' }, { status: 404 });
    }

    const issue = await prisma.$transaction(async (tx) => {
      const createdIssue = await tx.issueFlag.create({
        data: {
          transport_id: transport.id,
          listing_title: transport.listing_title,
          restaurant_name: transport.restaurant_name,
          ngo_name: transport.ngo_name,
          raised_by: user.role,
          raised_by_name: user.name,
          issue_type: issue_type || 'other',
          description,
          severity: severity || 'medium',
          status: 'open',
        },
      });

      // Update transport status to 'issue'
      await tx.transportRecord.update({
        where: { id: transport.id },
        data: {
          status: 'issue',
          issue_notes: description,
        },
      });

      // Notify counterparty
      const recipientUserId =
        user.role === 'restaurant'
          ? transport.tie_up?.ngo?.user_id
          : transport.tie_up?.restaurant?.user_id;

      if (recipientUserId) {
        await tx.appNotification.create({
          data: {
            user_id: recipientUserId,
            role: user.role === 'restaurant' ? 'ngo' : 'restaurant',
            type: 'issue_flagged',
            title: `🚨 Issue Flagged on #${transport.id}`,
            message: `${user.name} reported "${issue_type.replace('_', ' ')}": ${description}`,
            link: user.role === 'restaurant' ? `/ngo/transport/${transport.id}` : `/restaurant/transports/${transport.id}`,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          entity_type: 'issue',
          entity_id: createdIssue.id,
          actor_id: user.id,
          actor_name: user.name,
          actor_role: user.role,
          action: 'ISSUE_FLAGGED',
          details: `[${(severity || 'MEDIUM').toUpperCase()}] ${issue_type}: ${description}`,
        },
      });

      return createdIssue;
    });

    return NextResponse.json({ message: 'Issue flagged successfully', issue }, { status: 201 });
  } catch (error) {
    console.error('Error flagging issue:', error);
    return NextResponse.json({ error: 'Failed to flag issue' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, admin_notes, action_taken } = body;

    const user = await getAuthenticatedUser();
    const resolverName = user?.name || 'Platform Administrator';

    const issue = await prisma.issueFlag.findUnique({
      where: { id },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const updatedIssue = await prisma.$transaction(async (tx) => {
      const resolved = await tx.issueFlag.update({
        where: { id },
        data: {
          status: status || 'resolved',
          admin_notes,
          action_taken,
          resolved_at: new Date(),
          resolved_by: resolverName,
        },
      });

      // Update transport status back to in_transit if it was in 'issue' state
      const transport = await tx.transportRecord.findUnique({
        where: { id: issue.transport_id },
      });

      if (transport && transport.status === 'issue') {
        const resumeStatus = transport.pickup_otp_verified ? 'in_transit' : 'en_route';
        await tx.transportRecord.update({
          where: { id: transport.id },
          data: { status: resumeStatus },
        });
      }

      await tx.platformAnalytics.updateMany({
        data: { resolved_disputes: { increment: 1 } },
      });

      await tx.auditLog.create({
        data: {
          entity_type: 'issue',
          entity_id: id,
          actor_id: user?.id || 'admin',
          actor_name: resolverName,
          actor_role: user?.role || 'restaurant',
          action: `ISSUE_${(status || 'RESOLVED').toUpperCase()}`,
          details: `Resolution: ${admin_notes || action_taken || 'Marked resolved'}`,
        },
      });

      return resolved;
    });

    return NextResponse.json({ message: 'Issue resolved', issue: updatedIssue });
  } catch (error) {
    console.error('Error resolving issue:', error);
    return NextResponse.json({ error: 'Failed to resolve issue' }, { status: 500 });
  }
}

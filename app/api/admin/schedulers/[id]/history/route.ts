/**
 * API Route to Get Scheduler Execution History
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSchedulerExecutionHistory } from '@/lib/actions/scheduler.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }
    
    const history = await getSchedulerExecutionHistory(id, limit);
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching scheduler history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduler history' },
      { status: 500 }
    );
  }
}
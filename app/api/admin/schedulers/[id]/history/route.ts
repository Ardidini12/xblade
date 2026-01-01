/**
 * API Route to Get Scheduler Execution History
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSchedulerExecutionHistory } from '@/lib/actions/scheduler.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const history = await getSchedulerExecutionHistory(params.id, limit);
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching scheduler history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduler history' },
      { status: 500 }
    );
  }
}
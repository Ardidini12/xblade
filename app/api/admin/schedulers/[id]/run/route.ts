/**
 * API Route to Run a Scheduler Manually
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSchedulerManually } from '@/lib/actions/scheduler.actions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await runSchedulerManually(params.id);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to run scheduler' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduler' },
      { status: 500 }
    );
  }
}
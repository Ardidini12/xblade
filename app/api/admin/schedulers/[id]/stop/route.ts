/**
 * API Route to Stop a Scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { stopScheduler } from '@/lib/actions/scheduler.actions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduler = await stopScheduler(params.id);
    
    if (!scheduler) {
      return NextResponse.json(
        { error: 'Failed to stop scheduler' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(scheduler);
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to stop scheduler' },
      { status: 500 }
    );
  }
}
/**
 * API Route to Stop a Scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { stopScheduler } from '@/lib/actions/scheduler.actions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scheduler = await stopScheduler(id);
    
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
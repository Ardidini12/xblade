/**
 * API Route to Start a Scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { startScheduler } from '@/lib/actions/scheduler.actions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduler = await startScheduler(params.id);
    
    if (!scheduler) {
      return NextResponse.json(
        { error: 'Failed to start scheduler' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(scheduler);
  } catch (error) {
    console.error('Error starting scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to start scheduler' },
      { status: 500 }
    );
  }
}
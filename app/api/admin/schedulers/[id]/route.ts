/**
 * API Route for Individual Scheduler Operations
 * 
 * This route handles HTTP requests for individual scheduler operations
 * including updating, deleting, starting, stopping, and running schedulers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSchedulerById, updateScheduler, deleteScheduler } from '@/lib/actions/scheduler.actions';
import { startScheduler, stopScheduler, runSchedulerManually } from '@/lib/actions/scheduler.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduler = await getSchedulerById(params.id);
    
    if (!scheduler) {
      return NextResponse.json(
        { error: 'Scheduler not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(scheduler);
  } catch (error) {
    console.error('Error fetching scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const scheduler = await updateScheduler(params.id, body);
    
    if (!scheduler) {
      return NextResponse.json(
        { error: 'Failed to update scheduler' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(scheduler);
  } catch (error) {
    console.error('Error updating scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteScheduler(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete scheduler' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduler' },
      { status: 500 }
    );
  }
}
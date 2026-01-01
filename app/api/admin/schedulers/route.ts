/**
 * API Route for Scheduler Management
 * 
 * This route handles HTTP requests for scheduler CRUD operations.
 * It provides endpoints for creating, reading, updating, and deleting schedulers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSchedulers, createScheduler } from '@/lib/actions/scheduler.actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const createdBy = searchParams.get('createdBy') || '';
    const isActive = searchParams.get('isActive') === 'true' ? true : 
                     searchParams.get('isActive') === 'false' ? false : undefined;

    const result = await getSchedulers(page, limit, search, createdBy, isActive);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching schedulers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedulers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const scheduler = await createScheduler(body);
    
    if (!scheduler) {
      return NextResponse.json(
        { error: 'Failed to create scheduler' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(scheduler, { status: 201 });
  } catch (error) {
    console.error('Error creating scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduler' },
      { status: 500 }
    );
  }
}
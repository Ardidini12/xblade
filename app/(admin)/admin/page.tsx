/**
 * Admin Dashboard Page
 * 
 * This page provides the main admin dashboard with system status,
 * statistics, and navigation to different management sections.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Activity, 
  Settings,
  ArrowRight,
  Shield
} from 'lucide-react';
import { getSchedulers } from '@/lib/actions/scheduler.actions';
import { getLeagues } from '@/lib/actions/league.actions';
import { getServicesHealth } from '@/lib/services/initializeServices';

export const metadata: Metadata = {
  title: 'Admin Dashboard | XBlade',
  description: 'XBlade Admin Dashboard - Manage your platform',
};

async function getDashboardData() {
  try {
    const [schedulersResult, leaguesResult, healthStatus] = await Promise.all([
      getSchedulers(1, 10, undefined),
      getLeagues(1, 10, undefined),
      getServicesHealth().catch(() => ({ redis: false, scheduler: false, cron: false, overall: false }))
    ]);

    return {
      schedulers: schedulersResult.schedulers || [],
      leagues: leaguesResult.leagues || [],
      health: healthStatus
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return {
      schedulers: [],
      leagues: [],
      health: { redis: false, scheduler: false, cron: false, overall: false }
    };
  }
}

export default async function AdminDashboardPage() {
  const { schedulers, leagues, health } = await getDashboardData();

  const activeSchedulers = schedulers.filter((s: { isActive: boolean }) => s.isActive).length;
  const activeLeagues = leagues.filter((l: { isActive: boolean }) => l.isActive).length;
  const totalSeasons = leagues.reduce((sum: number, league: { seasons?: { length: number }[] }) => sum + (league.seasons?.length || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the XBlade Admin Panel
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current status of system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Redis</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                health.redis ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {health.redis ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Scheduler Service</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                health.scheduler ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {health.scheduler ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Cron Service</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                health.cron ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {health.cron ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedulers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulers.length}</div>
            <p className="text-xs text-muted-foreground">{activeSchedulers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leagues.length}</div>
            <p className="text-xs text-muted-foreground">{activeLeagues} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeasons}</div>
            <p className="text-xs text-muted-foreground">
              Across all leagues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              health.overall ? 'text-green-600' : 'text-red-600'
            }`}>
              {health.overall ? 'Healthy' : 'Degraded'}
            </div>
            <p className="text-xs text-muted-foreground">
              All services {health.overall ? 'operational' : 'issues detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduler Management
            </CardTitle>
            <CardDescription>
              Manage data collection schedulers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/schedulers">
              <Button className="w-full" variant="outline">
                Go to Schedulers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              League Management
            </CardTitle>
            <CardDescription>
              Manage leagues, seasons, and clubs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/leagues">
              <Button className="w-full" variant="outline">
                Go to Leagues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage platform users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full" variant="outline">
                Go to Users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

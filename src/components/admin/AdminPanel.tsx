import React, { useState, useEffect } from 'react';
import { Users, BarChart3, RefreshCw, Shield, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { blink } from '../../blink/client';

interface User {
  id: string;
  userId: string;
  email: string;
  plan: string;
  analysesUsedToday: number;
  dailyLimit: number;
  totalAnalyses: number;
  isAdmin: boolean;
  createdAt: string;
  lastAnalysisAt: string;
}

interface Analysis {
  id: string;
  userId: string;
  symbol: string;
  analysisType: string;
  confidence: string;
  trend: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnalyses: 0,
    activeToday: 0,
    proUsers: 0
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const usersData = await blink.db.users.list({
        orderBy: { createdAt: 'desc' },
        limit: 100
      });

      // Load recent analyses
      const analysesData = await blink.db.analyses.list({
        orderBy: { createdAt: 'desc' },
        limit: 50
      });

      setUsers(usersData);
      setAnalyses(analysesData);

      // Calculate stats
      const totalUsers = usersData.length;
      const totalAnalyses = analysesData.length;
      const today = new Date().toISOString().split('T')[0];
      const activeToday = usersData.filter(user => 
        user.lastAnalysisAt && user.lastAnalysisAt.startsWith(today)
      ).length;
      const proUsers = usersData.filter(user => user.plan === 'pro').length;

      setStats({
        totalUsers,
        totalAnalyses,
        activeToday,
        proUsers
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const resetUserQuota = async (userId: string) => {
    try {
      await blink.db.users.update(userId, {
        analysesUsedToday: 0,
        lastQuotaReset: new Date().toISOString()
      });
      
      // Refresh data
      loadAdminData();
    } catch (error) {
      console.error('Error resetting user quota:', error);
    }
  };

  const toggleUserPlan = async (userId: string, currentPlan: string) => {
    try {
      const newPlan = currentPlan === 'free' ? 'pro' : 'free';
      const newLimit = newPlan === 'pro' ? 999 : 3;
      
      await blink.db.users.update(userId, {
        plan: newPlan,
        dailyLimit: newLimit
      });
      
      // Refresh data
      loadAdminData();
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnalyses}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeToday}</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pro Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.proUsers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <Button onClick={loadAdminData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Usage Today</TableHead>
                  <TableHead>Total Analyses</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {user.isAdmin && (
                        <Badge variant="secondary" className="ml-2">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.plan === 'pro' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={user.analysesUsedToday >= user.dailyLimit ? 'text-red-600' : 'text-gray-900'}>
                        {user.analysesUsedToday} / {user.dailyLimit}
                      </span>
                    </TableCell>
                    <TableCell>{user.totalAnalyses}</TableCell>
                    <TableCell>
                      {user.lastAnalysisAt ? 
                        new Date(user.lastAnalysisAt).toLocaleDateString() : 
                        'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => resetUserQuota(user.id)}
                          variant="outline"
                          size="sm"
                          disabled={user.analysesUsedToday === 0}
                        >
                          Reset Quota
                        </Button>
                        <Button
                          onClick={() => toggleUserPlan(user.id, user.plan)}
                          variant="outline"
                          size="sm"
                        >
                          {user.plan === 'free' ? 'Upgrade' : 'Downgrade'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis) => {
                  const user = users.find(u => u.userId === analysis.userId);
                  return (
                    <TableRow key={analysis.id}>
                      <TableCell>{user?.email || 'Unknown'}</TableCell>
                      <TableCell className="font-medium">{analysis.symbol}</TableCell>
                      <TableCell className="capitalize">{analysis.analysisType}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            analysis.trend === 'bullish' ? 'default' : 
                            analysis.trend === 'bearish' ? 'destructive' : 
                            'secondary'
                          }
                          className="capitalize"
                        >
                          {analysis.trend}
                        </Badge>
                      </TableCell>
                      <TableCell>{analysis.confidence}%</TableCell>
                      <TableCell>
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Upload, TrendingUp, Users, Clock, Target, History, Shield, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ChartAnalysis from '../features/ChartAnalysis';
import AdminPanel from '../admin/AdminPanel';
import { UserService } from '../../services/userService';
import { advancedAnalysisService, TradeSetup } from '../../services/advancedAnalysisService';

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const [userStats, setUserStats] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<TradeSetup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [stats, analyses] = await Promise.all([
        UserService.getUserStats(user.id),
        advancedAnalysisService.getUserAnalyses(user.id, 5)
      ]);
      setUserStats(stats);
      setRecentAnalyses(analyses);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const handleAnalysisComplete = () => {
    // Refresh user data after analysis
    loadUserData();
  };

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Target className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'bg-green-100 text-green-800';
      case 'bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Trader'}!
          </h1>
          <p className="text-gray-600">
            Analyze crypto charts and generate professional trade setups
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Analyses Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.analysesUsedToday || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(userStats?.dailyLimit || 0) - (userStats?.analysesUsedToday || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {userStats?.plan || 'Free'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.totalAnalyses || 0}
                  </p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <History className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        {userStats && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Daily Usage</h3>
                <span className="text-sm text-gray-600">
                  {userStats.analysesUsedToday} / {userStats.dailyLimit} analyses used
                </span>
              </div>
              <Progress 
                value={(userStats.analysesUsedToday / userStats.dailyLimit) * 100} 
                className="h-3"
              />
              {userStats.analysesUsedToday >= userStats.dailyLimit && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    You've reached your daily limit. 
                    {userStats.plan === 'free' && (
                      <span className="ml-1">
                        <Button variant="link" className="p-0 h-auto text-yellow-800 underline">
                          Upgrade to Pro
                        </Button> for unlimited analyses.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">New Analysis</TabsTrigger>
            <TabsTrigger value="history">Analysis History</TabsTrigger>
            {userStats?.isAdmin && (
              <TabsTrigger value="admin">Admin Panel</TabsTrigger>
            )}
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analyze">
            <ChartAnalysis user={user} onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAnalyses.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start by analyzing your first chart or selecting a trading pair
                    </p>
                    <Button onClick={() => document.querySelector('[value="analyze"]')?.click()}>
                      Start Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAnalyses.map((analysis) => (
                      <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{analysis.symbol}</h4>
                            <Badge className={getTrendColor(analysis.trend)}>
                              {getTrendIcon(analysis.trend)}
                              <span className="ml-1 capitalize">{analysis.trend}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {analysis.confidence}% confidence
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Entry</p>
                            <p className="font-bold text-blue-600">
                              ${analysis.entry.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Stop Loss</p>
                            <p className="font-bold text-red-600">
                              ${analysis.stopLoss.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">TP1</p>
                            <p className="font-bold text-green-600">
                              ${analysis.takeProfit1.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">TP2</p>
                            <p className="font-bold text-green-600">
                              ${analysis.takeProfit2.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
                          <span>R/R: 1:{analysis.riskReward.toFixed(2)}</span>
                          <span className="capitalize">{analysis.analysisType} Analysis</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {userStats?.isAdmin && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
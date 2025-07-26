import React, { useState, useEffect } from 'react';
import { Upload, TrendingUp, TrendingDown, Minus, BarChart3, Target, Shield, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { advancedAnalysisService, TradeSetup } from '../../services/advancedAnalysisService';
import { marketDataService } from '../../services/marketDataService';

interface ChartAnalysisProps {
  user: any;
  onAnalysisComplete?: (analysis: TradeSetup) => void;
}

export default function ChartAnalysis({ user, onAnalysisComplete }: ChartAnalysisProps) {
  const [analysisMode, setAnalysisMode] = useState<'upload' | 'live'>('live');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TradeSetup | null>(null);
  const [supportedPairs, setSupportedPairs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadSupportedPairs = async () => {
    try {
      const pairs = await marketDataService.getSupportedPairs();
      setSupportedPairs(pairs);
    } catch (error) {
      console.error('Error loading supported pairs:', error);
    }
  };

  useEffect(() => {
    loadSupportedPairs();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!user?.id) {
      setError('Please log in to perform analysis');
      return;
    }

    if (analysisMode === 'upload' && !uploadedFile) {
      setError('Please upload a chart image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await advancedAnalysisService.analyzeChart(
        user.id,
        analysisMode,
        selectedPair,
        uploadedFile || undefined
      );

      if (result.success && result.tradeSetup) {
        setCurrentAnalysis(result.tradeSetup);
        onAnalysisComplete?.(result.tradeSetup);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'bg-green-100 text-green-800';
      case 'bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Chart Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-4">
            <Button
              variant={analysisMode === 'live' ? 'default' : 'outline'}
              onClick={() => setAnalysisMode('live')}
              className="flex-1"
            >
              Live Market Data
            </Button>
            <Button
              variant={analysisMode === 'upload' ? 'default' : 'outline'}
              onClick={() => setAnalysisMode('upload')}
              className="flex-1"
            >
              Upload Chart
            </Button>
          </div>

          {/* Live Data Mode */}
          {analysisMode === 'live' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Trading Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedPairs.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Upload Mode */}
          {analysisMode === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Trading Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedPairs.map(pair => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Chart Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="chart-upload"
                  />
                  <label htmlFor="chart-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {uploadedFile ? uploadedFile.name : 'Click to upload chart image'}
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (analysisMode === 'upload' && !uploadedFile)}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Chart...
              </>
            ) : (
              'Analyze Chart'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="space-y-6">
          {/* Trade Setup Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trade Setup - {currentAnalysis.symbol}
                </span>
                <Badge className={getTrendColor(currentAnalysis.trend)}>
                  {getTrendIcon(currentAnalysis.trend)}
                  <span className="ml-1 capitalize">{currentAnalysis.trend}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confidence Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className={`text-lg font-bold ${getConfidenceColor(currentAnalysis.confidence)}`}>
                    {currentAnalysis.confidence}%
                  </span>
                </div>
                <Progress value={currentAnalysis.confidence} className="h-2" />
              </div>

              {/* Trade Levels */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Entry</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${currentAnalysis.entry.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Stop Loss</p>
                  <p className="text-lg font-bold text-red-600">
                    ${currentAnalysis.stopLoss.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">TP1</p>
                  <p className="text-lg font-bold text-green-600">
                    ${currentAnalysis.takeProfit1.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">TP2</p>
                  <p className="text-lg font-bold text-green-600">
                    ${currentAnalysis.takeProfit2.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Risk/Reward Ratio */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Risk/Reward Ratio</span>
                <span className="text-lg font-bold text-blue-600">
                  1:{currentAnalysis.riskReward.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Chart Visualization */}
          {currentAnalysis.chartImageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Chart Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-hidden rounded-lg border">
                  <img
                    src={currentAnalysis.chartImageUrl}
                    alt="Chart Analysis"
                    className="w-full h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Technical Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">RSI</p>
                  <p className="text-lg font-bold">
                    {currentAnalysis.technicalIndicators.rsi.toFixed(1)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">SMA 20</p>
                  <p className="text-lg font-bold">
                    ${currentAnalysis.technicalIndicators.sma20.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">SMA 50</p>
                  <p className="text-lg font-bold">
                    ${currentAnalysis.technicalIndicators.sma50.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Support</p>
                  <p className="text-lg font-bold text-green-600">
                    ${currentAnalysis.technicalIndicators.support.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Resistance</p>
                  <p className="text-lg font-bold text-red-600">
                    ${currentAnalysis.technicalIndicators.resistance.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">MACD</p>
                  <p className="text-lg font-bold">
                    {currentAnalysis.technicalIndicators.macd.macd.toFixed(3)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Analysis Reasoning */}
              <div>
                <h4 className="font-semibold mb-3">Analysis Reasoning</h4>
                <ul className="space-y-2">
                  {currentAnalysis.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
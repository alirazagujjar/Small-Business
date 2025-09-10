import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { SubscriptionGuard } from "@/components/subscription/subscription-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import type { AiInsight } from "@/types/business";

export default function AIInsights() {
  return (
    <SubscriptionGuard feature="ai_insights">
      <AIInsightsContent />
    </SubscriptionGuard>
  );
}

function AIInsightsContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: insights = [], isLoading } = useQuery<AiInsight[]>({
    queryKey: ['/api/ai/insights'],
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest("POST", "/api/ai/generate-insights");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/insights'] });
      toast({ 
        title: "AI Insights Generated", 
        description: `Generated ${data.length} new insights` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error generating insights", 
        description: error.message,
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/ai/insights/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/insights'] });
    },
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'forecast':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-200 bg-red-50 dark:bg-red-950/20';
    if (type === 'alert') return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20';
    if (type === 'recommendation') return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
    return 'border-green-200 bg-green-50 dark:bg-green-950/20';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  const unreadInsights = insights.filter(insight => !insight.isRead);
  const recommendations = insights.filter(insight => insight.type === 'recommendation');
  const alerts = insights.filter(insight => insight.type === 'alert');
  const forecasts = insights.filter(insight => insight.type === 'forecast');

  return (
    <MainLayout title="AI Insights" subtitle="Intelligent business recommendations">
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Insights</p>
                  <p className="text-2xl font-bold text-foreground">{insights.length}</p>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-foreground">{unreadInsights.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                  <p className="text-2xl font-bold text-foreground">{recommendations.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Forecasts</p>
                  <p className="text-2xl font-bold text-foreground">{forecasts.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Business Intelligence</span>
              </CardTitle>
              <Button 
                onClick={() => generateInsightsMutation.mutate()}
                disabled={isGenerating}
                data-testid="button-generate-insights"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate New Insights
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our AI analyzes your business data to provide actionable insights, recommendations, 
              and forecasts to help you make better decisions and optimize performance.
            </p>
          </CardContent>
        </Card>

        {/* Insights List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No insights yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first AI insights to get personalized business recommendations.
                </p>
                <Button 
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={isGenerating}
                  data-testid="button-generate-first-insights"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Alert 
                    key={insight.id} 
                    className={`${getInsightColor(insight.type, insight.priority)} ${!insight.isRead ? 'ring-2 ring-primary/20' : ''}`}
                    data-testid={`insight-${insight.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={getPriorityColor(insight.priority)}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-foreground">{insight.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`capitalize ${getPriorityColor(insight.priority)}`}
                            >
                              {insight.priority}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {insight.type}
                            </Badge>
                            {!insight.isRead && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </div>
                          <AlertDescription className="text-sm">
                            {insight.description}
                          </AlertDescription>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(insight.createdAt).toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-2">
                              {insight.type === 'recommendation' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  data-testid={`button-action-${insight.id}`}
                                >
                                  Take Action
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                              {!insight.isRead && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => markAsReadMutation.mutate(insight.id)}
                                  data-testid={`button-mark-read-${insight.id}`}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insight Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recommendations available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No alerts at this time</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Forecasts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forecasts.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                ))}
                {forecasts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No forecasts available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Crown, 
  Check, 
  ArrowLeft,
  Brain,
  TrendingUp,
  Building2,
  CreditCard,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";

const SubscribeForm = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/upgrade-subscription");
      const data = await response.json();
      
      toast({
        title: "Welcome to Premium!",
        description: "Your subscription has been upgraded to premium.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Cash Payment Required</h3>
        <p className="text-sm text-muted-foreground">
          Please contact your administrator to process the cash payment of $29/month
          for Premium features. Click the button below to activate your Premium subscription.
        </p>
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
        data-testid="button-subscribe"
      >
        {isLoading ? 'Activating...' : 'Activate Premium Subscription'}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useAuth();

  const premiumFeatures = [
    { icon: Brain, title: "AI Business Insights", description: "Get intelligent recommendations and forecasts" },
    { icon: TrendingUp, title: "Advanced Analytics", description: "Deep dive into your business performance" },
    { icon: Building2, title: "Vendor Management", description: "Complete supplier relationship management" },
    { icon: CreditCard, title: "Purchase Orders", description: "Streamlined procurement workflow" },
    { icon: Shield, title: "Priority Support", description: "Get help when you need it most" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Plan Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="text-center">
                  <Crown className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Unlock the full potential of your business with advanced features
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$29</div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Premium Features</h3>
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <feature.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{feature.title}</div>
                        <div className="text-sm text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold">Everything in Standard, plus:</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "AI-powered business insights",
                      "Advanced reporting and analytics",
                      "Vendor and supplier management",
                      "Purchase order automation",
                      "Multi-currency support",
                      "Priority customer support",
                      "Advanced integrations",
                      "Custom workflows"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Subscribing as: <strong>{user?.username}</strong> ({user?.email})
                </p>
              </CardHeader>
              <CardContent>
                <SubscribeForm />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Cash payments processed by administrator. Cancel anytime.</span>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>• Monthly cash payment of $29 required for Premium features</p>
                  <p>• Contact administrator to cancel or modify subscription</p>
                  <p>• All data remains accessible during your subscription</p>
                  <p>• Speak with administrator about refund policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

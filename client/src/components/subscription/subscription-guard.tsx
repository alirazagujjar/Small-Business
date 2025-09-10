import { useSubscription } from "@/hooks/use-subscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionGuardProps {
  feature: string;
  children: React.ReactNode;
}

export function SubscriptionGuard({ feature, children }: SubscriptionGuardProps) {
  const { hasFeature, requiresUpgrade } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (requiresUpgrade(feature)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Premium Feature</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This feature requires a Premium subscription to access advanced business management capabilities.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full" data-testid="button-upgrade">
                <Link href="/subscribe">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full" data-testid="button-back">
                <Link href="/dashboard">
                  Go Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this feature.
          </p>
          <Button variant="outline" asChild className="w-full" data-testid="button-back">
            <Link href="/dashboard">
              Go Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

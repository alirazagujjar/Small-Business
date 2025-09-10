import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();

  // Handle real-time notifications
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'notification':
          toast({
            title: lastMessage.data.title,
            description: lastMessage.data.message,
            variant: lastMessage.data.type === 'error' ? 'destructive' : 'default',
          });
          break;
        case 'low_stock_alert':
          toast({
            title: "Low Stock Alert",
            description: `${lastMessage.data.productName} is running low (${lastMessage.data.quantity} remaining)`,
            variant: "destructive",
          });
          break;
        case 'order_update':
          toast({
            title: "Order Update",
            description: lastMessage.data.message,
          });
          break;
      }
    }
  }, [lastMessage, toast]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

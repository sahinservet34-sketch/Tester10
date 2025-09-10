import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/login", "POST", {
        username,
        password,
      });
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome to admin panel",
      });
      // Invalidate auth queries to refresh user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      // Use window.location to force page refresh and update auth state
      window.location.href = "/admin/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md card-shadow">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground uppercase mb-2">Supano's</h1>
            <h2 className="text-xl font-semibold text-muted-foreground">Admin Login</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                data-testid="input-username"
                disabled={loginMutation.isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                data-testid="input-password"
                disabled={loginMutation.isPending}
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-gold-600 py-3"
              data-testid="button-login"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Admin access only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

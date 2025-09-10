import { type User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Admin authentication check using session endpoint
interface AuthResponse {
  userId: string;
  userRole: string;
}

export function useAuth() {
  const { data: authData, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: null as User | null,
    isLoading,
    isAuthenticated: !!authData?.userId,
    isAdmin: authData?.userRole === 'admin',
  };
}

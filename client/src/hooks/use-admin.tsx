import { useQuery } from "@tanstack/react-query";

interface AdminResponse {
  isAdmin: boolean;
}

export function useAdmin() {
  const isAdminQuery = useQuery<AdminResponse>({
    queryKey: ['/api/user/is-admin'],
  });

  return {
    isAdmin: isAdminQuery.data?.isAdmin || false,
    isLoading: isAdminQuery.isLoading,
    error: isAdminQuery.error,
  };
}
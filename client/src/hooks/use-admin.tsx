import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const isAdminQuery = useQuery({
    queryKey: ['/api/user/is-admin'],
  });

  return {
    isAdmin: isAdminQuery.data?.isAdmin || false,
    isLoading: isAdminQuery.isLoading,
    error: isAdminQuery.error,
  };
}
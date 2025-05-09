import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useBalanceRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all balance requests (admin only)
  const allBalanceRequestsQuery = useQuery({
    queryKey: ['/api/admin/balance-requests'],
    enabled: false, // Only enabled when needed
  });

  // Fetch pending balance requests (admin only)
  const pendingBalanceRequestsQuery = useQuery({
    queryKey: ['/api/admin/balance-requests/pending'],
    enabled: false, // Only enabled when needed
  });

  // Fetch user balance requests
  const userBalanceRequestsQuery = useQuery({
    queryKey: ['/api/balance-requests'],
  });

  // Approve a balance request (admin only)
  const approveBalanceRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest<{ success: boolean }>(
        `/api/admin/balance-requests/${requestId}/approve`,
        {
          method: 'POST',
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance request approved successfully",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/balance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/balance-requests/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-balance'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to approve balance request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reject a balance request (admin only)
  const rejectBalanceRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number, reason: string }) => {
      return await apiRequest<{ success: boolean }>(
        `/api/admin/balance-requests/${requestId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance request rejected successfully",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/balance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/balance-requests/pending'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to reject balance request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create a new balance request
  const createBalanceRequestMutation = useMutation({
    mutationFn: async (data: { amount: number, utrNumber: string }) => {
      return await apiRequest<{ success: boolean }>(
        '/api/add-balance',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Balance request submitted successfully. It will be reviewed by an administrator.",
      });
      // Invalidate user balance requests query
      queryClient.invalidateQueries({ queryKey: ['/api/balance-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit balance request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    allBalanceRequestsQuery,
    pendingBalanceRequestsQuery,
    userBalanceRequestsQuery,
    approveBalanceRequestMutation,
    rejectBalanceRequestMutation,
    createBalanceRequestMutation,
  };
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useSupportTickets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const allSupportTicketsQuery = useQuery({
    queryKey: ["/api/support-tickets"],
    enabled: false, // We'll fetch this manually when needed
  });

  const openSupportTicketsQuery = useQuery({
    queryKey: ["/api/support-tickets/open"],
    enabled: false, // We'll fetch this manually when needed
  });

  const userSupportTicketsQuery = useQuery({
    queryKey: ["/api/user/support-tickets"],
    enabled: false, // We'll fetch this manually when needed
  });

  const respondToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, response }: { ticketId: number; response: string }) => {
      await apiRequest("POST", `/api/support-tickets/${ticketId}/respond`, { response });
    },
    onSuccess: () => {
      toast({
        title: "Response sent",
        description: "Your response has been sent successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets/open"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    allSupportTicketsQuery,
    openSupportTicketsQuery,
    userSupportTicketsQuery,
    respondToTicketMutation,
  };
}
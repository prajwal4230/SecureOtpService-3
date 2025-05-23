import React, { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useBalanceRequests } from "@/hooks/use-balance-requests";
import { useSupportTickets } from "@/hooks/use-support-tickets";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Check, Clock, MessageSquare, X, Search, Mail, FileText } from "lucide-react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function AdminPageContent() {
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { 
    allBalanceRequestsQuery, 
    pendingBalanceRequestsQuery,
    approveBalanceRequestMutation,
    rejectBalanceRequestMutation
  } = useBalanceRequests();
  
  const {
    allSupportTicketsQuery,
    openSupportTicketsQuery,
    respondToTicketMutation
  } = useSupportTickets();
  
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketResponse, setTicketResponse] = useState("");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);

  React.useEffect(() => {
    if (isAdmin) {
      // If user is admin, fetch all data needed for admin panel
      allBalanceRequestsQuery.refetch();
      pendingBalanceRequestsQuery.refetch();
      allSupportTicketsQuery.refetch();
      openSupportTicketsQuery.refetch();
    }
  }, [
    isAdmin, 
    allBalanceRequestsQuery, 
    pendingBalanceRequestsQuery,
    allSupportTicketsQuery,
    openSupportTicketsQuery
  ]);

  if (isAdminLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>You do not have admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = (requestId: number) => {
    approveBalanceRequestMutation.mutate(requestId);
  };

  const handleReject = () => {
    if (selectedRequestId && rejectionReason.trim()) {
      rejectBalanceRequestMutation.mutate({
        requestId: selectedRequestId,
        reason: rejectionReason
      });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequestId(null);
    }
  };

  const openRejectDialog = (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsRejectDialogOpen(true);
  };
  
  const handleRespondToTicket = () => {
    if (selectedTicketId && ticketResponse.trim()) {
      respondToTicketMutation.mutate({
        ticketId: selectedTicketId,
        response: ticketResponse
      });
      setIsResponseDialogOpen(false);
      setTicketResponse("");
      setSelectedTicketId(null);
    }
  };
  
  const openResponseDialog = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setIsResponseDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage balance requests, support tickets, and other administrative tasks</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="balance-requests">
        <TabsList className="mb-4">
          <TabsTrigger value="balance-requests">Balance Requests</TabsTrigger>
          <TabsTrigger value="support-tickets">Support Tickets</TabsTrigger>
        </TabsList>
        
        {/* Balance Requests Tab */}
        <TabsContent value="balance-requests">
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Requests</TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Balance Requests</CardTitle>
                  <CardDescription>Review and approve/reject pending balance addition requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingBalanceRequestsQuery.isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : pendingBalanceRequestsQuery.data && (pendingBalanceRequestsQuery.data as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No pending balance requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingBalanceRequestsQuery.data && (pendingBalanceRequestsQuery.data as any[]).map((request: any) => (
                        <Card key={request.id} className="overflow-hidden">
                          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-2">
                              <p className="font-medium">User ID: {request.userId}</p>
                              <p className="text-sm text-muted-foreground">UTR: {request.utrNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                <time dateTime={request.timestamp}>{formatDate(request.timestamp)}</time>
                              </p>
                            </div>
                            <div className="text-right md:text-left">
                              <Badge variant="secondary">₹{request.amount.toFixed(2)}</Badge>
                            </div>
                            <div className="text-right md:text-left">
                              <Badge>{request.status}</Badge>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(request.id)} 
                                disabled={approveBalanceRequestMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => openRejectDialog(request.id)}
                                disabled={rejectBalanceRequestMutation.isPending}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => window.open(`https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics`, '_blank')}
                              >
                                <Search className="mr-1 h-4 w-4" />
                                Verify UTR
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Balance Requests</CardTitle>
                  <CardDescription>View history of all balance requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {allBalanceRequestsQuery.isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : allBalanceRequestsQuery.data && (allBalanceRequestsQuery.data as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No balance requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allBalanceRequestsQuery.data && (allBalanceRequestsQuery.data as any[]).map((request: any) => (
                        <Card key={request.id} className="overflow-hidden">
                          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div>
                              <p className="font-medium">User ID: {request.userId}</p>
                              <p className="text-sm text-muted-foreground">UTR: {request.utrNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                <time dateTime={request.timestamp}>{formatDate(request.timestamp)}</time>
                              </p>
                            </div>
                            <div className="text-right md:text-left">
                              <Badge variant="secondary">₹{request.amount.toFixed(2)}</Badge>
                            </div>
                            <div className="text-right md:text-left">
                              <Badge 
                                variant={
                                  request.status === 'approved' ? 'default' : 
                                  request.status === 'rejected' ? 'destructive' : 
                                  'secondary'
                                }
                              >
                                {request.status}
                              </Badge>
                              {request.status === 'rejected' && request.rejectionReason && (
                                <p className="text-sm text-destructive mt-1">
                                  Reason: {request.rejectionReason}
                                </p>
                              )}
                              {request.approvedAt && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {request.status === 'approved' ? 'Approved' : 'Rejected'} on {' '}
                                  <time dateTime={request.approvedAt}>{formatDate(request.approvedAt)}</time>
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Support Tickets Tab */}
        <TabsContent value="support-tickets">
          <Tabs defaultValue="open">
            <TabsList className="mb-4">
              <TabsTrigger value="open">Open Tickets</TabsTrigger>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open">
              <Card>
                <CardHeader>
                  <CardTitle>Open Support Tickets</CardTitle>
                  <CardDescription>Respond to customer support tickets that require attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {openSupportTicketsQuery.isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : openSupportTicketsQuery.data && (openSupportTicketsQuery.data as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No open support tickets</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {openSupportTicketsQuery.data && (openSupportTicketsQuery.data as any[]).map((ticket: any) => (
                        <Card key={ticket.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium text-lg">{ticket.subject}</h3>
                                <p className="text-sm text-muted-foreground">
                                  User ID: {ticket.userId} • 
                                  <time dateTime={ticket.timestamp} className="ml-1">
                                    {formatDate(ticket.timestamp)}
                                  </time>
                                </p>
                              </div>
                              <Badge variant="outline" className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {ticket.status}
                              </Badge>
                            </div>
                            <div className="bg-muted p-3 rounded-md mb-4">
                              <p className="whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button 
                                onClick={() => openResponseDialog(ticket.id)}
                                disabled={respondToTicketMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Respond
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setTicketResponse("Thank you for contacting our support team. We've reviewed your issue and...");
                                  openResponseDialog(ticket.id);
                                }}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Quick Response
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  const url = `mailto:${ticket.userId}@user.com?subject=RE: ${ticket.subject}&body=Dear User,%0D%0A%0D%0ARegarding your ticket about "${ticket.subject}":%0D%0A%0D%0A`;
                                  window.open(url, '_blank');
                                }}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Email User
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Support Tickets</CardTitle>
                  <CardDescription>View history of all customer support tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  {allSupportTicketsQuery.isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : allSupportTicketsQuery.data && (allSupportTicketsQuery.data as any[]).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No support tickets found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allSupportTicketsQuery.data && (allSupportTicketsQuery.data as any[]).map((ticket: any) => (
                        <Card key={ticket.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium text-lg">{ticket.subject}</h3>
                                <p className="text-sm text-muted-foreground">
                                  User ID: {ticket.userId} • 
                                  <time dateTime={ticket.timestamp} className="ml-1">
                                    {formatDate(ticket.timestamp)}
                                  </time>
                                </p>
                              </div>
                              <Badge 
                                variant={ticket.status === 'open' ? 'outline' : 'default'}
                                className="flex items-center"
                              >
                                {ticket.status === 'open' ? (
                                  <><Clock className="w-3 h-3 mr-1" />{ticket.status}</>
                                ) : (
                                  <><Check className="w-3 h-3 mr-1" />{ticket.status}</>
                                )}
                              </Badge>
                            </div>
                            <div className="bg-muted p-3 rounded-md mb-3">
                              <p className="whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                            
                            {ticket.response && (
                              <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Response:</p>
                                <div className="bg-primary/10 p-3 rounded-md text-primary-foreground">
                                  <p className="whitespace-pre-wrap">{ticket.response}</p>
                                </div>
                                {ticket.respondedAt && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Responded on {formatDate(ticket.respondedAt)}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {ticket.status === 'open' && (
                              <div className="flex justify-end mt-4">
                                <Button 
                                  onClick={() => openResponseDialog(ticket.id)}
                                  disabled={respondToTicketMutation.isPending}
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Respond
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Balance Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this balance request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setRejectionReason("Invalid UTR number provided.")}
              >
                Invalid UTR
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setRejectionReason("The transaction could not be verified.")}
              >
                Unverified Transaction
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setRejectionReason("The amount in the transaction does not match the requested amount.")}
              >
                Amount Mismatch
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setRejectionReason("The transaction is older than 24 hours.")}
              >
                Expired Transaction
              </Button>
            </div>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={!rejectionReason.trim() || rejectBalanceRequestMutation.isPending}
              variant="destructive"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ticket Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Respond to Support Ticket</DialogTitle>
            <DialogDescription>
              Enter your response to this support ticket. Once submitted, the ticket will be marked as closed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Button 
                variant="outline" 
                onClick={() => setTicketResponse(prev => prev + "\n\nWe apologize for the inconvenience caused. Our team is working to resolve this issue as quickly as possible.")}
              >
                Add Apology
              </Button>
              <Button 
                variant="outline"
                onClick={() => setTicketResponse(prev => prev + "\n\nFor further assistance, please contact our customer support team at support@otpservice.com.")}
              >
                Add Contact Info
              </Button>
              <Button 
                variant="outline"
                onClick={() => setTicketResponse(prev => prev + "\n\nWe have added ₹10 credit to your account as a goodwill gesture.")}
              >
                Add Goodwill Credit
              </Button>
              <Button 
                variant="outline"
                onClick={() => setTicketResponse(prev => prev + "\n\nThank you for bringing this to our attention. We value your feedback and continuously work to improve our services.")}
              >
                Add Thank You
              </Button>
            </div>
            <Textarea
              placeholder="Enter your response..."
              value={ticketResponse}
              onChange={(e) => setTicketResponse(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRespondToTicket} 
              disabled={!ticketResponse.trim() || respondToTicketMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return <AdminPageContent />;
}
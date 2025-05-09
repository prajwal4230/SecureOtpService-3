import React, { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useBalanceRequests } from "@/hooks/use-balance-requests";
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
import { AlertCircle, Check, X } from "lucide-react";

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
  
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  React.useEffect(() => {
    if (isAdmin) {
      // If user is admin, fetch all and pending requests
      allBalanceRequestsQuery.refetch();
      pendingBalanceRequestsQuery.refetch();
    }
  }, [isAdmin, allBalanceRequestsQuery, pendingBalanceRequestsQuery]);

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

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage balance requests and other administrative tasks</CardDescription>
        </CardHeader>
      </Card>

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
              ) : pendingBalanceRequestsQuery.data?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending balance requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBalanceRequestsQuery.data?.map((request: any) => (
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
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openRejectDialog(request.id)}
                            disabled={rejectBalanceRequestMutation.isPending}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
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
              ) : allBalanceRequestsQuery.data?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No balance requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBalanceRequestsQuery.data?.map((request: any) => (
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
            >
              Confirm Rejection
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
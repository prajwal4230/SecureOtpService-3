import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Search, SearchX } from "lucide-react";
import { getAllApps } from "@/lib/app-data";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GetOTPsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const apps = getAllApps();
  
  const requestOtpMutation = useMutation({
    mutationFn: async ({ appName, price }: { appName: string, price: number }) => {
      const res = await apiRequest("POST", "/api/request-otp", { appName, price });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "OTP requested successfully",
        description: "You will be redirected to see your OTP.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      // Store the current app name in session storage to use in the check OTP page
      sessionStorage.setItem("currentOtpApp", data.appName);
      
      navigate("/check-otp");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request OTP",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleGetOtp = (appName: string, price: number) => {
    if (user && user.walletBalance < price) {
      toast({
        title: "Insufficient balance",
        description: "Please add funds to your wallet.",
        variant: "destructive",
      });
      return;
    }
    
    requestOtpMutation.mutate({ appName, price });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="mr-3">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-primary">RocksOTPs</h1>
            </div>
            <div className="flex items-center">
              <div className="px-3 py-1.5 bg-neutral-100 rounded-md flex items-center">
                <span className="text-sm text-neutral-500 mr-1">Balance:</span>
                <span className="font-medium text-neutral-800">₹{user.walletBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-neutral-900">Get OTPs</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Search Bar */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-400" />
                  </div>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-6 text-base"
                    placeholder="Search App Name"
                  />
                </div>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredApps.map((app) => {
                  const Icon = app.icon;
                  return (
                  <Card key={app.id} className="overflow-hidden hover:shadow transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 flex-shrink-0 bg-neutral-100 rounded-full flex items-center justify-center">
                          <Icon className={`h-6 w-6 ${
                            app.name === 'WhatsApp' ? 'text-green-600' :
                            app.name === 'Instagram' ? 'text-pink-600' :
                            app.name === 'Facebook' ? 'text-blue-600' :
                            app.name === 'Gmail' ? 'text-red-600' :
                            app.name === 'Telegram' ? 'text-blue-500' :
                            app.name === 'Twitter' ? 'text-blue-400' :
                            app.name === 'Snapchat' ? 'text-yellow-400' :
                            app.name === 'TikTok' ? 'text-black' :
                            app.name === 'LinkedIn' ? 'text-blue-700' :
                            app.name === 'Amazon' ? 'text-orange-500' :
                            app.name === 'Netflix' ? 'text-red-700' :
                            app.name === 'Spotify' ? 'text-green-500' :
                            app.name === 'Uber' ? 'text-black' :
                            app.name === 'Zomato' ? 'text-red-500' :
                            app.name === 'Swiggy' ? 'text-orange-500' :
                            app.name === 'Paytm' ? 'text-blue-500' :
                            app.name === 'PhonePe' ? 'text-purple-600' :
                            app.name === 'Google Pay' ? 'text-green-600' :
                            app.name === 'ShareChat' ? 'text-teal-500' :
                            app.name === 'Tinder' ? 'text-red-500' :
                            'text-neutral-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-neutral-900">{app.name}</h3>
                          <p className="text-sm text-neutral-500">
                            ₹{app.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleGetOtp(app.name, app.price)}
                        disabled={requestOtpMutation.isPending || user.walletBalance < app.price}
                      >
                        {requestOtpMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : user.walletBalance < app.price ? (
                          "Insufficient Balance"
                        ) : (
                          "Get OTP"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>

              {/* Empty state when no results */}
              {filteredApps.length === 0 && (
                <div className="text-center py-12">
                  <SearchX className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-2 text-lg font-medium text-neutral-900">No apps found</h3>
                  <p className="mt-1 text-sm text-neutral-500">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

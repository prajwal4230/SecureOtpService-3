import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function CheckOTPPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [_, navigate] = useLocation();
  const [appName, setAppName] = useState<string | null>(null);
  
  // Get the app name from session storage
  useEffect(() => {
    const storedAppName = sessionStorage.getItem("currentOtpApp");
    if (storedAppName) {
      setAppName(storedAppName);
    }
  }, []);
  
  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 100);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Query for OTP after a delay to simulate processing
  const { data: otpData, isLoading } = useQuery({
    queryKey: ["/api/active-otp", appName],
    queryFn: async ({ queryKey }) => {
      // Only fetch if we have an app name
      if (!queryKey[1]) return null;
      
      // Wait a bit before actually querying the OTP
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await fetch(`/api/active-otp/${queryKey[1]}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch OTP");
      }
      
      return response.json();
    },
    enabled: !!appName && progress > 30, // Only start querying when progress is above 30%
    refetchInterval: otpData ? false : 2000, // Refetch until we get data
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
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

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            {/* Loading Animation */}
            {!otpData ? (
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-neutral-200 rounded-full"></div>
                  <Loader2 className="absolute top-0 left-0 w-24 h-24 animate-spin text-primary" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
            
            {otpData ? (
              <>
                <h2 className="text-2xl font-bold text-neutral-900">OTP Received</h2>
                <p className="mt-2 text-neutral-600">
                  Your verification code for {appName} is:
                </p>
                <div className="mt-4 bg-neutral-100 rounded-lg p-4">
                  <span className="text-3xl font-bold tracking-wider text-neutral-900">{otpData.code}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  This code will expire in 10 minutes
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-neutral-900">Waiting for OTP...</h2>
                <p className="mt-2 text-neutral-600">
                  We're retrieving your verification code. This usually takes 10-30 seconds.
                </p>
              </>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          <div>
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant={otpData ? "default" : "outline"}
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

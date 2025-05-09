import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogOut, Wallet, MessageSquare, CheckCircle, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  if (!user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">RocksOTPs</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-sm text-neutral-500 mr-2">Welcome,</span>
                <span className="font-medium text-neutral-800">{user.name}</span>
              </div>
              <div className="ml-4 px-3 py-1.5 bg-neutral-100 rounded-md flex items-center">
                <span className="text-sm text-neutral-500 mr-1">Balance:</span>
                <span className="font-medium text-neutral-800">₹{user.walletBalance.toFixed(2)}</span>
              </div>
              <button onClick={handleLogout} className="ml-4 text-neutral-500 hover:text-neutral-700">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Add Balance Card */}
                <Link href="/add-balance">
                  <Card className="hover:shadow transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                          <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-neutral-900">Add Balance</h2>
                          <p className="text-sm text-neutral-500">Add funds to your account</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Get OTPs Card */}
                <Link href="/get-otps">
                  <Card className="hover:shadow transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                          <MessageSquare className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-neutral-900">Get OTPs</h2>
                          <p className="text-sm text-neutral-500">Select app and receive OTP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Check OTP Card */}
                <Link href="/check-otp">
                  <Card className="hover:shadow transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                          <CheckCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-neutral-900">Check OTP</h2>
                          <p className="text-sm text-neutral-500">View your received OTPs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                {/* Support Card */}
                <Link href="/support">
                  <Card className="hover:shadow transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-neutral-200 rounded-md p-3">
                          <HelpCircle className="h-5 w-5 text-neutral-700" />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-neutral-900">Support</h2>
                          <p className="text-sm text-neutral-500">Get help with any issues</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Transaction History */}
              <Card className="mt-8">
                <CardContent className="p-0">
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Recent Transactions</h3>
                  </div>
                  
                  {isLoadingTransactions ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="divide-y divide-neutral-200">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className={`material-icons mr-3 ${
                                transaction.type === 'deposit' 
                                  ? 'text-green-600' 
                                  : 'text-neutral-600'
                              }`}>
                                {transaction.type === 'deposit' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <MessageSquare className="h-5 w-5" />
                                )}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-neutral-900">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {new Date(transaction.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${
                              transaction.type === 'deposit' 
                                ? 'text-green-600' 
                                : 'text-neutral-700'
                            }`}>
                              {transaction.type === 'deposit' ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-neutral-500">No transactions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

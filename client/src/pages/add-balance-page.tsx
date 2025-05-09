import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, QrCode, Copy, CreditCard, AlertCircle, Loader2, Clock } from "lucide-react";
import { useBalanceRequests } from "@/hooks/use-balance-requests";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  utrNumber: z.string().min(10, {
    message: "UTR number must be at least 10 characters",
  }),
  amount: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(50, {
      message: "Amount must be at least ₹50",
    })
  ),
});

export default function AddBalancePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentTab, setPaymentTab] = useState("qrcode");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      utrNumber: "",
      amount: 50,
    },
  });
  
  const { createBalanceRequestMutation, userBalanceRequestsQuery } = useBalanceRequests();
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    createBalanceRequestMutation.mutate({
      amount: Number(values.amount),
      utrNumber: values.utrNumber
    });
  }

  if (!user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "UPI ID has been copied to your clipboard.",
    });
  };

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
                <span className="font-medium text-neutral-800">₹{user.walletBalance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-neutral-900">Add Balance</h1>
          </div>
        </header>
        <main>
          <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <Card>
                <CardContent className="p-6">
                  {/* Payment Method Tabs */}
                  <Tabs defaultValue="qrcode" onValueChange={setPaymentTab} value={paymentTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="qrcode" className="flex items-center">
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan & Pay
                      </TabsTrigger>
                      <TabsTrigger value="upi" className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        UPI ID
                      </TabsTrigger>
                    </TabsList>

                    {/* Important notice */}
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600">
                            Minimum deposit ₹50 required
                          </p>
                        </div>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <TabsContent value="qrcode" className="mt-0">
                          <div className="flex flex-col items-center">
                            {/* QR Code */}
                            <div className="bg-white p-3 border border-neutral-300 rounded-lg mb-4">
                              <div className="h-64 w-64 flex items-center justify-center">
                                <img 
                                  src="/upi_qr_code.jpg" 
                                  alt="UPI QR Code" 
                                  className="h-full w-full object-contain" 
                                />
                              </div>
                            </div>
                            <p className="text-sm text-neutral-600 mb-6 max-w-sm text-center">
                              Scan the QR code using any UPI app like PhonePe, GPay, or Paytm. Minimum ₹50.
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="upi" className="mt-0">
                          <div className="flex flex-col items-center mb-6">
                            <div className="bg-neutral-100 px-6 py-4 rounded-lg mb-4 w-full sm:w-auto">
                              <span className="font-mono text-lg font-medium text-neutral-800">Ganeshraut4230@oksbi</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary flex items-center text-sm"
                              onClick={() => copyToClipboard("Ganeshraut4230@oksbi")}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy UPI ID
                            </Button>
                            <p className="text-sm text-neutral-600 mt-4 max-w-sm text-center">
                              Use this UPI ID to make a payment through any UPI app. Minimum ₹50.
                            </p>
                          </div>
                        </TabsContent>

                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" min="50" placeholder="Enter amount" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the amount you want to add to your wallet (minimum ₹50)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="utrNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UTR Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter 12-digit UTR number" {...field} />
                              </FormControl>
                              <FormDescription>
                                You'll find the UTR number in the payment confirmation from your UPI app.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={createBalanceRequestMutation.isPending}
                          >
                            {createBalanceRequestMutation.isPending ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Request...
                              </>
                            ) : (
                              <>
                                <Clock className="mr-2 h-4 w-4" />
                                Submit Balance Request
                              </>
                            )}
                          </Button>
                          
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <Clock className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                  Your balance request will be reviewed by an administrator. This process usually takes less than 24 hours.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

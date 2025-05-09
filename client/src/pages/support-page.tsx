import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Instagram, Send, Loader2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  subject: z.string({
    required_error: "Please select a subject",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters",
  }),
});

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Support request submitted",
      description: "We'll get back to you as soon as possible.",
    });
    
    form.reset();
  }

  if (!user) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>;

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-neutral-900">Customer Support</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-neutral-900">How can we help you?</h2>
                    <p className="mt-1 text-neutral-600">
                      Our support team is available 24/7 to assist you with any questions or issues.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
                    {/* Telegram Support */}
                    <Card>
                      <CardContent className="p-6 flex flex-col items-center">
                        <Send className="text-blue-500 h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900">Telegram</h3>
                        <p className="mt-2 text-neutral-600 text-center">
                          Fast responses, available 24/7
                        </p>
                        <a 
                          href="https://t.me/alltypesofsellerbotofficial" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-4 flex items-center text-primary font-medium"
                        >
                          @alltypesofsellerbotofficial
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </CardContent>
                    </Card>

                    {/* Instagram Support */}
                    <Card>
                      <CardContent className="p-6 flex flex-col items-center">
                        <Instagram className="text-pink-500 h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900">Instagram</h3>
                        <p className="mt-2 text-neutral-600 text-center">
                          Follow us for updates and support
                        </p>
                        <a 
                          href="https://www.instagram.com/all_types_of_seller?igsh=YzljYTk1ODg3Zg==" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-4 flex items-center text-primary font-medium"
                        >
                          @all_types_of_seller
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-10 border-t border-neutral-200 pt-6">
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Send Us Feedback</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an issue type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">General Question</SelectItem>
                                  <SelectItem value="payment">Payment Issue</SelectItem>
                                  <SelectItem value="otp">OTP Not Received</SelectItem>
                                  <SelectItem value="feature">Feature Request</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your issue or feedback" 
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Submit</Button>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-neutral-200">
                    <div className="px-4 py-5 sm:px-6">
                      <h4 className="text-base font-medium text-neutral-900">How fast will I receive my OTP?</h4>
                      <p className="mt-1 text-sm text-neutral-600">
                        Most OTPs are received within 10-30 seconds after request. In rare cases, it might take up to 60 seconds.
                      </p>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                      <h4 className="text-base font-medium text-neutral-900">What if I don't receive my OTP?</h4>
                      <p className="mt-1 text-sm text-neutral-600">
                        If you don't receive an OTP within 60 seconds, you can request a refund through our support channels.
                      </p>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                      <h4 className="text-base font-medium text-neutral-900">How do I add balance to my account?</h4>
                      <p className="mt-1 text-sm text-neutral-600">
                        You can add balance using UPI payment methods like PhonePe, GPay, or any UPI app by scanning the QR code or using our UPI ID.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

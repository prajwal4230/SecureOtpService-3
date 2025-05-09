import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, registerSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/hooks/use-auth";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  // Access AuthContext directly to avoid circular dependencies
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-4 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }
  
  const { loginMutation, registerMutation, user, signInWithGoogleMutation } = authContext;
  const [_, navigate] = useLocation();
  
  // If the user is already logged in, redirect to the dashboard
  if (user) {
    navigate("/dashboard");
    return null;
  }
  
  // Handle Google sign in
  const handleGoogleSignIn = () => {
    signInWithGoogleMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900 cursor-pointer">
            <span className="text-primary hover:text-primary-dark">RocksOTPs</span>
          </h2>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            {/* Tabs */}
            <div className="border-b border-neutral-200 mb-6">
              <div className="flex -mb-px">
                <button 
                  onClick={() => setActiveTab("login")} 
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-base ${
                    activeTab === "login" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setActiveTab("signup")} 
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-base ${
                    activeTab === "signup" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>
            
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignIn}
                disabled={signInWithGoogleMutation.isPending}
              >
                {signInWithGoogleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                )}
                {signInWithGoogleMutation.isPending ? "Signing in..." : "Continue with Google"}
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {activeTab === "login" ? (
              <LoginForm setActiveTab={setActiveTab} />
            ) : (
              <SignupForm setActiveTab={setActiveTab} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FormProps {
  setActiveTab: (tab: "login" | "signup") => void;
}

function LoginForm({ setActiveTab }: FormProps) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return <div>Loading authentication...</div>;
  }
  const { loginMutation } = authContext;
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox id="remember-me" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {/* CAPTCHA placeholder */}
        <div className="mt-4 bg-neutral-50 rounded-md p-4 flex items-center justify-center border border-neutral-200">
          <span className="text-neutral-500 text-sm">CAPTCHA verification would appear here</span>
        </div>

        <div className="text-sm text-center">
          <span className="text-neutral-500">Don't have an account?</span>{" "}
          <button 
            type="button" 
            onClick={() => setActiveTab("signup")} 
            className="font-medium text-primary hover:text-primary-dark"
          >
            Sign up now
          </button>
        </div>
      </form>
    </Form>
  );
}

function SignupForm({ setActiveTab }: FormProps) {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return <div>Loading authentication...</div>;
  }
  const { registerMutation } = authContext;
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center">
          <Checkbox id="terms" required />
          <label htmlFor="terms" className="ml-2 block text-sm text-neutral-700">
            I agree to the{" "}
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-primary hover:text-primary-dark">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        {/* CAPTCHA placeholder */}
        <div className="mt-4 bg-neutral-50 rounded-md p-4 flex items-center justify-center border border-neutral-200">
          <span className="text-neutral-500 text-sm">CAPTCHA verification would appear here</span>
        </div>

        <div className="text-sm text-center">
          <span className="text-neutral-500">Already have an account?</span>{" "}
          <button 
            type="button" 
            onClick={() => setActiveTab("login")} 
            className="font-medium text-primary hover:text-primary-dark"
          >
            Log in
          </button>
        </div>
      </form>
    </Form>
  );
}

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
  
  const { loginMutation, registerMutation, user } = authContext;
  const [_, navigate] = useLocation();
  
  // If the user is already logged in, redirect to the dashboard
  if (user) {
    navigate("/dashboard");
    return null;
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => authContext.signInWithGoogleMutation.mutate()}
          disabled={authContext.signInWithGoogleMutation.isPending}
        >
          {authContext.signInWithGoogleMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Sign in with Google
            </>
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
            <Link href="/terms" className="font-medium text-primary hover:text-primary-dark">
              Terms and Conditions
            </Link>
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => authContext.signInWithGoogleMutation.mutate()}
          disabled={authContext.signInWithGoogleMutation.isPending}
        >
          {authContext.signInWithGoogleMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Sign up with Google
            </>
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

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
    try {
      loginMutation.mutate(values);
    } catch (error) {
      console.error("Error in login form submission:", error);
    }
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
    try {
      registerMutation.mutate(values);
    } catch (error) {
      console.error("Error in signup form submission:", error);
    }
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

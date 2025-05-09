import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { signInWithGoogle, signOutUser, auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, getIdToken } from "firebase/auth";

type AuthContextType = {
  user: Partial<SelectUser> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<SelectUser, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<SelectUser, "password">, Error, RegisterData>;
  signInWithGoogleMutation: UseMutationResult<void, Error, void>;
};

export const loginSchema = z.object({
  username: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<Omit<SelectUser, "password"> | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Use the token to authenticate with our backend
          await handleFirebaseLogin(idToken);
        } catch (error) {
          console.error("Error during Firebase authentication sync:", error);
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Handle Firebase login with our backend
  const handleFirebaseLogin = async (idToken: string) => {
    try {
      const res = await apiRequest("POST", "/api/firebase-auth", { idToken });
      const userData = await res.json();
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Login successful",
        description: `Welcome, ${userData.name}!`,
      });
    } catch (error) {
      console.error("Error during Firebase auth with backend:", error);
      toast({
        title: "Authentication failed",
        description: "There was an error with your Google sign-in.",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogleMutation = useMutation({
    mutationFn: async () => {
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        await handleFirebaseLogin(idToken);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Google Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to RocksOTPs, ${user.name}!`,
      });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Log out from both Firebase and our backend
      await signOutUser();
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user as SelectUser | null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        signInWithGoogleMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

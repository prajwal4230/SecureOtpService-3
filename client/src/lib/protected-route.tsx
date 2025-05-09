import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useContext } from "react";
import { AuthContext } from "@/hooks/use-auth";

type ComponentType = () => React.JSX.Element;

// Wrap the component to ensure it always returns an Element (not null)
const withNonNullableReturn = (Component: ComponentType): ComponentType => {
  return () => {
    return Component() || <div>Loading...</div>;
  };
};

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType;
}) {
  // Use useContext directly to avoid errors if AuthProvider isn't available
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const isLoading = authContext?.isLoading || false;
  
  const WrappedComponent = withNonNullableReturn(Component);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user ? (
        <WrappedComponent />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}

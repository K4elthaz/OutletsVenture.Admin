import { useAuth } from "./AuthContext";
import Login2 from "../app/authentication/login/page";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ComponentWithAuth = (props: P) => {
    const { user } = useAuth();

    // if (!user) {
    //   return <Login2 />;
    // }

    return <WrappedComponent {...props} />;
  };

  // Set a display name for debugging
  ComponentWithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithAuth;
};

export default withAuth;

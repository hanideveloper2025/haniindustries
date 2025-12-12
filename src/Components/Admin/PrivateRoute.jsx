import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

const TEST = import.meta.env.VITE_TEST;
const MAIN = import.meta.env.VITE_MAIN;

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${MAIN}/api/admin/check-auth`, {
          method: "GET",
          credentials: "include", // Important for cookies
        });

        const data = await response.json();

        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default PrivateRoute;

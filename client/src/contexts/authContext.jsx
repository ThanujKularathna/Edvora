import { useReducer, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: "",
      };
    case "logout":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload || "",
      };
    case "error":
      return {
        ...state,
        error: action.payload,
      };
    default:
      throw new Error("Invalid action type");
  }
}

function AuthProvider({ children }) {
  const [{ user, isAuthenticated, isLoading, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    async function checkAuth() {
      const currentPath = window.location.pathname;
      console.log(currentPath);
      const isLoginPage =
        currentPath === "/" ||
        currentPath === "/forgot-password" ||
        currentPath.startsWith("/reset-password");

      // Skip auth check on login-related pages
      if (isLoginPage) {
        dispatch({ type: "logout" });
        return;
      }

      // Check auth for protected routes
      try {
        const response = await axios.get("/api/v1/users/me", {
          withCredentials: true,
        });
        dispatch({ type: "login", payload: response.data.user });
      } catch (err) {
        dispatch({ type: "logout" });
      }
    }

    checkAuth();
  }, []);

  async function login(email, password) {
    try {
      const response = await axios.post(
        "api/v1/users/login",
        { email, password },
        { withCredentials: true }
      );
      const userData = response.data.user;
      dispatch({ type: "login", payload: userData });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Something went wrong during login.";
      dispatch({ type: "error", payload: message });
    }
  }

  async function logout() {
    try {
      await axios.get("api/v1/users/logout", {}, { withCredentials: true });
    } catch (err) {
      console.log("Logout API failed:", err);
    } finally {
      dispatch({ type: "logout" });
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };

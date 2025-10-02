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
    case "updateUser":
      return {
        ...state,
        user: action.payload,
        error: "",
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

  // ✅ check logged in user on app load
  useEffect(() => {
    async function checkAuth() {
      const currentPath = window.location.pathname;
      const isLoginPage =
        currentPath === "/" ||
        currentPath === "/forgot-password" ||
        currentPath.startsWith("/reset-password");

      // Skip check on login/forgot/reset pages
      if (isLoginPage) {
        dispatch({ type: "logout" });
        return;
      }

      try {
        const response = await axios.get("/api/v1/users/me", {
          withCredentials: true,
        });

        let userData = response.data.user;

        // ✅ Normalize role to lowercase
        if (userData.role) {
          userData = { ...userData, role: userData.role.toLowerCase() };
        }

        dispatch({ type: "login", payload: userData });
      } catch (err) {
        dispatch({ type: "logout" });
      }
    }

    checkAuth();
  }, []);

  // ✅ login
  async function login(email, password) {
    try {
      const response = await axios.post(
        "/api/v1/users/login",
        { email, password },
        { withCredentials: true }
      );

      let userData = response.data.user;

      // normalize role
      if (userData.role) {
        userData = { ...userData, role: userData.role.toLowerCase() };
      }

      dispatch({ type: "login", payload: userData });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Something went wrong during login.";
      dispatch({ type: "error", payload: message });
    }
  }

  // ✅ logout
  async function logout() {
    try {
      await axios.get("/api/v1/users/logout", { withCredentials: true });
    } catch (err) {
      console.log("Logout API failed:", err);
    } finally {
      dispatch({ type: "logout" });
    }
  }

  // ✅ update user
  function updateUser(userData) {
    dispatch({ type: "updateUser", payload: userData });
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, error, login, logout, updateUser }}
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

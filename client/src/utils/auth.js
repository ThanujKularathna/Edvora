export const loginUser = async (email, password) => {
  // Simulated API logic
  if (email === "student@example.com" && password === "password123") {
    localStorage.setItem("user", email);
    return true;
  }
  return false;
};

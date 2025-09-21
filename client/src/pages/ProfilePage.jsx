import React from "react";
import ProfileLayout from "../components/Profile/ProfileLayout";
import { useAuth } from "../contexts/authContext"; 
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const { user } = useAuth(); 
  const location = useLocation();
  const isAdminProfile = location.pathname.startsWith('/admin');

  if (!user) return <p>Loading...</p>; 

  return (
    <>
      {!isAdminProfile && <Navbar />}
      <ProfileLayout user={user} />
      {!isAdminProfile && <Footer />}
    </>
  );
}

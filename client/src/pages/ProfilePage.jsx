import React from "react";
import ProfileLayout from "../components/Profile/ProfileLayout";
import { useAuth } from "../contexts/authContext"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const { user } = useAuth(); 

  if (!user) return <p>Loading...</p>; 

  return (
    <>
      <Navbar />
      <ProfileLayout user={user} />
      <Footer />
    </>
  );
}

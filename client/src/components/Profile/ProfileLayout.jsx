import React from "react";
import ProfileHeader from "./ProfileHeader";
import UserDetails from "./UserDetails";
import CourseDetails from "./CourseDetails";
// import Reports from "./Reports";
import ActivityLog from "./ActivityLog";
import "./Profile.css";

export default function ProfileLayout({ user }) {
  return (
    <div className="profile-container">
      <ProfileHeader name={user.name} />

      <div className="profile-grid">
        <UserDetails fullName={user.name} email={user.email} city={user.address} contact={user.phone} />
        <ActivityLog firstAccess={user.firstAccess} lastAccess={user.lastAccess} />
      </div>

      <CourseDetails role={user.role} subjects={user.subjects} classes={user.classes} />

      {/* {user.role === "student" && <Reports />} */}
    </div>
  );
}

import { useState } from "react";
import AdminSidebar from "./AdminSidebar.jsx";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-16 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

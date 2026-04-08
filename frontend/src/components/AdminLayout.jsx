import AdminSidebar from "./AdminSidebar.jsx";
import SubAdminSidebar from "./SubAdminSidebar.jsx";

const AdminLayout = ({ children }) => {
  const isSubAdmin = !!localStorage.getItem("subadmin_token") && !localStorage.getItem("adminToken");

  return (
    <div className="min-h-screen bg-background">
      {isSubAdmin ? <SubAdminSidebar /> : <AdminSidebar />}
      <main className="ml-16 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

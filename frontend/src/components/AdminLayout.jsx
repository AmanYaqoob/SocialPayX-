import { useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import SubAdminSidebar from "./SubAdminSidebar.jsx";

const AdminLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isSubAdmin = pathname.startsWith("/subadmin");

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

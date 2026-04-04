import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SubAdminSidebar from "./SubAdminSidebar.jsx";

const SubAdminLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("subadmin_token");
    const user = JSON.parse(localStorage.getItem("subadmin_user") || "{}");
    if (!token || (!user.isAdmin && !user.isSubAdmin)) {
      navigate("/subadmin/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SubAdminSidebar />
      <main className="ml-16 md:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default SubAdminLayout;

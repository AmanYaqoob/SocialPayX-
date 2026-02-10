import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 flex items-center justify-center">
          <span className="text-5xl font-bold gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 btn-gradient rounded-xl font-semibold text-foreground btn-glow flex items-center gap-2 mx-auto"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;

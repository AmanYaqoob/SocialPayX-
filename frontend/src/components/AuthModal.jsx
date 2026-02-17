import { useState, useContext, useEffect } from "react";
import { X, Eye, EyeOff, User, Mail, Lock, Gift } from "lucide-react";
import { AuthContext } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup" && formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let response;
      if (mode === "login") {
        response = await apiService.login(formData.email, formData.password);
        login(response.user, response.token);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        onClose();
        navigate("/dashboard");
      } else {
        response = await apiService.register(
          formData.email,
          formData.password,
          formData.username,
          formData.referralCode
        );
        
        // Check if email verification is required
        if (response.requiresVerification) {
          // Store email for verification page
          localStorage.setItem('pendingEmail', formData.email);
          localStorage.setItem('pendingPassword', formData.password);
          
          toast({
            title: "Registration Successful!",
            description: "Please check your terminal for the verification code.",
          });
          
          onClose();
          navigate('/verify-email');
          setIsLoading(false);
          return;
        }
        
        // If no verification required, prompt login
        setMode("login");
        
        toast({
          title: "Account created!",
          description: "Please sign in with your new account.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {mode === "login" 
              ? "Sign in to continue mining SPX" 
              : "Join the SPX mining community"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === "signup" && (
            <>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
                />
              </div>

              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Referral code (optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none input-glow transition-all"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a>
                </span>
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 btn-gradient rounded-lg font-semibold text-foreground btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center mt-6 text-muted-foreground">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary hover:underline font-medium"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

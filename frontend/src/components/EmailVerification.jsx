import { useState } from "react";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService from "../services/api.js";

const EmailVerification = ({ email, onVerified, onBack }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.verifyEmail(email, code);
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified",
      });
      onVerified();
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign Up
        </button>

        {/* Verification Card */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {/* Email Icon with Animation */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verify Your Email
          </h1>
          
          <p className="text-muted-foreground mb-6">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-accent font-medium">
              📱 Check your terminal/console for the verification code
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground text-center text-lg font-mono tracking-widest focus:outline-none input-glow"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 btn-gradient rounded-lg font-semibold text-foreground btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Didn't receive the code? Check your terminal/console output
              <br />
              The code expires in 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
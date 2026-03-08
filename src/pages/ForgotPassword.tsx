import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/services/authService";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [mobile, setMobile] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    const result = await resetPassword(mobile.trim());
    setLoading(false);

    if (result.success) {
      setSent(true);
      toast.success("OTP sent to your mobile number");
    } else {
      toast.error(result.error || "Failed to send OTP");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="navy-gradient px-6 pb-8 pt-12 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-primary-foreground">Forgot Password</h1>
        <p className="mt-1 text-sm text-primary-foreground/60">
          We'll send an OTP to your registered mobile
        </p>
      </div>

      <div className="-mt-4 flex-1 rounded-t-3xl bg-background px-6 pt-8">
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-sm font-semibold">Registered Mobile Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+91</span>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setError("");
                  }}
                  className={`pl-12 ${error ? "border-destructive" : ""}`}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Send className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">OTP Sent!</h2>
            <p className="text-sm text-muted-foreground">
              A one-time password has been sent to +91 {mobile}. Use it to reset your password.
            </p>
            <p className="text-xs text-muted-foreground italic">
              (In production, this will integrate with AWS Cognito's forgotPassword flow)
            </p>
          </div>
        )}

        <Link
          to="/signin"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = "Enter a valid 10-digit mobile number";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login({ mobile: mobile.trim(), password, rememberMe });
    setLoading(false);

    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="navy-gradient px-6 pb-10 pt-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
          <Shield className="h-9 w-9 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">Civic-Trust</h1>
        <p className="mt-1 text-sm text-primary-foreground/60">
          Verified Civic Reporting Portal
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="-mt-4 flex-1 space-y-5 rounded-t-3xl bg-background px-6 pt-8 pb-8">
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">Sign In</h2>
          <p className="text-sm text-muted-foreground">Access your civic dashboard</p>
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <Label htmlFor="mobile" className="text-sm font-semibold">Mobile Number</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">+91</span>
            <Input
              id="mobile"
              type="tel"
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                setErrors((er) => ({ ...er, mobile: "" }));
              }}
              className={`pl-12 ${errors.mobile ? "border-destructive" : ""}`}
            />
          </div>
          {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((er) => ({ ...er, password: "" }));
              }}
              maxLength={128}
              className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {/* Remember Me */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Signing in...
            </span>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>

        {/* Demo credentials */}
        <div className="rounded-xl border border-border bg-secondary/50 p-3 space-y-1">
          <p className="text-xs font-semibold text-foreground">Demo Accounts:</p>
          <p className="text-xs text-muted-foreground">
            Citizen: <span className="font-mono text-foreground">9876543210</span> / <span className="font-mono text-foreground">demo1234</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Official: <span className="font-mono text-foreground">9876543211</span> / <span className="font-mono text-foreground">official1234</span>
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;

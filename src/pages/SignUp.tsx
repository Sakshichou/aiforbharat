import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Eye, EyeOff, UserPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { UserRole } from "@/services/authService";

const PUNE_WARDS = [
  "Aundh-Baner (Ward 1)",
  "Kothrud (Ward 9)",
  "Shivajinagar (Ward 15)",
  "Hadapsar (Ward 20)",
  "Kondhwa (Ward 25)",
  "Bibwewadi (Ward 30)",
  "Sinhagad Road (Ward 35)",
  "Warje-Karvenagar (Ward 40)",
  "Yerwada (Ward 8)",
  "Viman Nagar (Ward 12)",
  "Pimpri (Ward 45)",
  "Chinchwad (Ward 50)",
];

const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    ward: "",
    role: "citizen" as UserRole,
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!form.ward) e.ward = "Select your ward/area";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await register({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      ward: form.ward,
      role: form.role,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Account created! Welcome to Civic-Trust.");
      navigate("/");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="navy-gradient px-6 pb-8 pt-12 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">Join Civic-Trust</h1>
        <p className="mt-1 text-sm text-primary-foreground/60">
          Create your verified citizen account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="-mt-4 flex-1 space-y-4 rounded-t-3xl bg-background px-6 pt-6 pb-8">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={100}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
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
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`pl-12 ${errors.mobile ? "border-destructive" : ""}`}
            />
          </div>
          {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
        </div>

        {/* Ward */}
        <div className="space-y-1.5">
          <Label htmlFor="ward" className="text-sm font-semibold">Ward / Area</Label>
          <div className="relative">
            <select
              id="ward"
              value={form.ward}
              onChange={(e) => update("ward", e.target.value)}
              className={`h-10 w-full appearance-none rounded-md border bg-background px-3 pr-8 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.ward ? "border-destructive" : "border-input"
              } ${!form.ward ? "text-muted-foreground" : "text-foreground"}`}
            >
              <option value="">Select your ward</option>
              {PUNE_WARDS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {errors.ward && <p className="text-xs text-destructive">{errors.ward}</p>}
        </div>

        {/* Role Toggle */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">I am a</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["citizen", "official"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => update("role", r)}
                className={`rounded-xl border-2 px-4 py-3 text-center transition-all ${
                  form.role === r
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="block text-sm font-bold capitalize">{r}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {r === "citizen" ? "Report issues" : "Verify resolutions"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            maxLength={128}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Creating account...
            </span>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;

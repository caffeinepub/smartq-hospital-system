import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Loader2, Stethoscope } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { hashPassword, useAuth } from "../contexts/AuthContext";
import { backend } from "../declarations/backend";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hash = await hashPassword(password);
      const result = await backend.login(email, hash, "doctor");
      if (result.__kind__ === "ok") {
        login({
          sessionToken: result.ok.sessionToken,
          userId: result.ok.userId,
          userName: result.ok.name,
          userRole: "doctor",
        });
        toast.success(`Welcome, ${result.ok.name}!`);
        navigate("/doctor/queue");
      } else {
        toast.error(result.err || "Login failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Doctor Login</CardTitle>
          <CardDescription>
            Access your patient queue and consultations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Demo:</strong> priya@smartq.com / doctor123
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="doctor@smartq.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-ocid="doctor_login.email_input"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-ocid="doctor_login.password_input"
              />
            </div>
            <Button
              type="submit"
              className="w-full hero-gradient text-white font-semibold py-5"
              disabled={loading}
              data-ocid="doctor_login.submit_button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {loading ? "Logging in..." : "Doctor Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

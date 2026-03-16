import { Button } from "@/components/ui/button";
import { Activity, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { backend } from "../declarations/backend";

export function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date()),
      );
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    if (user?.sessionToken) {
      await backend.logout(user.sessionToken).catch(() => {});
    }
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            SmartQ
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-mono hidden sm:block">
            {time} IST
          </span>

          {user && (
            <span className="text-sm font-medium hidden sm:block">
              {user.userName}
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            data-ocid="home.dark_mode_toggle"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-ocid="nav.logout_button"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

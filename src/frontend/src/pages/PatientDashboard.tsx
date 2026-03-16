import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CalendarPlus, FileText, Hash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Appointment } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../declarations/backend";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.sessionToken) return;
    backend
      .getMyAppointments(user.sessionToken)
      .then((result) => {
        if (result.__kind__ === "ok") setAppointments(result.ok);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const upcoming = appointments.filter((a) => a.status !== "completed");
  const completed = appointments.filter((a) => a.status === "completed");

  const statusColor = (s: string) =>
    s === "completed"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : s === "cancelled"
        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

  return (
    <div className="max-w-5xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Welcome, {user?.userName}!</h1>
        <p className="text-muted-foreground">
          Manage your appointments and health records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Upcoming",
            value: upcoming.length,
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Completed",
            value: completed.length,
            color: "from-green-500 to-teal-500",
          },
          {
            label: "Total",
            value: appointments.length,
            color: "from-purple-500 to-blue-500",
          },
          {
            label: "Paid",
            value: appointments.filter((a) => a.paymentStatus === "paid")
              .length,
            color: "from-yellow-500 to-orange-500",
          },
        ].map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="p-5">
              <div
                className={`text-3xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
              >
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/patient/book">
          <Button className="hero-gradient text-white font-semibold">
            <CalendarPlus className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        </Link>
        <Link to="/patient/records">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" /> View Records
          </Button>
        </Link>
      </div>

      {/* Appointments List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="appointments.empty_state"
            >
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No appointments yet. Book your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt, idx) => (
                <div
                  key={appt.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-secondary/50 border border-border"
                  data-ocid={`appointments.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center text-white font-bold text-sm">
                      <Hash className="w-4 h-4" />
                      {Number(appt.tokenNumber)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{appt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.department} · {appt.appointmentDate} ·{" "}
                        {appt.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(appt.status)}`}
                    >
                      {appt.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        appt.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {appt.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

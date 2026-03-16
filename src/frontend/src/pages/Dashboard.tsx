import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats, PatientRecord } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../declarations/backend";

const DEPT_COLORS = ["#0284c7", "#0d9488", "#7c3aed", "#ea580c", "#16a34a"];
const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [consultations, setConsultations] = useState<PatientRecord[]>([]);
  const [showPast, setShowPast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, c] = await Promise.all([
        backend.getDashboardStats(),
        user?.sessionToken
          ? backend.getAllConsultations(user.sessionToken)
          : Promise.resolve({ __kind__: "err" as const, err: "" }),
      ]);
      setStats(s);
      if (c.__kind__ === "ok") setConsultations(c.ok);
      setLoading(false);
    };
    load();
  }, [user]);

  const deptData = DEPARTMENTS.map((dept) => ({
    name: dept.substring(0, 6),
    patients: consultations.filter((c) => c.department === dept).length,
  }));

  const pieData = DEPARTMENTS.map((dept, i) => ({
    name: dept,
    value: Math.max(
      consultations.filter((c) => c.department === dept).length,
      1,
    ),
    color: DEPT_COLORS[i],
  }));

  const statCards = [
    {
      label: "Total Patients",
      value: stats ? Number(stats.patientCount) : 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Doctors",
      value: stats ? Number(stats.doctorCount) : 0,
      icon: Stethoscope,
      color: "from-teal-500 to-green-500",
    },
    {
      label: "Appointments",
      value: stats ? Number(stats.appointmentCount) : 0,
      icon: Calendar,
      color: "from-purple-500 to-blue-500",
    },
    {
      label: "Consultations",
      value: consultations.length,
      icon: CheckCircle,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hospital Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of SmartQ Hospital operations
          </p>
        </div>
        <Button
          onClick={() => setShowPast((p) => !p)}
          variant="outline"
          data-ocid="dashboard.view_past_patients_button"
        >
          {showPast ? (
            <ChevronUp className="w-4 h-4 mr-2" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-2" />
          )}
          {showPast ? "Hide" : "View"} Past Patients
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="glass-card card-hover">
            <CardContent className="p-5">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}
              >
                <s.icon className="w-5 h-5 text-white" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div
                  className={`text-3xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
                >
                  {s.value}
                </div>
              )}
              <div className="text-sm text-muted-foreground mt-1">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">
              Consultations by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={deptData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="patients" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, _index) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Past Patients Table */}
      {showPast && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Past Consultation Records</CardTitle>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="dashboard.consultations.empty_state"
              >
                No consultation records yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Diagnosis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultations.map((c, i) => (
                      <TableRow
                        key={c.id}
                        data-ocid={`dashboard.consultation.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {c.patientName}
                        </TableCell>
                        <TableCell>{c.doctorName}</TableCell>
                        <TableCell>{c.department}</TableCell>
                        <TableCell>{c.visitDate}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {c.diagnosis}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

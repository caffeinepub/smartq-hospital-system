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
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import type { PatientRecord } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../declarations/backend";

export default function PatientRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.sessionToken) return;
    backend
      .getPatientRecords(user.sessionToken)
      .then((r) => {
        if (r.__kind__ === "ok") setRecords(r.ok);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Consultation Records</h1>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Your Health History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="records.empty_state"
            >
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No consultation records yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Prescription</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={r.id} data-ocid={`records.item.${i + 1}`}>
                      <TableCell className="font-medium">
                        {r.visitDate}
                      </TableCell>
                      <TableCell>{r.doctorName}</TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {r.diagnosis}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {r.prescription}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {r.doctorNotes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

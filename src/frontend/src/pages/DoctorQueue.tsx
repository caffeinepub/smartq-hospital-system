import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, LayoutDashboard, Loader2, Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Appointment } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../declarations/backend";

function announce(token: number) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(
      `Token number ${token}, please proceed to consultation room.`,
    );
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}

export default function DoctorQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<number | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [consultForm, setConsultForm] = useState({
    diagnosis: "",
    prescription: "",
    doctorNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const fetchQueue = useCallback(async () => {
    if (!user?.sessionToken) return;
    const result = await backend.getQueue(user.sessionToken, today);
    if (result.__kind__ === "ok") {
      const sorted = [...result.ok].sort(
        (a, b) => Number(a.tokenNumber) - Number(b.tokenNumber),
      );
      setQueue(sorted);
      const nextScheduled = sorted.find((a) => a.status === "scheduled");
      if (nextScheduled) setCurrentToken(Number(nextScheduled.tokenNumber));
    }
    setLoading(false);
  }, [user, today]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleComplete = async () => {
    if (!selectedAppt || !user?.sessionToken) return;
    setSubmitting(true);
    try {
      const result = await backend.completeConsultation(
        user.sessionToken,
        selectedAppt.id,
        consultForm.diagnosis,
        consultForm.prescription,
        consultForm.doctorNotes,
      );
      if (result.__kind__ === "ok") {
        toast.success(
          `Token #${Number(selectedAppt.tokenNumber)} consultation completed`,
        );
        setSelectedAppt(null);
        setConsultForm({ diagnosis: "", prescription: "", doctorNotes: "" });
        await fetchQueue();
        // Announce next token
        const updated = await backend.getQueue(user.sessionToken, today);
        if (updated.__kind__ === "ok") {
          const next = updated.ok
            .filter((a) => a.status === "scheduled")
            .sort((a, b) => Number(a.tokenNumber) - Number(b.tokenNumber))[0];
          if (next) {
            setCurrentToken(Number(next.tokenNumber));
            announce(Number(next.tokenNumber));
          }
        }
      } else {
        toast.error(result.err || "Failed");
      }
    } catch {
      toast.error("Error completing consultation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Today's Queue</h1>
          <p className="text-muted-foreground">
            {user?.userName} · {today}
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </Link>
      </div>

      {/* Token Board */}
      <Card className="glass-card mb-8">
        <CardContent className="p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
            Now Serving
          </p>
          {currentToken ? (
            <>
              <div className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                TOKEN #{currentToken}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => currentToken && announce(currentToken)}
              >
                <Volume2 className="w-4 h-4 mr-2" /> Announce Again
              </Button>
            </>
          ) : (
            <div className="text-3xl text-muted-foreground font-semibold">
              No Active Tokens
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Patient Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="queue.empty_state"
            >
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="queue.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Token #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((appt, idx) => (
                    <TableRow key={appt.id} data-ocid={`queue.row.${idx + 1}`}>
                      <TableCell>
                        <span className="font-bold text-primary text-lg">
                          #{Number(appt.tokenNumber)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {appt.patientName}
                      </TableCell>
                      <TableCell>{appt.department}</TableCell>
                      <TableCell>{appt.timeSlot}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appt.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            appt.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }
                        >
                          {appt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appt.status === "scheduled" && (
                          <Button
                            size="sm"
                            className="hero-gradient text-white"
                            onClick={() => {
                              setSelectedAppt(appt);
                            }}
                            data-ocid={`queue.complete_button.${idx + 1}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Modal */}
      <Dialog
        open={!!selectedAppt}
        onOpenChange={(open) => !open && setSelectedAppt(null)}
      >
        <DialogContent
          className="glass-card"
          data-ocid="queue.consultation_modal"
        >
          <DialogHeader>
            <DialogTitle>
              Complete Consultation — Token #
              {selectedAppt && Number(selectedAppt.tokenNumber)}
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Patient:{" "}
                <span className="font-semibold text-foreground">
                  {selectedAppt.patientName}
                </span>
              </p>
              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <Textarea
                  placeholder="Enter diagnosis..."
                  value={consultForm.diagnosis}
                  onChange={(e) =>
                    setConsultForm((f) => ({ ...f, diagnosis: e.target.value }))
                  }
                  rows={3}
                  required
                  data-ocid="queue.diagnosis_textarea"
                />
              </div>
              <div className="space-y-2">
                <Label>Prescription</Label>
                <Textarea
                  placeholder="Medications and dosage..."
                  value={consultForm.prescription}
                  onChange={(e) =>
                    setConsultForm((f) => ({
                      ...f,
                      prescription: e.target.value,
                    }))
                  }
                  rows={3}
                  data-ocid="queue.prescription_textarea"
                />
              </div>
              <div className="space-y-2">
                <Label>Doctor Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={consultForm.doctorNotes}
                  onChange={(e) =>
                    setConsultForm((f) => ({
                      ...f,
                      doctorNotes: e.target.value,
                    }))
                  }
                  rows={2}
                  data-ocid="queue.notes_textarea"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAppt(null)}>
              Cancel
            </Button>
            <Button
              className="hero-gradient text-white"
              onClick={handleComplete}
              disabled={submitting || !consultForm.diagnosis.trim()}
              data-ocid="queue.submit_consultation_button"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {submitting ? "Saving..." : "Complete Consultation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  CheckCircle,
  CreditCard,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { backend } from "../declarations/backend";

const DOCTORS = [
  { name: "Dr. Priya Sharma", dept: "Cardiology" },
  { name: "Dr. Rajan Mehta", dept: "Neurology" },
  { name: "Dr. Anita Kapoor", dept: "Orthopedics" },
  { name: "Dr. Suresh Patel", dept: "Pediatrics" },
  { name: "Dr. Neha Singh", dept: "Dermatology" },
];

function getTimeSlots(
  selectedDate: string,
): { label: string; disabled: boolean }[] {
  const slots: { label: string; disabled: boolean }[] = [];
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  const nowIST = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(new Date())
      .replace(/(\d+):(\d+)/, (_, h, m) => `2000-01-01T${h}:${m}:00`),
  );

  for (let h = 9; h < 20; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) continue;
      const label = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(2000, 0, 1, h, m));
      let disabled = false;
      if (selectedDate === today) {
        const slotTime = new Date(2000, 0, 1, h, m);
        const nowTime = new Date(
          2000,
          0,
          1,
          nowIST.getHours(),
          nowIST.getMinutes(),
        );
        disabled = slotTime <= nowTime;
      }
      slots.push({ label, disabled });
    }
  }
  return slots;
}

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedToken, setBookedToken] = useState<number | null>(null);
  const [_bookedApptId, setBookedApptId] = useState("");

  const selectedDoctor = DOCTORS.find((d) => d.name === doctor);
  const minDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  const maxDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const slots = useMemo(() => (date ? getTimeSlots(date) : []), [date]);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !date || !timeSlot) {
      toast.error("Please fill all fields");
      return;
    }
    setShowPayment(true);
  };

  const handleUpiPay = () => {
    window.location.href =
      "upi://pay?pa=8620829679@upi&pn=SmartQHospital&am=200&cu=INR";
    setTimeout(() => setPaymentDone(true), 1500);
  };

  const handleConfirmBooking = async () => {
    if (!user?.sessionToken) return;
    setLoading(true);
    try {
      const bookResult = await backend.bookAppointment(
        user.sessionToken,
        doctor,
        selectedDoctor!.dept,
        date,
        timeSlot,
      );
      if (bookResult.__kind__ !== "ok") {
        toast.error(bookResult.err || "Booking failed");
        return;
      }
      const apptId = bookResult.ok.id;
      const tokenNum = Number(bookResult.ok.tokenNumber);
      setBookedApptId(apptId);

      const payResult = await backend.confirmPayment(user.sessionToken, apptId);
      if (payResult.__kind__ === "ok") {
        setBookedToken(tokenNum);
        toast.success(`Booking confirmed! Your token: #${tokenNum}`);
      } else {
        toast.error(payResult.err || "Payment confirmation failed");
      }
    } catch {
      toast.error("Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (bookedToken !== null) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md text-center">
          <CardContent className="p-10">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <div className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent my-6">
              Token #{bookedToken}
            </div>
            <p className="text-muted-foreground mb-2">{doctor}</p>
            <p className="text-muted-foreground mb-6">
              {date} · {timeSlot}
            </p>
            <Button
              onClick={() => navigate("/patient/dashboard")}
              className="hero-gradient text-white w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProceed} className="space-y-5">
            <div className="space-y-2">
              <Label>Select Doctor</Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger data-ocid="book.doctor_select">
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {DOCTORS.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name} — {d.dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDoctor && (
              <div className="p-3 bg-secondary/50 rounded-xl text-sm">
                Department:{" "}
                <span className="font-semibold text-primary">
                  {selectedDoctor.dept}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Appointment Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTimeSlot("");
                }}
                min={minDate}
                max={maxDate}
                required
                data-ocid="book.date_input"
              />
            </div>

            {date && (
              <div className="space-y-2">
                <Label>Time Slot (IST)</Label>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger data-ocid="book.time_slot_select">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {slots.map((s) => (
                      <SelectItem
                        key={s.label}
                        value={s.label}
                        disabled={s.disabled}
                      >
                        {s.label}
                        {s.disabled ? " (past)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full hero-gradient text-white font-semibold py-5"
              data-ocid="book.proceed_payment_button"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="glass-card" data-ocid="book.payment_modal">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Pay ₹200 via UPI to confirm your booking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                ₹200
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Consultation Fee
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Doctor:</span>{" "}
                <span className="font-medium">{doctor}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Date:</span>{" "}
                <span className="font-medium">{date}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Time:</span>{" "}
                <span className="font-medium">{timeSlot}</span>
              </p>
            </div>

            <Button
              onClick={handleUpiPay}
              className="w-full hero-gradient text-white font-semibold py-5"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Pay with UPI (GPay / PhonePe / Paytm)
            </Button>

            {paymentDone && (
              <Button
                onClick={handleConfirmBooking}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5"
                disabled={loading}
                data-ocid="book.payment_confirm_button"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {loading ? "Confirming..." : "I have completed the payment"}
              </Button>
            )}

            {!paymentDone && (
              <button
                type="button"
                className="w-full text-sm text-muted-foreground underline"
                onClick={() => setPaymentDone(true)}
              >
                Payment done? Click here to confirm
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

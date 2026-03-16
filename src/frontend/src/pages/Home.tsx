import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Baby,
  Bone,
  Brain,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Heart,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

const departments = [
  {
    name: "Cardiology",
    icon: Heart,
    desc: "Expert heart care with advanced diagnostics and interventional procedures.",
    color: "text-red-500",
  },
  {
    name: "Neurology",
    icon: Brain,
    desc: "Comprehensive brain and nervous system treatments by leading specialists.",
    color: "text-purple-500",
  },
  {
    name: "Orthopedics",
    icon: Bone,
    desc: "Complete bone, joint and muscle care from fractures to joint replacement.",
    color: "text-yellow-600",
  },
  {
    name: "Pediatrics",
    icon: Baby,
    desc: "Specialized medical care for infants, children and adolescents.",
    color: "text-blue-500",
  },
  {
    name: "Dermatology",
    icon: Sparkles,
    desc: "Advanced skin, hair and nail treatments with modern technology.",
    color: "text-teal-500",
  },
];

const doctors = [
  {
    name: "Dr. Priya Sharma",
    dept: "Cardiology",
    exp: "14 years",
    avatar: "PS",
    color: "from-red-400 to-pink-500",
  },
  {
    name: "Dr. Rajan Mehta",
    dept: "Neurology",
    exp: "12 years",
    avatar: "RM",
    color: "from-purple-400 to-indigo-500",
  },
  {
    name: "Dr. Anita Kapoor",
    dept: "Orthopedics",
    exp: "10 years",
    avatar: "AK",
    color: "from-yellow-400 to-orange-500",
  },
  {
    name: "Dr. Suresh Patel",
    dept: "Pediatrics",
    exp: "16 years",
    avatar: "SP",
    color: "from-blue-400 to-cyan-500",
  },
  {
    name: "Dr. Neha Singh",
    dept: "Dermatology",
    exp: "8 years",
    avatar: "NS",
    color: "from-teal-400 to-green-500",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "No More Waiting",
    desc: "Book appointments online and track your token in real-time.",
  },
  {
    icon: CreditCard,
    title: "Secure UPI Payment",
    desc: "Pay easily with Google Pay, PhonePe, Paytm or BHIM.",
  },
  {
    icon: FileText,
    title: "Digital Records",
    desc: "Access your complete consultation history anytime, anywhere.",
  },
  {
    icon: CheckCircle,
    title: "Real-time Tokens",
    desc: "Live token updates with voice announcements in the queue.",
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative hero-gradient text-white py-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background:
              "linear-gradient(135deg, #0369a1, #0284c7, #0891b2, #0d9488)",
            backgroundSize: "400% 400%",
          }}
        />

        {/* Floating circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full animate-float blur-xl" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300/20 rounded-full animate-float blur-2xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-300/20 rounded-full animate-float blur-lg"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now Serving Patients Online
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
            SmartQ
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-4 text-blue-100">
            Smart Queue. Seamless Care.
          </p>
          <p className="text-blue-200 mb-10 max-w-2xl mx-auto text-lg">
            Skip the waiting room. Book appointments, get your token number, and
            consult with top specialists — all from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/patient/login">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                data-ocid="home.patient_login_button"
              >
                <User className="w-5 h-5 mr-2" />
                Patient Login
              </Button>
            </Link>
            <Link to="/doctor/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-2xl transition-all duration-300 hover:scale-105"
                data-ocid="home.doctor_login_button"
              >
                Doctor Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Our Departments
            </h2>
            <p className="text-muted-foreground text-lg">
              Specialized care across multiple disciplines
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {departments.map((dept) => (
              <Card
                key={dept.name}
                className="glass-card card-hover cursor-default"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/40 dark:to-teal-900/40 flex items-center justify-center mx-auto mb-4">
                    <dept.icon className={`w-7 h-7 ${dept.color}`} />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dept.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50/80 to-teal-50/80 dark:from-slate-800/50 dark:to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Our Specialists
            </h2>
            <p className="text-muted-foreground text-lg">
              Experienced doctors dedicated to your health
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {doctors.map((doc) => (
              <Card
                key={doc.name}
                className="glass-card card-hover text-center"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${doc.color} flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg`}
                  >
                    {doc.avatar}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{doc.name}</h3>
                  <p className="text-xs text-primary font-medium mb-1">
                    {doc.dept}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.exp} experience
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why SmartQ?</h2>
            <p className="text-muted-foreground text-lg">
              Modern healthcare management at your fingertips
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <Card key={b.title} className="glass-card card-hover">
                <CardContent className="p-7">
                  <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center mb-4">
                    <b.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 hero-gradient text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to experience smarter healthcare?
        </h2>
        <p className="mb-8 text-blue-100 text-lg">
          Register now and book your first appointment in minutes.
        </p>
        <Link to="/patient/register">
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-10 py-6 text-lg rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
          >
            Get Started Free
          </Button>
        </Link>
      </section>
    </div>
  );
}

import { Button } from "./ui/button";
import { ArrowRight, Shield, Activity, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 lg:py-10">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-glow opacity-30 animate-pulse" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] animate-[gridMove_10s_linear_infinite]" />
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl mx-auto space-y-10"
        >
          {/* Main Hero Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-md hover:shadow-lg transition-all duration-300">
              <Shield className="h-4 w-4 text-primary mr-2 animate-bounce" />
              <span className="text-sm font-medium text-primary">NAMASTE-ICD Integration</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Modern Healthcare with{" "}
              <span style={{ color: "#7BEDFC" }}>Swastha</span>
              <span style={{ color: "#95FFAE", marginLeft: "0.25rem" }}>Link</span>
              <span className="ml-2 gradient-medical bg-clip-text animate-gradient">
                Dual Coding
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Seamlessly integrate NAMASTE and ICD-11 coding systems for universal healthcare communication
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Shield className="h-6 w-6 text-primary-foreground" />,
                title: "NAMASTE Integration",
                desc: "Indian Healthcare Standards",
              },
              {
                icon: <Activity className="h-6 w-6 text-primary-foreground" />,
                title: "Dual Coding",
                desc: "NAMASTE ↔ ICD-11 mapping",
              },
              {
                icon: <Users className="h-6 w-6 text-primary-foreground" />,
                title: "Multi-Role Access",
                desc: "Doctors, patients, admins",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center space-y-3 p-6 rounded-xl bg-card/60 border border-border/50 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 gradient-medical rounded-xl flex items-center justify-center shadow-glow animate-pulse">
                  {item.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <Button
              onClick={() => navigate("/terminology")}
              size="lg"
              className="gradient-medical text-primary-foreground font-semibold shadow-glow hover:shadow-green-glow transition-transform hover:scale-105 text-lg px-8 py-4"
            >
              🚀 Try Live Demo
              <ArrowRight className="h-5 w-5 ml-2 animate-moveRight" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
              className="text-lg px-8 py-4 border-primary/20 hover:bg-primary/10 hover:scale-105 transition-transform"
            >
              Doctor Dashboard
            </Button>
          </motion.div>

          {/* Stats - NAMASTE FHIR Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-border/20"
          >
            {[
              { value: "150+", label: "AYUSH Concepts", color: "text-green-500" },
              { value: "5", label: "Traditional Systems", color: "text-blue-500" },
              { value: "4", label: "FHIR CodeSystems", color: "text-purple-500" },
              { value: "100%", label: "ICD-11 Mapping", color: "text-orange-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                className="text-center"
              >
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

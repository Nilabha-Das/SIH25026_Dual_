import { Card, CardContent } from "./ui/card";
import { Shield, Activity, Users, Database, Clock, Lock } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: Shield,
      title: "NAMASTE Integration",
      description:
        "Connect with Indian healthcare standards using NAMASTE coding system",
    },
    {
      icon: Activity,
      title: "ICD-11 Support",
      description: "Map to international standards with WHO ICD-11 codes",
    },
    {
      icon: Users,
      title: "Multi-User Platform",
      description:
        "Support for healthcare providers, administrators, and patients",
    },
    {
      icon: Database,
      title: "Dual Coding System",
      description: "Seamless mapping between NAMASTE and ICD-11 codes",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Instant code mapping and validation for accuracy",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      description: "Enterprise-grade security for healthcare data",
    },
  ];

  return (
    <section id="services" className="py-16 relative overflow-hidden">
      {/* floating dots background effect */}
      <div className="absolute inset-0 -z-10">
        <span className="absolute w-3 h-3 bg-primary/30 rounded-full top-10 left-10 animate-dotFloat"></span>
        <span className="absolute w-4 h-4 bg-primary/20 rounded-full bottom-20 right-16 animate-dotFloat"></span>
        <span className="absolute w-2 h-2 bg-primary/40 rounded-full top-1/3 right-1/4 animate-dotFloat"></span>
      </div>

      <div className="container mx-auto px-4">
        {/* section heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent mb-4 animate-fade-in">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in [animation-delay:200ms]">
            Our platform provides a complete suite of tools for healthcare coding
            and management
          </p>
        </div>

        {/* services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group bg-card/50 border-border/50 
                hover:bg-card/80 hover:border-primary/40 
                transition-all duration-500 ease-out 
                hover:shadow-xl hover:shadow-primary/10 
                relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* glowing gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="p-6 space-y-4 relative">
                  {/* icon wrapper */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center 
                  bg-gradient-to-tr from-primary to-primary/70 
                  text-white shadow-lg shadow-primary/30 
                  group-hover:scale-110 group-hover:animate-pulse-glow 
                  transition-transform duration-500 ease-out"
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* title */}
                  <h3
                    className="text-xl font-semibold text-foreground 
                  group-hover:text-primary transition-colors duration-300"
                  >
                    {service.title}
                  </h3>

                  {/* description */}
                  <p
                    className="text-muted-foreground leading-relaxed 
                  group-hover:text-foreground/90 transition-colors duration-300"
                  >
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

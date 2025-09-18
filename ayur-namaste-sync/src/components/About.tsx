import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { CheckCircle, ArrowRight, Heart, Globe, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function About() {
  const navigate = useNavigate();

  const benefits = [
    "Universal healthcare communication through standardized coding",
    "Reduced medical errors with dual coding validation",
    "Seamless integration across healthcare institutions",
    "Real-time health analytics and population insights",
    "Enhanced patient privacy protocols",
    "Streamlined consultation and treatment workflows",
  ];

  const stats = [
    { icon: Heart, value: "Healthcare", label: "First Priority" },
    { icon: Globe, value: "Universal", label: "Accessibility" },
    { icon: Zap, value: "Real-time", label: "Processing" },
  ];

  return (
    <section id="about" className="py-16 relative overflow-hidden">
      {/* Floating animated dots */}
      <div className="absolute inset-0 -z-10">
        <span className="absolute w-3 h-3 bg-primary/30 rounded-full top-12 left-12 animate-dotFloat"></span>
        <span className="absolute w-4 h-4 bg-secondary/30 rounded-full bottom-24 right-20 animate-dotFloat"></span>
        <span className="absolute w-2 h-2 bg-primary/40 rounded-full top-1/2 right-1/3 animate-dotFloat"></span>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 animate-slide-in-right">
                Transforming Healthcare with Dual Coding
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed animate-fade-in [animation-delay:200ms]">
                Our platform bridges the gap between Indian and international
                healthcare standards, making medical communication more
                efficient and accurate than ever before.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0 animate-pulse-glow" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => navigate("/AbhaRegistration")}
              size="lg"
              className="gradient-medical text-primary-foreground font-semibold shadow-glow hover:shadow-green-glow transition-transform duration-500 hover:scale-105 animate-fade-in [animation-delay:800ms]"
            >
              Join Our Platform
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Content */}
          <div className="space-y-8 animate-fade-in [animation-delay:400ms]">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="text-center p-6 bg-card/80 border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-500 hover:scale-105"
                >
                  <CardContent className="space-y-3 p-0">
                    <div className="w-12 h-12 gradient-medical rounded-xl flex items-center justify-center shadow-glow mx-auto group-hover:animate-pulse-glow transition-transform duration-500">
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Card */}
            <Card className="bg-card/80 border-border/50 hover:shadow-xl hover:border-secondary/40 transition-all duration-500 animate-fade-in [animation-delay:700ms]">
              <CardContent className="p-6 space-y-6">
                <div className="w-12 h-12 gradient-medical rounded-xl flex items-center justify-center shadow-glow animate-pulse-glow">
                  <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Global Standards, Local Implementation
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our dual coding system ensures perfect harmony between
                    NAMASTE and ICD-11 standards, creating a unified healthcare
                    ecosystem.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary animate-fade-in">
                      NAMASTE
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Indian Standard
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary animate-fade-in [animation-delay:300ms]">
                      ICD-11
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Global Standard
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

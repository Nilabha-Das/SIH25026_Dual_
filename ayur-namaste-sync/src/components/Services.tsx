import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Shield, Activity, Users, Database, Clock, Lock, Code, Network, ExternalLink, ArrowRight } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: Shield,
      title: "FHIR R4 Compliant",
      description:
        "Complete FHIR R4 implementation with CodeSystems and ConceptMaps for international interoperability",
      highlight: "✅ SIH 2025",
      badge: "New"
    },
    {
      icon: Activity,
      title: "NAMASTE-ICD11 Dual Coding",
      description: "Bidirectional mapping between traditional AYUSH medicine and WHO ICD-11 standards with 150+ verified concepts",
      highlight: "🎯 Core Feature",
      badge: "Live"
    },
    {
      icon: Code,
      title: "Terminology Microservice",
      description: "Production-ready REST API with 15+ endpoints supporting $lookup, $validate-code, and $translate operations",
      highlight: "🚀 Ready",
      badge: "API"
    },
    {
      icon: Network,
      title: "Three-Layer Architecture",
      description: "NAMASTE → TM2 → ICD-11 mapping with semantic search and confidence scoring for accuracy",
      highlight: "⚡ Smart",
      badge: "AI"
    },
    {
      icon: Database,
      title: "150+ Medical Concepts",
      description: "Comprehensive coverage across Ayurveda, Yoga, Unani, Siddha, and Homeopathy systems",
      highlight: "📊 Complete",
      badge: "Data"
    },
    {
      icon: Users,
      title: "Interactive Dashboard",
      description: "Live terminology search, dual-coding visualization, and real-time statistics for healthcare providers",
      highlight: "🎨 Demo Ready",
      badge: "UI"
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
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-6">
          <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20 animate-fade-in">
            🏆 SIH 2025 Challenge 25026 - FHIR Terminology System
          </Badge>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent mb-4 animate-fade-in">
            NAMASTE FHIR Terminology Infrastructure
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in [animation-delay:200ms]">
            Production-ready FHIR R4-compliant terminology micro-service bridging traditional AYUSH medicine 
            with international healthcare standards. <strong>150 verified concepts</strong> across 
            <strong>5 AYUSH systems</strong> with comprehensive <strong>ICD-11 dual-coding</strong>.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in [animation-delay:400ms]">
            <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-6">
              <a href="/terminology">
                🚀 Live Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/login">
                Try Dashboard
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
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
                  {/* badge and icon wrapper */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center 
                    bg-gradient-to-tr from-primary to-primary/70 
                    text-white shadow-lg shadow-primary/30 
                    group-hover:scale-110 group-hover:animate-pulse-glow 
                    transition-transform duration-500 ease-out"
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                    >
                      {service.badge}
                    </Badge>
                  </div>

                  {/* title with highlight */}
                  <div className="space-y-2">
                    <h3
                      className="text-xl font-semibold text-foreground 
                    group-hover:text-primary transition-colors duration-300"
                    >
                      {service.title}
                    </h3>
                    
                    <div className="text-sm font-medium text-primary/80">
                      {service.highlight}
                    </div>
                  </div>

                  {/* description */}
                  <p
                    className="text-muted-foreground leading-relaxed text-sm
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

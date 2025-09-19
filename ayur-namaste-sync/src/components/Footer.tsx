import { Shield, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const footerLinks = {
    "Platform": [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Patients", href: "/patients" },
      { name: "Codes", href: "/codes" },
      { name: "Analytics", href: "/analytics" }
    ],
    "Resources": [
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Support Center", href: "#" },
      { name: "Status Page", href: "#" }
    ],
    "Company": [
      { name: "About Us", href: "#about" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Contact", href: "#consultation" }
    ]
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-card/50 border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-medical rounded-xl flex items-center justify-center shadow-glow">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">NAMASTE-ICD</div>
                <div className="text-xs text-muted-foreground">Healthcare System</div>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Transforming healthcare communication with dual coding system integration and comprehensive
              medical standard mapping.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@namaste-icd.org</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 123-456-7890</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 NAMASTE-ICD Healthcare System. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="border-primary/20 hover:bg-primary/10"
              >
                Healthcare Portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
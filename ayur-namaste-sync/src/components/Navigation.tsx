import { useState, useEffect } from "react";
import {
  Menu,
  Shield,
  LogIn,
  UserPlus,
  ChevronDown,
  Heart,
  Cpu,
  Github,
  MessageCircle,
  Database,
  X,
  Code
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navigation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  const navItems = [
    { name: "Home", href: "/" },
    {
      name: "Services",
      href: "#",
      dropdown: [
        { name: "ABHA Login", href: "/login", icon: Heart },
        { name: "Live Demo", href: "/terminology", icon: Code },
        { name: "API", href: "/api", icon: Cpu }
      ]
    },
    {
      name: "Resources",
      href: "#",
      dropdown: [
        { name: "NAMASTE", href: "https://www.india.gov.in/content/namaste-portal", icon: Heart },
        { name: "WHO ICD-11", href: "https://icd.who.int/docs/icd-api/APIDoc-Version2/", icon: Database },
        { name: "Github", href: "https://github.com", icon: Github },
        { name: "Support", href: "/support", icon: MessageCircle }
      ]
    },
    { name: "Terminology", href: "/terminology" },
    { name: "Docs", href: "/docs" },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      navigate(href);
    }
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const handleMouseEnter = (itemName: string) => {
    // Clear any existing timeout
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    
    const item = navItems.find(nav => nav.name === itemName);
    if (item?.dropdown) {
      setActiveDropdown(itemName);
    }
  };

  const handleMouseLeave = () => {
    // Add a delay before hiding the dropdown to make it easier to navigate
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms delay before hiding
    
    setDropdownTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    // Clear timeout when mouse enters dropdown
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    // Hide dropdown immediately when mouse leaves dropdown area
    setActiveDropdown(null);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50 shadow-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 overflow-hidden bg-white">
              <img
                src="/logo.jpg"
                alt="SwasthaLink Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xl font-bold text-white">SwasthaLink</div>
              <div className="text-sm text-gray-400">Healthcare System</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center space-x-1 text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium py-2 px-3 rounded-lg hover:bg-gray-800/50"
                >
                  <span>{item.name}</span>
                  {item.dropdown && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === item.name ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.dropdown && activeDropdown === item.name && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 py-2 opacity-100 visible transition-all duration-500 transform translate-y-0 z-50"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {item.dropdown.map((dropdownItem, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToSection(dropdownItem.href)}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <dropdownItem.icon className="h-5 w-5 text-cyan-400" />
                        <span>{dropdownItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollToSection("/login")}
              className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800/50 font-medium px-6 py-2.5 rounded-lg transition-all duration-300"
            >
              <LogIn className="h-4 w-4" />
              <span>ABHA Sign in</span>
            </button>

            <a
              href="#about"
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <UserPlus className="h-4 w-4" />
              <span>Get Started</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-800/50 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      NAMASTE-ICD
                    </div>
                    <div className="text-xs text-gray-400">
                      Healthcare System
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {navItems.map((item) => (
                  <div key={item.name} className="space-y-3">
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="text-left text-lg text-gray-300 hover:text-cyan-400 font-medium py-2 transition-colors duration-300"
                    >
                      {item.name}
                    </button>
                    {item.dropdown && (
                      <div className="ml-4 space-y-2">
                        {item.dropdown.map((dropdownItem, index) => (
                          <button
                            key={index}
                            onClick={() => scrollToSection(dropdownItem.href)}
                            className="flex items-center space-x-3 text-gray-400 hover:text-white py-2 transition-colors duration-300"
                          >
                            <dropdownItem.icon className="h-4 w-4 text-cyan-400" />
                            <span>{dropdownItem.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Actions */}
              <div className="p-6 space-y-4 border-t border-gray-800">
                <button
                  onClick={() => scrollToSection("/login")}
                  className="flex items-center justify-center space-x-2 w-full border border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white py-3 rounded-lg transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg shadow-lg shadow-cyan-500/25 transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Get Started</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

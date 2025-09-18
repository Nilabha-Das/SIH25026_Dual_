import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import {
  Home,
  UserPlus,
  FileText,
  Users,
  Settings,
  Stethoscope,
  Heart,
  Search,
  ClipboardList
} from 'lucide-react';
import { SearchBar } from './SearchBar';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[];
}

const patientNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'My Records', url: '/patient/records', icon: FileText },
  { title: 'Prescriptions', url: '/patient/prescriptions', icon: ClipboardList }
];

const doctorNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/doctor', icon: Stethoscope },
  { title: 'New Patient', url: '/doctor/new', icon: UserPlus },
  { title: 'Patient Search', url: '/doctor/search', icon: Search },
  { title: 'My Patients', url: '/doctor/patients', icon: Users }
];

const curatorNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/curator', icon: Home },
  { title: 'Mappings', url: '/curator/mappings', icon: FileText },
  { title: 'Reviews', url: '/curator/reviews', icon: ClipboardList }
];

interface AppSidebarProps {
  userRole: 'patient' | 'doctor' | 'curator';
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavItems = () => {
    switch (userRole) {
      case 'patient': return patientNavItems;
      case 'doctor': return doctorNavItems;
      case 'curator': return curatorNavItems;
      default: return [];
    }
  };

  const navItems = getNavItems();
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={`border-r border-sidebar-border bg-sidebar ${collapsed ? 'w-14' : 'w-64'}`}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">AYUSH EMR</h2>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{userRole} Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar for Doctor */}
        {userRole === 'doctor' && !collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <SearchBar placeholder="Search patients..." />
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                  <Settings className="w-5 h-5" />
                  {!collapsed && <span>Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
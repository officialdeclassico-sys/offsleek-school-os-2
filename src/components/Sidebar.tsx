import React from 'react';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Bus,
  CalendarCheck,
  CreditCard,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserPlus,
  Users2,
  X,
} from 'lucide-react';
import { OffsleekLogo } from './OffsleekLogo';

export type NavigationModule =
  | 'dashboard'
  | 'students'
  | 'admissions'
  | 'attendance'
  | 'fees'
  | 'academics'
  | 'examinations'
  | 'staff'
  | 'communication'
  | 'documents'
  | 'transport'
  | 'library'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeModule: NavigationModule;
  onSelectModule: (module: NavigationModule) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'admissions', label: 'Admissions', icon: UserPlus },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
  { id: 'academics', label: 'Academics', icon: BookOpen },
  { id: 'examinations', label: 'Examinations', icon: Award },
  { id: 'staff', label: 'Staff', icon: Users2 },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileCheck },
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'library', label: 'Library', icon: BookMarked },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-neutral-200/90 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header with Original OFFSLEEK Logo */}
        <div className="h-16 px-6 border-b border-neutral-200/90 flex items-center justify-between">
          <OffsleekLogo size="sm" />
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 select-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-700 hover:text-black hover:bg-neutral-100/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white stroke-[2.2]' : 'text-neutral-600 stroke-[1.8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom subtle copyright note inside sidebar */}
        <div className="p-4 border-t border-neutral-100 text-[10px] text-neutral-400 text-center font-medium">
          OFFSLEEK School OS v2.4
        </div>
      </aside>
    </>
  );
};

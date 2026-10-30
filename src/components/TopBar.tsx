import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useSchoolData } from '../data/schoolContext';
import { OffsleekLogo } from './OffsleekLogo';
import { formatRelativeTime, useRelativeTimeNow } from '../utils/dateTime';

interface TopBarProps {
  onToggleSidebarMobile: () => void;
  onOpenSearch: () => void;
  onSignOut: () => void;
  onNavigate: (module: string) => void;
  activeModule: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebarMobile,
  onOpenSearch,
  onSignOut,
  onNavigate,
  activeModule,
}) => {
  const {
    schoolInfo,
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
    announcements,
  } = useSchoolData();

  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const relativeNowMs = useRelativeTimeNow();

  return (
    <header className="h-16 bg-white border-b border-neutral-200/90 flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 z-30 sticky top-0 w-full shrink-0">
      
      {/* Left zone: Logo on mobile & School Name with Academic Year */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo on mobile/tablet */}
        <div className="lg:hidden">
          <OffsleekLogo size="sm" />
        </div>

        {/* Active School Name and Academic Year Selector */}
        <div className="hidden sm:flex flex-col">
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight leading-tight uppercase font-sans">
            {schoolInfo.name}
          </h2>

          <div className="relative">
            <button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors mt-0.5 cursor-pointer"
            >
              <span>Academic Year {selectedAcademicYear}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Academic Year Selector Dropdown */}
            {isYearDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsYearDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg z-40 py-1 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Switch Session
                  </div>
                  {academicYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedAcademicYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                        selectedAcademicYear === year ? 'font-bold text-neutral-900 bg-neutral-50' : 'text-neutral-600'
                      }`}
                    >
                      <span>Academic Year {year}</span>
                      {selectedAcademicYear === year && (
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right zone: Global Search, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Global Search Bar (opens full global search modal) */}
        <div
          onClick={onOpenSearch}
          className="relative hidden md:flex items-center w-64 lg:w-72 px-3 py-1.5 bg-neutral-50 border border-neutral-200/90 rounded-xl text-xs text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 cursor-pointer transition-colors shadow-2xs"
        >
          <Search className="w-4 h-4 text-neutral-400 mr-2.5 shrink-0" />
          <span className="truncate">Search students, staff, fees, etc...</span>
          <span className="ml-auto text-[10px] font-mono bg-neutral-200/70 text-neutral-600 px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center leading-none">
              3
            </span>
          </button>

          {isNotificationOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsNotificationOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-2xl shadow-xl z-40 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 mb-2">
                  <h4 className="text-xs font-bold text-neutral-900">Notifications</h4>
                  <span className="text-[10px] text-neutral-400">3 unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-neutral-50">
                  {announcements.slice(0, 3).map((a) => (
                    <div key={a.id} className="pt-2 text-xs">
                      <span className="font-semibold text-neutral-900 block">{a.title}</span>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{a.content}</p>
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        {formatRelativeTime(a.publishedAt, relativeNowMs)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-neutral-100 mt-2 text-center">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false);
                      onNavigate('communication');
                    }}
                    className="text-[11px] font-semibold text-neutral-900 hover:underline cursor-pointer"
                  >
                    View all announcements
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-6 bg-neutral-200 hidden sm:block" />

        {/* User Profile Lockup & Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer select-none text-left"
          >
            {/* "AD" Dark Avatar Circle matching reference image */}
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              AD
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-neutral-900 leading-tight">Admin</span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                <span>School Administrator</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl z-40 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-neutral-100">
                  <span className="font-bold text-neutral-900 block">Administrator Account</span>
                  <span className="text-[11px] text-neutral-400 truncate block">admin@riverdale.edu</span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>School Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('staff');
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Admin Directory</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out of School OS</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

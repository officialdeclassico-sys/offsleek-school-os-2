import React, { useState } from 'react';
import { Sidebar, NavigationModule } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalSearchModal } from './modals/GlobalSearchModal';

// Modules
import { DashboardHome } from './modules/DashboardHome';
import { StudentsModule } from './modules/StudentsModule';
import { AdmissionsModule } from './modules/AdmissionsModule';
import { AttendanceModule } from './modules/AttendanceModule';
import { FeesModule } from './modules/FeesModule';
import { AcademicsModule } from './modules/AcademicsModule';
import { ExaminationsModule } from './modules/ExaminationsModule';
import { StaffModule } from './modules/StaffModule';
import { CommunicationModule } from './modules/CommunicationModule';
import { DocumentsModule } from './modules/DocumentsModule';
import { TransportModule } from './modules/TransportModule';
import { LibraryModule } from './modules/LibraryModule';
import { ReportsModule } from './modules/ReportsModule';
import { SettingsModule } from './modules/SettingsModule';

interface DashboardProps {
  userEmail: string;
  onSignOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userEmail, onSignOut }) => {
  const [activeModule, setActiveModule] = useState<NavigationModule>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-neutral-50/60 text-neutral-900 font-sans antialiased select-none">
      
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex min-h-0 h-screen w-full min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* Top Bar with School Name, Year, Search, Notifications & User */}
        <TopBar
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          onSignOut={onSignOut}
          onNavigate={(mod) => setActiveModule(mod as NavigationModule)}
          activeModule={activeModule}
        />

        {/* Scrollable Workspace Container: Uses full available width between sidebar and right edge */}
        <main className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="w-full min-w-0 space-y-6">
            {activeModule === 'dashboard' && (
              <DashboardHome onNavigate={(mod) => setActiveModule(mod as NavigationModule)} />
            )}
            {activeModule === 'students' && <StudentsModule />}
            {activeModule === 'admissions' && <AdmissionsModule />}
            {activeModule === 'attendance' && <AttendanceModule />}
            {activeModule === 'fees' && <FeesModule />}
            {activeModule === 'academics' && <AcademicsModule />}
            {activeModule === 'examinations' && <ExaminationsModule />}
            {activeModule === 'staff' && <StaffModule />}
            {activeModule === 'communication' && <CommunicationModule />}
            {activeModule === 'documents' && <DocumentsModule />}
            {activeModule === 'transport' && <TransportModule />}
            {activeModule === 'library' && <LibraryModule />}
            {activeModule === 'reports' && <ReportsModule />}
            {activeModule === 'settings' && <SettingsModule />}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={(mod) => setActiveModule(mod as NavigationModule)}
      />

    </div>
  );
};

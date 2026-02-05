import React from 'react';
import { Home, CirclePlay, Cog, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigation, Page } from '../store';
import SidebarButton from './SidebarButton';

export default function Sidebar() {
  const { currentPage, setPage, isSidebarCollapsed, toggleSidebar } = useNavigation();

  const navItems: { page: Page; icon: React.ReactNode; label: string }[] = [
    { page: 'home', icon: <Home size={20} strokeWidth={2} />, label: 'Home' },
    { page: 'test', icon: <CirclePlay size={20} strokeWidth={2} />, label: 'Start Test' },
    { page: 'settings', icon: <Cog size={20} strokeWidth={2} />, label: 'Settings' },
    { page: 'about', icon: <Info size={20} strokeWidth={2} />, label: 'About' },
  ];

  return (
    <aside
      className={`
        bg-sidebar-bg backdrop-blur-sm text-sidebar-fg transition-all duration-300
        flex flex-col h-screen border-r border-sidebar-border
        ${isSidebarCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo and Collapse Toggle */}
      <div className={`
        p-4 border-b border-sidebar-border flex items-center justify-center relative
        ${isSidebarCollapsed ? 'py-4' : ''}
      `}>
        {isSidebarCollapsed ? (
          <span className="text-2xl font-bold text-primary">F</span>
        ) : (
          <span className="text-xl font-bold">F.O.C.U.S. Assessment</span>
        )}
        
        {/* Collapse Toggle - Round, hanging on edge, primary color */}
        <button
          onClick={toggleSidebar}
          className="absolute right-0 translate-x-1/2 w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={20} strokeWidth={2} /> : <ChevronLeft size={20} strokeWidth={2} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 items-stretch">
        {navItems.map((item) => (
          <SidebarButton
            key={item.page}
            icon={item.icon}
            label={item.label}
            isActive={currentPage === item.page}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setPage(item.page)}
          />
        ))}
      </nav>
    </aside>
  );
}

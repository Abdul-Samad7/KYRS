import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboardIcon, 
  DatabaseIcon, 
  MessageSquareIcon, 
  UploadIcon,
  MenuIcon,
  XIcon,
  SparklesIcon
} from 'lucide-react';
import StarfieldBackground from './StarfieldBackground';

interface ScientificLayoutProps {
  children: React.ReactNode;
}

const ScientificLayout: React.FC<ScientificLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
    { name: 'Data Explorer', href: '/explorer', icon: DatabaseIcon },
    { name: 'Ask Analysis', href: '/ask', icon: MessageSquareIcon },
    { name: 'Upload Data', href: '/upload', icon: UploadIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative">
      {/* Cosmic Starfield Background */}
      <StarfieldBackground />
      
      {/* Content with higher z-index */}
      <div className="relative z-10">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/80 backdrop-blur-xl border-r border-blue-500/20 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.1)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <SparklesIcon className="h-6 w-6 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-blue-400/30"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                ExoExplorer
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 hover:backdrop-blur'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <p>Powered by Gemini 2.5 Flash</p>
              <p className="mt-1">NASA Kepler Data • 9,564 Objects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-gray-900/50 backdrop-blur-xl border-b border-blue-500/20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-gray-400">API Connected</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
    </div>
  );
};

export default ScientificLayout;
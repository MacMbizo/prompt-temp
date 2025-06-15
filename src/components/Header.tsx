
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, BarChart3, Brain, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigationItems = [
    { path: '/', label: 'Prompts', icon: Home },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/automation', label: 'AI Automation', icon: Brain }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PromptVault
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  onClick={() => navigate(path)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex items-center space-x-4 overflow-x-auto">
          {navigationItems.map(({ path, label, icon: Icon }) => (
            <Button
              key={path}
              variant={location.pathname === path ? "default" : "ghost"}
              onClick={() => navigate(path)}
              size="sm"
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
};

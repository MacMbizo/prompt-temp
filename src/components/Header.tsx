
import { Button } from '@/components/ui/button';
import { book } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Prompt Library</h1>
              <p className="text-sm text-gray-500">AI Prompt Management</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Categories
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Settings
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

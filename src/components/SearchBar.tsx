
import { Input } from '@/components/ui/input';
import { search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ searchQuery, onSearchChange, placeholder = "Search..." }: SearchBarProps) => {
  return (
    <div className="relative">
      <search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 shadow-sm bg-white/80 backdrop-blur-sm"
      />
    </div>
  );
};

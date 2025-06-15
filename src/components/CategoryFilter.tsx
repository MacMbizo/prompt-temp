
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const getCategoryIcon = (category: string) => {
  const icons = {
    'All': '📋',
    'Writing & Content': '✍️',
    'Programming & Development': '💻',
    'System Prompts': '⚙️',
    'Data Science & Analytics': '📊',
    'Image Generation': '🎨',
    'Marketing & Sales': '📢',
    'Business Strategy': '💼',
    'Education & Learning': '🎓',
    'Creative & Storytelling': '🎭',
    'Code Review & Debugging': '🔍',
    'API Documentation': '📚',
    'Research & Analysis': '🔬',
    'Customer Support': '🎧',
    'Social Media': '📱',
    // Legacy mappings for backward compatibility
    'Writing': '✍️',
    'Programming': '💻',
    'Data Science': '📊',
    'Marketing': '📢',
    'Business': '💼',
    'Education': '🎓',
    'Creative': '🎭',
    'Code Review': '🔍',
  };
  return icons[category as keyof typeof icons] || '📝';
};

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              className={`w-full justify-start text-left transition-all duration-200 min-h-[44px] h-auto py-2 px-3 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'hover:bg-purple-50 hover:text-purple-700 text-gray-600'
              }`}
              onClick={() => onCategoryChange(category)}
            >
              <span className="mr-3 text-lg flex-shrink-0">{getCategoryIcon(category)}</span>
              <span className="font-medium text-sm leading-tight whitespace-normal text-left break-words">
                {category}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

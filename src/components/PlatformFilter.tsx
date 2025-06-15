
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlatformFilterProps {
  platforms: string[];
  selectedPlatforms: string[];
  onPlatformToggle: (platform: string) => void;
  onClearAll: () => void;
}

const getPlatformIcon = (platform: string) => {
  const icons = {
    'ChatGPT': '🤖',
    'Claude': '🧠',
    'Gemini': '♊',
    'Midjourney': '🎨',
    'DALL-E': '🖼️',
    'Stable Diffusion': '🌈',
    'GPT-4': '⚡',
    'Perplexity': '🔍',
    'GitHub Copilot': '💻',
    'Notion AI': '📝',
  };
  return icons[platform as keyof typeof icons] || '🔧';
};

const getPlatformColor = (platform: string) => {
  const colors = {
    'ChatGPT': 'bg-green-100 text-green-800 border-green-300',
    'Claude': 'bg-orange-100 text-orange-800 border-orange-300',
    'Gemini': 'bg-blue-100 text-blue-800 border-blue-300',
    'Midjourney': 'bg-purple-100 text-purple-800 border-purple-300',
    'DALL-E': 'bg-pink-100 text-pink-800 border-pink-300',
    'Stable Diffusion': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'GPT-4': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Perplexity': 'bg-teal-100 text-teal-800 border-teal-300',
    'GitHub Copilot': 'bg-gray-100 text-gray-800 border-gray-300',
    'Notion AI': 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const PlatformFilter = ({ platforms, selectedPlatforms, onPlatformToggle, onClearAll }: PlatformFilterProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">AI Platforms</CardTitle>
          {selectedPlatforms.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform);
            return (
              <Badge
                key={platform}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent' 
                    : `${getPlatformColor(platform)} hover:shadow-md`
                }`}
                onClick={() => onPlatformToggle(platform)}
              >
                <span className="mr-1">{getPlatformIcon(platform)}</span>
                {platform}
              </Badge>
            );
          })}
        </div>
        {selectedPlatforms.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Selected platforms:</p>
            <div className="flex flex-wrap gap-1">
              {selectedPlatforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {getPlatformIcon(platform)} {platform}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Badge } from '@/components/ui/badge';

const getPlatformIcon = (platform: string) => {
  const icons = {
    'ChatGPT': '🤖',
    'Claude': '🧠',
    'Gemini': '♊',
    'GPT-4': '⚡',
    'Midjourney': '🎨',
    'DALL-E': '🖼️',
    'Stable Diffusion': '🌈',
    'Perplexity': '🔍',
    'GitHub Copilot': '💻',
    'Notion AI': '📝',
  };
  return icons[platform as keyof typeof icons] || '🔧';
};

const getPlatformColor = (platform: string) => {
  const colors = {
    'ChatGPT': 'bg-green-100 text-green-800 border-green-200',
    'Claude': 'bg-orange-100 text-orange-800 border-orange-200',
    'Gemini': 'bg-blue-100 text-blue-800 border-blue-200',
    'GPT-4': 'bg-purple-100 text-purple-800 border-purple-200',
    'Midjourney': 'bg-pink-100 text-pink-800 border-pink-200',
    'DALL-E': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Stable Diffusion': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Perplexity': 'bg-teal-100 text-teal-800 border-teal-200',
    'GitHub Copilot': 'bg-gray-100 text-gray-800 border-gray-200',
    'Notion AI': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

interface PlatformBadgeProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ 
  platform, 
  size = 'sm',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  if (variant === 'outline') {
    return (
      <Badge variant="outline" className={`${sizeClasses[size]} ${getPlatformColor(platform)}`}>
        <span className="mr-1">{getPlatformIcon(platform)}</span>
        {platform}
      </Badge>
    );
  }

  return (
    <Badge className={`${sizeClasses[size]} ${getPlatformColor(platform)} border`}>
      <span className="mr-1">{getPlatformIcon(platform)}</span>
      {platform}
    </Badge>
  );
};

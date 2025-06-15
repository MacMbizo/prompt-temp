
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  reputation_score: number;
  is_trusted: boolean;
  created_at: string;
  updated_at: string;
}

export const useReputation = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReputation = async (points: number, reason: string) => {
    if (!user || !profile) return;

    try {
      const newScore = Math.max(0, profile.reputation_score + points);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ reputation_score: newScore })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reputation:', error);
      } else {
        setProfile(data);
        if (points > 0) {
          toast.success(`+${points} reputation: ${reason}`);
        }
      }
    } catch (error) {
      console.error('Error updating reputation:', error);
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 1000) return { level: 'Expert', color: 'text-purple-600', badge: '🏆' };
    if (score >= 500) return { level: 'Advanced', color: 'text-blue-600', badge: '💎' };
    if (score >= 100) return { level: 'Contributor', color: 'text-green-600', badge: '⭐' };
    if (score >= 25) return { level: 'Member', color: 'text-yellow-600', badge: '🌟' };
    return { level: 'Beginner', color: 'text-gray-600', badge: '🌱' };
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateReputation,
    getReputationLevel,
    refetch: fetchProfile
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Rating {
  id: string;
  prompt_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useRatings = (promptId: string) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && promptId) {
      fetchUserRating();
    } else {
      setLoading(false);
    }
  }, [user, promptId]);

  const fetchUserRating = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prompt_ratings')
        .select('rating')
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user rating:', error);
      } else {
        setUserRating(data?.rating || null);
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (rating: number, reviewText?: string) => {
    if (!user) {
      toast.error('You must be logged in to rate prompts');
      return false;
    }

    try {
      const { error } = await supabase
        .from('prompt_ratings')
        .upsert({
          prompt_id: promptId,
          user_id: user.id,
          rating,
          review_text: reviewText?.trim() || null
        });

      if (error) {
        console.error('Error submitting rating:', error);
        toast.error('Failed to submit rating');
        return false;
      } else {
        setUserRating(rating);
        toast.success('Rating submitted successfully!');
        return true;
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      return false;
    }
  };

  return {
    userRating,
    loading,
    submitRating,
    refetch: fetchUserRating
  };
};

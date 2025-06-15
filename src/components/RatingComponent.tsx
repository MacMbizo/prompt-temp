
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RatingComponentProps {
  promptId: string;
  currentUserRating?: number | null;
  averageRating?: number | null;
  ratingCount?: number;
  onRatingUpdate?: () => void;
}

export const RatingComponent: React.FC<RatingComponentProps> = ({
  promptId,
  currentUserRating,
  averageRating,
  ratingCount,
  onRatingUpdate
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(currentUserRating || 0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUserRating) {
      setRating(currentUserRating);
    }
  }, [currentUserRating]);

  const handleSubmitRating = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('prompt_ratings')
        .upsert({
          prompt_id: promptId,
          user_id: user.id,
          rating,
          review_text: review.trim() || null
        });

      if (error) {
        console.error('Error submitting rating:', error);
        toast.error('Failed to submit rating');
      } else {
        toast.success('Rating submitted successfully!');
        setIsOpen(false);
        onRatingUpdate?.();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (interactive: boolean = false) => {
    const displayRating = interactive ? (hoveredRating || rating) : (averageRating || 0);
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer transition-colors ${
              star <= displayRating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
        {!interactive && (
          <span className="text-sm text-gray-600 ml-2">
            {averageRating ? averageRating.toFixed(1) : '0.0'} ({ratingCount || 0})
          </span>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        {renderStars()}
        <span className="text-xs text-gray-500">Sign in to rate</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {renderStars()}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-xs"
        >
          {currentUserRating ? 'Update Rating' : 'Rate This'}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate This Prompt</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">How would you rate this prompt?</p>
              {renderStars(true)}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Review (Optional)
              </label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this prompt..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitRating}
                disabled={rating === 0 || submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';

interface CommunitySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
}

export const CommunitySubmissionModal: React.FC<CommunitySubmissionModalProps> = ({
  isOpen,
  onClose,
  prompt
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit to community');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for submitting this prompt to the community');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_submissions')
        .insert({
          prompt_id: prompt.id,
          submitted_by: user.id,
          submission_reason: reason
        });

      if (error) throw error;

      toast.success('Prompt submitted to community for review!');
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error submitting to community:', error);
      toast.error('Failed to submit prompt to community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit to Community</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">{prompt.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Submit this prompt to the community collection for others to discover and use.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why should this be added to the community? *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this prompt would be valuable to the community..."
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Community Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Prompts should be well-tested and effective</li>
              <li>• Include clear descriptions and appropriate tags</li>
              <li>• No offensive, harmful, or inappropriate content</li>
              <li>• Submissions will be reviewed by moderators</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit to Community'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

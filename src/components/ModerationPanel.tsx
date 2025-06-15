
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CommunitySubmission {
  id: string;
  prompt_id: string;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  submission_reason: string;
  moderator_notes: string | null;
  submitted_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  prompt: {
    title: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
  };
  profiles: {
    full_name: string;
    username: string;
  };
}

export const ModerationPanel: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderatorNotes, setModeratorNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('community_submissions')
        .select(`
          *,
          prompt:prompts(title, description, content, category, tags),
          profiles!community_submissions_submitted_by_fkey(full_name, username)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (submissionId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      const notes = moderatorNotes[submissionId] || '';
      
      const { error: submissionError } = await supabase
        .from('community_submissions')
        .update({
          status,
          moderator_notes: notes,
          moderated_by: user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // If approved, mark the prompt as community
      if (status === 'approved') {
        const submission = submissions.find(s => s.id === submissionId);
        if (submission) {
          const { error: promptError } = await supabase
            .from('prompts')
            .update({ is_community: true })
            .eq('id', submission.prompt_id);

          if (promptError) throw promptError;
        }
      }

      toast.success(`Submission ${status} successfully`);
      fetchSubmissions();
      
      // Clear notes
      setModeratorNotes(prev => {
        const updated = { ...prev };
        delete updated[submissionId];
        return updated;
      });
    } catch (error) {
      console.error('Error moderating submission:', error);
      toast.error('Failed to moderate submission');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Moderation</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            {submissions.filter(s => s.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline">
            {submissions.filter(s => s.status === 'approved').length} Approved
          </Badge>
          <Badge variant="outline">
            {submissions.filter(s => s.status === 'rejected').length} Rejected
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{submission.prompt.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>
                      Submitted by {submission.profiles?.full_name || submission.profiles?.username || 'Unknown User'}
                    </span>
                    <span>•</span>
                    <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {getStatusBadge(submission.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {submission.prompt.description && (
                <p className="text-gray-600">{submission.prompt.description}</p>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Prompt Content:</p>
                <p className="text-sm text-gray-900 line-clamp-3">{submission.prompt.content}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{submission.prompt.category}</Badge>
                {submission.prompt.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Submission Reason:</p>
                <p className="text-sm text-blue-800">{submission.submission_reason}</p>
              </div>

              {submission.status === 'pending' && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label htmlFor={`notes-${submission.id}`}>Moderator Notes (optional)</Label>
                    <Textarea
                      id={`notes-${submission.id}`}
                      value={moderatorNotes[submission.id] || ''}
                      onChange={(e) => setModeratorNotes(prev => ({
                        ...prev,
                        [submission.id]: e.target.value
                      }))}
                      placeholder="Add notes about your decision..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleModeration(submission.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleModeration(submission.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              {submission.moderator_notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Moderator Notes:</p>
                  <p className="text-sm text-gray-900">{submission.moderator_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">Community submissions will appear here for moderation.</p>
        </div>
      )}
    </div>
  );
};

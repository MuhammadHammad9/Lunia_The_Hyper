import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/use-user-roles';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { ArrowLeft, Check, X, Flag, Eye, Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  moderation_status: string;
  moderation_notes: string | null;
  created_at: string;
  is_verified_purchase: boolean;
  user_name?: string;
  product_name?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  flagged: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export default function AdminReviews() {
  const navigate = useNavigate();
  const { isModerator, loading: rolesLoading } = useUserRoles();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<ReviewWithProduct | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      let query = supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('moderation_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with user and product names
      const enrichedReviews = await Promise.all(
        (data || []).map(async (review) => {
          const [profileRes, productRes] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', review.user_id).single(),
            supabase.from('products').select('name').eq('id', review.product_id).single(),
          ]);

          return {
            ...review,
            user_name: profileRes.data?.full_name || 'Unknown User',
            product_name: productRes.data?.name || 'Unknown Product',
          };
        })
      );

      setReviews(enrichedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!rolesLoading && !isModerator) {
      navigate('/');
    }
  }, [rolesLoading, isModerator, navigate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModerate = async (reviewId: string, status: string) => {
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('product_reviews')
        .update({
          moderation_status: status,
          moderation_notes: moderationNotes || null,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: 'Review updated',
        description: `Review has been ${status}`,
      });

      setSelectedReview(null);
      setModerationNotes('');
      fetchReviews();
    } catch (error) {
      console.error('Error moderating review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: 'Review deleted',
        description: 'The review has been permanently removed',
      });

      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  if (rolesLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isModerator) {
    return null;
  }

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter(r => r.moderation_status === 'pending').length,
    approved: reviews.filter(r => r.moderation_status === 'approved').length,
    flagged: reviews.filter(r => r.moderation_status === 'flagged').length,
    rejected: reviews.filter(r => r.moderation_status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display text-foreground">Review Moderation</h1>
            <p className="text-muted-foreground">Manage and moderate customer reviews</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'flagged', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
              <Badge variant="secondary" className="ml-2">
                {statusCounts[status]}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Reviews Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {review.product_name}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">
                      {review.user_name}
                      {review.is_verified_purchase && (
                        <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {review.rating}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate">
                        {review.title && <span className="font-medium">{review.title}: </span>}
                        {review.content || 'No content'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[review.moderation_status] || ''}>
                        {review.moderation_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedReview(review);
                            setModerationNotes(review.moderation_notes || '');
                          }}
                          title="View & Moderate"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {review.moderation_status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleModerate(review.id, 'approved')}
                            className="text-emerald-500 hover:text-emerald-600"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {review.moderation_status !== 'flagged' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleModerate(review.id, 'flagged')}
                            className="text-orange-500 hover:text-orange-600"
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                        )}
                        {review.moderation_status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleModerate(review.id, 'rejected')}
                            className="text-red-500 hover:text-red-600"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(review.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Product</span>
                <span className="font-medium">{selectedReview.product_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User</span>
                <span>{selectedReview.user_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= selectedReview.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {selectedReview.title && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Title</span>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}
              
              {selectedReview.content && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Content</span>
                  <p className="text-foreground/80">{selectedReview.content}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-muted-foreground block mb-2">Moderation Notes</span>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about this moderation decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleModerate(selectedReview!.id, 'rejected')}
              disabled={actionLoading}
              className="text-red-500"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => handleModerate(selectedReview!.id, 'flagged')}
              disabled={actionLoading}
              className="text-orange-500"
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag
            </Button>
            <Button
              onClick={() => handleModerate(selectedReview!.id, 'approved')}
              disabled={actionLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

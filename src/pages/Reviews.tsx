import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import './Reviews.css';

interface Review {
  id: number;
  nom: string;
  note: number;
  commentaire: string;
  date_creation: string;
  source?: 'local' | 'google';
  date_google?: string;
  google_review_id?: string;
  reviewer_profile_photo?: string;
  reviewer_total_reviews?: number;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    nom: '',
    note: 5,
    commentaire: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/avis');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.nom.trim()) {
      setMessage('Veuillez renseigner votre nom');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/avis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        setMessage('Votre avis a été ajouté avec succès !');
        setNewReview({ nom: '', note: 5, commentaire: '' });
        fetchReviews();
      } else {
        setMessage('Erreur lors de l\'ajout de votre avis');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'ajout de votre avis');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star ${
              star <= rating ? 'star-filled' : 'star-empty'
            } ${interactive ? 'star-interactive' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.note, 0) / reviews.length 
    : 0;

  return (
    <div className="reviews-page">
      <div className="reviews-container">
        <div className="reviews-header">
          <h1>Avis de nos clients</h1>
          {reviews.length > 0 && (
            <div className="average-rating">
              <div className="rating-display">
                {renderStars(Math.round(averageRating))}
                <span className="rating-text">
                  {averageRating.toFixed(1)}/5 ({reviews.length} avis)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="reviews-content">
          <div className="reviews-list">
            <h2>Tous les avis</h2>
            {loading ? (
              <div className="loading">Chargement des avis...</div>
            ) : reviews.length === 0 ? (
              <div className="no-reviews">
                <p>Aucun avis pour le moment. Soyez le premier à laisser votre avis !</p>
              </div>
            ) : (
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <div key={review.id} className={`review-card ${review.source === 'google' ? 'google-review' : 'local-review'}`}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        {review.source === 'google' && review.reviewer_profile_photo ? (
                          <img 
                            src={review.reviewer_profile_photo} 
                            alt={review.nom}
                            className="reviewer-photo"
                          />
                        ) : (
                          <User className="user-icon" />
                        )}
                        <div className="reviewer-details">
                          <span className="reviewer-name">{review.nom}</span>
                          {review.source === 'google' && review.reviewer_total_reviews && (
                            <span className="reviewer-stats">
                              {review.reviewer_total_reviews} avis au total
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="review-meta">
                        <div className="review-rating">
                          {renderStars(review.note)}
                        </div>
                        {review.source === 'google' && (
                          <div className="review-source">
                            <span className="source-badge google">🌟 Google</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {review.commentaire && (
                      <p className="review-comment">{review.commentaire}</p>
                    )}
                    <div className="review-date">
                      {review.source === 'google' && review.date_google 
                        ? `Publié le ${formatDate(review.date_google)} sur Google`
                        : formatDate(review.date_creation)
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="review-form-section">
            <h2>Laissez votre avis</h2>
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label htmlFor="nom">Votre nom</label>
                <input
                  type="text"
                  id="nom"
                  value={newReview.nom}
                  onChange={(e) => setNewReview({ ...newReview, nom: e.target.value })}
                  placeholder="Entrez votre nom"
                  required
                />
              </div>

              <div className="form-group">
                <label>Votre note</label>
                {renderStars(
                  newReview.note,
                  true,
                  (rating) => setNewReview({ ...newReview, note: rating })
                )}
              </div>

              <div className="form-group">
                <label htmlFor="commentaire">Votre commentaire</label>
                <textarea
                  id="commentaire"
                  value={newReview.commentaire}
                  onChange={(e) => setNewReview({ ...newReview, commentaire: e.target.value })}
                  placeholder="Partagez votre expérience... (optionnel)"
                  rows={4}
                />
              </div>

              <button type="submit" disabled={submitting} className="submit-btn">
                <Send className="send-icon" />
                {submitting ? 'Envoi en cours...' : 'Publier mon avis'}
              </button>

              {message && (
                <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
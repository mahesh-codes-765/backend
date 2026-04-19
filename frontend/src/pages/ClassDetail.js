import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classAPI, bookingAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fitnessClass, setFitnessClass] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const classResponse = await classAPI.getClassById(id);
      setFitnessClass(classResponse.data);

      if (classResponse.data.trainer?._id) {
        const reviewsResponse = await reviewAPI.getTrainerReviews(classResponse.data.trainer._id);
        setReviews(reviewsResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      setBookingLoading(true);
      await bookingAPI.createBooking({ classId: id });
      
      alert('Booking created successfully! Payment confirmed.');
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.addReview({
        trainerId: fitnessClass.trainer._id,
        classId: id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      alert('Review submitted successfully!');
      setReviewData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchClassDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (error) return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  if (!fitnessClass) return <div style={styles.container}>Class not found</div>;

  const spotsAvailable = fitnessClass.capacity - fitnessClass.enrolledUsers.length;

  return (
    <div style={styles.container}>
      <div style={styles.detailsCard}>
        <h1>{fitnessClass.title}</h1>
        {fitnessClass.imageUrl && (
          <img src={fitnessClass.imageUrl} alt={fitnessClass.title} style={styles.classImage} />
        )}
        <p style={styles.description}>{fitnessClass.description}</p>

        <div style={styles.info}>
          <div style={styles.infoRow}>
            <strong>Type:</strong> <span>{fitnessClass.type}</span>
          </div>
          <div style={styles.infoRow}>
            <strong>Trainer:</strong> <span>{fitnessClass.trainer?.name}</span>
          </div>
          <div style={styles.infoRow}>
            <strong>Date:</strong> <span>{new Date(fitnessClass.scheduleDate).toLocaleDateString()}</span>
          </div>
          <div style={styles.infoRow}>
            <strong>Time:</strong> <span>{fitnessClass.startTime} - {fitnessClass.endTime}</span>
          </div>
          <div style={styles.infoRow}>
            <strong>Duration:</strong> <span>{fitnessClass.duration} minutes</span>
          </div>
          <div style={styles.infoRow}>
            <strong>Price:</strong> <span style={styles.price}>${fitnessClass.price}</span>
          </div>
          <div style={styles.infoRow}>
            <strong>Available Spots:</strong> <span>{spotsAvailable}</span>
          </div>
        </div>

        {user && spotsAvailable > 0 && (
          <button 
            onClick={handleBooking}
            disabled={bookingLoading}
            style={styles.bookButton}
          >
            {bookingLoading ? 'Booking...' : 'Book Class'}
          </button>
        )}
      </div>

      {/* Reviews Section */}
      <div style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Reviews from Clients</h2>
        
        {user?.role === 'user' && (
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={styles.reviewButton}
          >
            {showReviewForm ? 'Cancel' : 'Leave a Review'}
          </button>
        )}

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
            <div style={styles.formGroup}>
              <label>Rating (1-5):</label>
              <select 
                value={reviewData.rating}
                onChange={(e) => setReviewData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                style={styles.input}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} Stars</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Comment:</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                required
                style={styles.textarea}
              />
            </div>
            <button type="submit" style={styles.submitButton}>Submit Review</button>
          </form>
        )}

        <div style={styles.reviewsList}>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <strong>{review.user?.name}</strong>
                  <span style={styles.rating}>{'⭐'.repeat(review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                {review.trainerResponse && (
                  <div style={styles.trainerResponse}>
                    <strong>Trainer Response:</strong>
                    <p>{review.trainerResponse}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '0 2rem',
    minHeight: 'calc(100vh - 80px)',
  },
  detailsCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  },
  classImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  description: {
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
    color: '#666',
  },
  info: {
    display: 'grid',
    gap: '1rem',
    marginBottom: '2rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.05rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
  reviewsSection: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  reviewsTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
    borderBottom: '2px solid #667eea',
    paddingBottom: '0.5rem',
  },
  reviewButton: {
    backgroundColor: '#667eea',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  reviewForm: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  formGroup: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
  textarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
    minHeight: '100px',
    fontFamily: 'Arial',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  reviewsList: {
    marginTop: '2rem',
  },
  reviewItem: {
    padding: '1rem',
    borderBottom: '1px solid #eee',
    marginBottom: '1rem',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  rating: {
    fontSize: '1.2rem',
  },
  trainerResponse: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f0f0f0',
    borderLeft: '3px solid #667eea',
  },
};

export default ClassDetail;

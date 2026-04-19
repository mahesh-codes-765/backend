import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading bookings...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Bookings</h1>
      
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.bookingsList}>
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} style={styles.bookingCard}>
              <h3 style={styles.cardTitle}>{booking.class?.title}</h3>
              <div style={styles.info}>
                <div><strong>Date:</strong> {new Date(booking.class?.scheduleDate).toLocaleDateString()}</div>
                <div><strong>Time:</strong> {booking.class?.startTime} - {booking.class?.endTime}</div>
                <div><strong>Trainer:</strong> {booking.trainer?.name}</div>
                <div><strong>Price:</strong> ${booking.class?.price}</div>
                <div>
                  <strong>Booking Status:</strong> 
                  <span style={getStatusStyle(booking.status)}>{booking.status}</span>
                </div>
                <div>
                  <strong>Payment Status:</strong>
                  <span style={getPaymentStatusStyle(booking.paymentStatus)}>{booking.paymentStatus}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.noBookings}>No bookings yet</p>
        )}
      </div>
    </div>
  );
};

const getStatusStyle = (status) => {
  const colors = {
    reserved: '#FFC107',
    completed: '#4CAF50',
    cancelled: '#f44336',
  };
  return {
    display: 'inline-block',
    backgroundColor: colors[status] || '#999',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    marginLeft: '0.5rem',
    fontSize: '0.9rem',
  };
};

const getPaymentStatusStyle = (status) => {
  const colors = {
    paid: '#4CAF50',
    success: '#4CAF50',
    pending: '#FFC107',
    failed: '#f44336',
  };
  return {
    display: 'inline-block',
    backgroundColor: colors[status] || '#999',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    marginLeft: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  };
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '2rem auto',
    padding: '0 2rem',
    minHeight: 'calc(100vh - 80px)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  bookingsList: {
    marginTop: '2rem',
    display: 'grid',
    gap: '1rem',
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  info: {
    marginTop: '1rem',
    display: 'grid',
    gap: '0.75rem',
  },
  noBookings: {
    textAlign: 'center',
    padding: '2rem',
    color: '#999',
    fontSize: '1.1rem',
  },
};

export default MyBookings;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    fitnessGoals: user?.fitnessGoals || [],
    preferences: user?.preferences || [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fitnessGoals' || name === 'preferences') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim()).filter(item => item),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1>My Profile</h1>
        
        {message && <div style={styles.message}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              value={user?.email}
              disabled
              style={{...styles.input, backgroundColor: '#f0f0f0'}}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              value={user?.role}
              disabled
              style={{...styles.input, backgroundColor: '#f0f0f0'}}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="fitnessGoals">Fitness Goals (comma-separated):</label>
            <textarea
              id="fitnessGoals"
              name="fitnessGoals"
              value={formData.fitnessGoals.join(', ')}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="e.g., weight loss, muscle gain, endurance"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="preferences">Class Preferences (comma-separated):</label>
            <textarea
              id="preferences"
              name="preferences"
              value={formData.preferences.join(', ')}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="e.g., yoga, cardio, strength training"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
  textarea: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginTop: '0.5rem',
    minHeight: '100px',
    fontFamily: 'Arial',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '0.75rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  message: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
  },
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { trainerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TrainerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    qualifications: [],
    expertise: [],
    specialization: [],
    photoUrl: '',
    videoUrl: '',
    introductoryMessage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'trainer') {
      fetchProfile();
    } else {
      setMessage('Only trainers can access this page');
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await trainerAPI.getMyProfile();
      setProfile(response.data);
      setPhotoPreview(response.data.photoUrl);
      setFormData({
        qualifications: response.data.qualifications || [],
        expertise: response.data.expertise || [],
        specialization: response.data.specialization || [],
        photoUrl: response.data.photoUrl || '',
        videoUrl: response.data.videoUrl || '',
        introductoryMessage: response.data.introductoryMessage || '',
      });
    } catch (err) {
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress image before converting to base64
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if image is too large
        const maxWidth = 800;
        const maxHeight = 800;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with quality 0.7
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoPreview(compressedBase64);
        setFormData(prev => ({ ...prev, photoUrl: compressedBase64 }));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile) {
        await trainerAPI.updateProfile(formData);
      } else {
        await trainerAPI.createProfile(formData);
      }
      setMessage('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  if (user?.role !== 'trainer') {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <p style={styles.error}>Only trainers can access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1>My Trainer Profile</h1>
        
        {message && <div style={styles.message}>{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div style={styles.photoSection}>
            {photoPreview && (
              <img src={photoPreview} alt="Profile" style={styles.photoPreview} />
            )}
            <div style={styles.formGroup}>
              <label htmlFor="photo">Upload Profile Photo:</label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                style={styles.fileInput}
              />
              <p style={styles.hint}>Upload a JPG or PNG image</p>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label>Qualifications (comma-separated):</label>
            <textarea
              value={formData.qualifications.join(', ')}
              onChange={(e) => handleArrayChange(e, 'qualifications')}
              style={styles.textarea}
              placeholder="e.g., NASM Certification, ACE Certification"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Expertise (comma-separated):</label>
            <textarea
              value={formData.expertise.join(', ')}
              onChange={(e) => handleArrayChange(e, 'expertise')}
              style={styles.textarea}
              placeholder="e.g., Strength Training, Cardio, Yoga"
            />
          </div>

          <div style={styles.formGroup}>
            <label>Specialization (comma-separated):</label>
            <textarea
              value={formData.specialization.join(', ')}
              onChange={(e) => handleArrayChange(e, 'specialization')}
              style={styles.textarea}
              placeholder="e.g., Weight Loss, Muscle Gain, Flexibility"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="videoUrl">Video URL:</label>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              style={styles.input}
              placeholder="https://your-video-url.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="introductoryMessage">Introductory Message:</label>
            <textarea
              id="introductoryMessage"
              name="introductoryMessage"
              value={formData.introductoryMessage}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Write a brief introduction about yourself"
            />
          </div>

          {profile && (
            <div style={styles.stats}>
              <h3>Your Statistics</h3>
              <p><strong>Average Rating:</strong> ⭐ {profile.averageRating.toFixed(1)}</p>
              <p><strong>Total Reviews:</strong> {profile.totalReviews}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={saving}
            style={styles.button}
          >
            {saving ? 'Saving...' : 'Save Profile'}
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
  photoSection: {
    textAlign: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #eee',
  },
  photoPreview: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  fileInput: {
    padding: '0.5rem',
    marginTop: '0.5rem',
  },
  hint: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.5rem',
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
    minHeight: '80px',
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
  stats: {
    backgroundColor: '#f0f0f0',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
  },
  error: {
    color: '#d32f2f',
    padding: '1rem',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
};

export default TrainerProfile;

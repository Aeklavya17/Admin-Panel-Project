import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  const adminEmail = localStorage.getItem('adminEmail');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/update-admin', {
        email: adminEmail,
        old_password: oldPassword,
        new_password: newPassword,
      });
      alert(response.data.message);
      setEditing(false);
    } catch (error) {
      alert('Error updating profile');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.post('http://localhost:5001/delete-admin', { email: adminEmail });
      alert('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      alert('Error deleting account');
      console.error(error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {editing ? (
        <form onSubmit={handleUpdate}>
          <input type="email" placeholder="Email" value={adminEmail} readOnly />
          <input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit">Update</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div>
          <p>Email: {adminEmail}</p>
          <p>Password: ••••••••</p>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={handleDelete} className="delete-button">Delete Account</button>
        </div>
      )}
    </div>
  );
}

export default Profile;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as MyIcon } from '../../assets/icons/my-icon.svg';
import './Navbar.css';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem('adminEmail'); // Retrieve admin email from localStorage

  const handleSignOut = () => {
    localStorage.removeItem('adminEmail'); // Clear admin email on sign out
    navigate('/login');
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown); // Toggle the dropdown
  };

  const handleClick = (callback) => {
    callback();
    setShowDropdown(false); // Close dropdown
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-icon') && !event.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/admin-panel')}>
        <MyIcon />
      </div>
      <ul>
        <li>
          <Link to="/user-verification">User Verification</Link>
        </li>
        <li>
          <Link to="/event-information">Event Information</Link>
        </li>
        <li>
          <Link to="/event-carousel">Event Carousel</Link>
        </li>
      </ul>
      <div className="user-icon" onClick={handleDropdownToggle}>
        <FontAwesomeIcon icon={faUser} style={{ color: '#000000' }} />
      </div>
      {showDropdown && (
        <div className="dropdown">
          <p>{adminEmail}</p>
          <button onClick={() => handleClick(() => navigate('/profile'))}>About User</button>
          <button onClick={() => handleClick(handleSignOut)}>Sign Out</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UploadImage from './UploadImage';
import './App.css';

const EventCarouselList = () => {
  const [carousels, setCarousels] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const apiUrl = process.env.REACT_BACKEND_API_URL;

  const fetchCarousels = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/event_carousels`);
      setCarousels(response.data);
    } catch (error) {
      console.error('Error fetching carousels:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchCarousels();
  }, [fetchCarousels]);

  const handleCreateClick = () => {
    setSelectedCarousel(null);
    setShowUpload(true);
  };

  const handleEditClick = (carousel) => {
    setSelectedCarousel(carousel);
    setShowUpload(true);
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`${apiUrl}/event_carousels/${id}`);
      fetchCarousels();
    } catch (error) {
      console.error('Error deleting carousel:', error);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchCarousels();
  };

  return (
    <div className="event-carousel-container">
      {showUpload ? (
        <UploadImage
          onCreate={handleUploadComplete}
          carousel={selectedCarousel}
        />
      ) : (
        <>
          <div className="header-container">
            <h1>Event Carousels</h1>
            <button className="create-button" onClick={handleCreateClick}>Create Event</button>
          </div>
          {carousels.map((carousel) => (
            <div key={carousel.id} className="carousel-item">
              <img src={carousel.carousel_url} alt={`Carousel ${carousel.id}`} className="carousel-image" />
              <button onClick={() => handleEditClick(carousel)}>Edit</button>
              <button onClick={() => handleDeleteClick(carousel.id)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default EventCarouselList;

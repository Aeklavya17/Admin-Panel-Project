import React, { useState } from 'react';
import './EventCarouselForm.css';

const EventCarouselForm = ({ onCreate }) => {
    const [eventId, setEventId] = useState('');
    const [carouselUrl, setCarouselUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(eventId, carouselUrl);
        setEventId('');
        setCarouselUrl('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Event ID"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Carousel URL"
                value={carouselUrl}
                onChange={(e) => setCarouselUrl(e.target.value)}
                required
            />
            <button type="submit">Create Carousel</button>
        </form>
    );
};

export default EventCarouselForm;

import React, { useState } from 'react';
import './EventCarouselItem.css';

const EventCarouselItem = ({ event, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [url, setUrl] = useState(event.url);

    const handleEditClick = () => {
        if (isEditing) {
            onEdit(event.id, url);
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="event">
            <input 
                type="text" 
                id={`event-url-${event.id}`} 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                readOnly={!isEditing} 
            />
            <button onClick={() => onDelete(event.id)}>Delete</button>
            <button onClick={handleEditClick}>{isEditing ? 'Save' : 'Edit'}</button>
        </div>
    );
};

export default EventCarouselItem;

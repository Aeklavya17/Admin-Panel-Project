import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const UploadImage = ({ onCreate }) => {
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl('');
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Generate File URL
      const generateResponse = await axios.post('http://localhost:5001/generate_image_url', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrl = generateResponse.data.file_url;

      // Step 2: Upload to Azure
      await axios.post('http://localhost:5001/upload_image_to_azure', { file_url: fileUrl, file }, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Step 3: Save to Database
      await axios.post('http://localhost:5001/event_carousels', {
        event_id: eventId,
        carousel_url: fileUrl,
      });

      alert('Carousel uploaded and saved successfully!');
      onCreate(fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred while uploading the image.');
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Image</h1>
      <div className="input-row">
        <input type="file" onChange={handleFileChange} />
        <input 
          type="text" 
          placeholder="Event ID" 
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
      </div>
      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      )}
      <div>
        <button 
          onClick={handleUpload}
          className="upload-button"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadImage;

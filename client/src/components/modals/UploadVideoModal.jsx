import React, { useState } from 'react';
import '../../styles/Modal.css';


const UploadVideoModal = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!title || !file) return alert("Fill all fields");
    const url = URL.createObjectURL(file); // Create preview link
    onUpload({ title, file, url });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Upload Video</h3>
        <input type="text" placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
        <div className="modal-buttons">
          <button onClick={handleUpload}>Upload</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UploadVideoModal;

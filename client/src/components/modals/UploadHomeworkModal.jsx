import React, { useState } from 'react';
import '../../styles/Modal.css';

const UploadHomeworkModal = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null); // ✅ only use one file state

  const handleUpload = () => {
    if (!title || !file) {
      alert("Please fill all fields.");
      return;
    }

    if (!(file instanceof File)) {
      alert("Invalid file. Please try again.");
      return;
    }

    const url = URL.createObjectURL(file); // ✅ preview URL
    onUpload({ title, file, url }); // ✅ pass to parent
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Upload Homework</h3>
        <input
          type="text"
          placeholder="Homework Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="modal-buttons">
          <button onClick={handleUpload}>Upload</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UploadHomeworkModal;

import React, { useState } from 'react';
import '../../styles/Modal.css';
import './HomeworkModal.css';

const UploadLessonMaterialModal = ({ isOpen, onClose, onSuccess, className, teacherSubjects }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(teacherSubjects?.[0]?._id || '');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !file || !subject) {
      setError('Please fill all required fields.');
      return;
    }

    if (!(file instanceof File)) {
      setError('Invalid file. Please try again.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('class', className);
      formData.append('pdf', file);
      if (description) formData.append('description', description);

      const response = await fetch('/api/v1/lesson-materials', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload lesson material');
      }

      const result = await response.json();
      
      setTitle('');
      setDescription('');
      setSubject(teacherSubjects?.[0]?._id || '');
      setFile(null);
      onSuccess(result.data);
      onClose();
    } catch (error) {
      console.error('Error uploading lesson material:', error);
      setError(error.message || 'Failed to upload lesson material');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box homework-modal">
        <h3>Upload Lesson Material</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              id="title"
              type="text"
              placeholder="Lesson Material Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject*</label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              {teacherSubjects?.map((subj) => (
                <option key={subj._id} value={subj._id}>
                  {subj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Material Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">PDF File*</label>
            <input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <small>Only PDF files are accepted</small>
          </div>

          <div className="modal-buttons">
            <button
              type="submit"
              disabled={isUploading}
              className={isUploading ? 'loading' : ''}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadLessonMaterialModal;
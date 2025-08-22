import React, { useState } from "react";
import { useAuth } from "../../contexts/authContext";
import "../../styles/Modal.css";

const UploadVideoModal = ({ onClose, onUpload, className }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(user?.subjects?.[0]?._id || user?.subjects?.[0] || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !subject || !file) return alert("Fill all fields");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("class", className);

      const response = await fetch("/api/v1/videos/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const result = await response.json();

      // Pass the uploaded video data back to parent
      onUpload({
        title: result.data.title,
        url: result.data.url,
        id: result.data._id,
      });

      onClose();
      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert(`Failed to upload video: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Upload Video</h3>
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        >
          <option value="">Select Subject</option>
          {(user?.subjects || ["Mathematics", "Science", "English"]).map((subj) => (
            <option key={subj._id || subj} value={subj._id || subj}>
              {subj.name || subj}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="video/*"
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

export default UploadVideoModal;

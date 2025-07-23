import React, { useState } from "react";
import "../../styles/Modal.css";
import "./HomeworkModal.css";

const EnhancedHomeworkModal = ({
  onClose,
  onUpload,
  className,
  teacherSubjects,
  teacherId,
}) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState(teacherSubjects[0] || "");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !file || !subject) {
      setError("Please fill all required fields.");
      return;
    }

    if (!(file instanceof File)) {
      setError("Invalid file. Please try again.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("class", className);
      formData.append("pdf", file);

      if (description) formData.append("description", description);
      if (deadline) {
        // Format the date as YYYY-MM-DD
        formData.append("deadline", deadline); // The date input already returns YYYY-MM-DD format
      }

      // Send to backend
      const response = await fetch("/api/v1/assignments", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload homework");
      }

      const result = await response.json();

      // Create a URL for preview (this will be replaced with actual URL from backend)
      const previewUrl = URL.createObjectURL(file);

      // Pass the result to parent component
      onUpload({
        id: result.data._id,
        title,
        subject,
        description,
        deadline,
        url: previewUrl,
        fileName: result.data.fileName,
      });

      onClose();
    } catch (error) {
      console.error("Error uploading homework:", error);
      setError(error.message || "Failed to upload homework");
    } finally {
      setIsUploading(false);
    }
  };

  // Get tomorrow's date as default for deadline
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box homework-modal">
        <h3>Upload Homework</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              id="title"
              type="text"
              placeholder="Homework Title"
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
              {teacherSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Homework Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline (Optional)</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={getTomorrowDate()}
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
              className={isUploading ? "loading" : ""}
            >
              {isUploading ? "Uploading..." : "Upload"}
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

export default EnhancedHomeworkModal;

import React, { useRef, useState, useEffect } from "react";

const AssignmentCard = ({
  teacher,
  assignmentTitle,
  dueDate,
  onUpload,
  onDownload,
  type,
  assignmentId,
  isSubmitted = false,
  submissionFile = null,
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(isSubmitted);
  const [submission, setSubmission] = useState(submissionFile);

  useEffect(() => {
    setSubmitted(isSubmitted);
    setSubmission(submissionFile);
  }, [isSubmitted, submissionFile]);

  const handleUploadClick = () => {
    if (!submitted) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file && assignmentId && !submitted) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("pdf", file);

        const response = await fetch(
          `/api/v1/submissions/assignment/${assignmentId}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSubmitted(true);
          setSubmission(data.data);
          alert("Homework submitted successfully!");
        } else {
          const error = await response.json();
          alert(error.message || "Failed to submit homework");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to submit homework: " + error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleViewSubmission = () => {
    if (submission?.fileName) {
      window.open(
        `http://localhost:8000/api/v1/submissions/download/${submission.fileName}`,
        "_blank"
      );
    }
  };

  return (
    <div className="assignment-card">
      <div>
        <h4>
          {teacher} | {assignmentTitle}
        </h4>
        <p>Due date: {dueDate}</p>
        {submitted && submission && (
          <p style={{ color: "green", fontSize: "12px" }}>
            Submitted: {submission.originalFileName}
          </p>
        )}
      </div>
      <div className="buttons">
        <button onClick={onDownload}>
          {type === "video" ? "Play" : "Download"}
        </button>
        {type !== "video" && (
          <>
            {submitted ? (
              <button
                onClick={handleViewSubmission}
                style={{ backgroundColor: "#28a745" }}
              >
                View Submission
              </button>
            ) : (
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                style={{ backgroundColor: uploading ? "#ccc" : "" }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              style={{ display: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;

import React, { useRef } from "react";

const AssignmentCard = ({
  teacher,
  assignmentTitle,
  dueDate,
  onUpload,
  onDownload,
  type,
}) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div className="assignment-card">
      <div>
        <h4>
          {teacher} | {assignmentTitle}
        </h4>
        <p>Due date: {dueDate}</p>
      </div>
      <div className="buttons">
        <button onClick={onDownload}>
          {type === "video" ? "Play" : "Download"}
        </button>
        <button onClick={handleUploadClick}>Upload</button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default AssignmentCard;

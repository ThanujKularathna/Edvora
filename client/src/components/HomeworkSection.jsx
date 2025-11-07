import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import EnhancedHomeworkModal from "./modals/EnhancedHomeworkModal";
// import { API_BASE_URL } from "../config";
import { capitalCase } from "change-case";
import "./HomeworkSection.css";
import "../styles/Modal.css";

const HomeworkSection = ({ className, showModal, setShowModal, openDropdown, setOpenDropdown }) => {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    id: null,
  });

  // Fetch homeworks when component mounts
  useEffect(() => {
    async function fetchHomeworks() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/v1/assignments?class=${className}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch homeworks: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          setHomeworks(data.data);
        }
      } catch (error) {
        console.error("Error fetching homeworks:", error);
        setError("Failed to load homeworks");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHomeworks();
  }, [className]);

  const handleAddHomework = (homework) => {
    // Format the homework to match the API structure
    const formattedHomework = {
      ...homework,
      id: homework.id || homework._id,
      subject: homework.subject && user?.subjects ? 
        user.subjects.find(s => s._id === homework.subject) || homework.subject :
        homework.subject
    };
    setHomeworks([formattedHomework, ...homeworks]);
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = (id) => {
    setDeleteConfirmation({ show: true, id: id });
  };

  // Handle actual homework deletion
  const handleDeleteHomework = async (id) => {
    try {
      const response = await fetch(`/api/v1/assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete homework");
      }

      // Remove from state
      setHomeworks(homeworks.filter((hw) => hw.id !== id));
    } catch (error) {
      console.error("Error deleting homework:", error);
      alert(`Failed to delete homework: ${error.message}`);
    } finally {
      setDeleteConfirmation({ show: false, id: null });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle downloading all submitted answers as zip
  const handleDownloadAnswers = async (assignmentId, homeworkTitle) => {
    try {
      console.log(`Downloading answers for assignment ${assignmentId}...`);

      const response = await fetch(
        `/api/v1/assignments/${assignmentId}/submissions/download`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/zip",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          alert("No submissions found for this homework.");
          return;
        }
        throw new Error(`Download failed with status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${homeworkTitle}-submissions-${className}.zip`;

      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading homework answers:", error);
      alert(`Failed to download homework answers: ${error.message}`);
    }
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h3>Home Works</h3>
        {/* Button removed as it's now in the top toolbar */}
      </div>

      <div className="section-body">
        {isLoading ? (
          <p>Loading homeworks...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : homeworks.length === 0 ? (
          <p>No homeworks available for this class.</p>
        ) : (
          homeworks.map((hw) => (
            <div key={hw.id} className="tool-card homework-card">
              <div className="homework-info">
                <span className="homework-title">{hw.title}</span>
                <div className="homework-details">
                  {hw.subject && (
                    <span className="homework-subject">
                      Subject: {capitalCase(hw.subject.name || hw.subject)}
                    </span>
                  )}
                  {hw.deadline && (
                    <span className="homework-deadline">
                      Due: {formatDate(hw.deadline)}
                    </span>
                  )}
                </div>
              </div>
              <div className="quiz-dropdown-container">
                <button
                  className="quiz-dropdown-btn"
                  onClick={() => setOpenDropdown(openDropdown === `homework-${hw.id}` ? null : `homework-${hw.id}`)}
                >
                  Options ▼
                </button>
                {openDropdown === `homework-${hw.id}` && (
                  <div className="quiz-dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        window.open(
                          `http://localhost:8000/api/v1/assignments/download/${encodeURIComponent(
                            hw.fileName
                          )}`,
                          "_blank"
                        );
                        setOpenDropdown(null);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        handleDownloadAnswers(hw.id, hw.title);
                        setOpenDropdown(null);
                      }}
                    >
                      Download Answers
                    </button>
                    <button
                      className="dropdown-item delete-item"
                      onClick={() => {
                        showDeleteConfirmation(hw.id);
                        setOpenDropdown(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <EnhancedHomeworkModal
          onClose={() => setShowModal(false)}
          onUpload={handleAddHomework}
          className={className}
          teacherSubjects={
            user?.subjects || ["Mathematics", "Science", "English"]
          }
          teacherId={user?._id || user?.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this homework?</p>
            <div className="confirmation-buttons">
              <button
                onClick={() => handleDeleteHomework(deleteConfirmation.id)}
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmation({ show: false, id: null })}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkSection;

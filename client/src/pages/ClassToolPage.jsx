import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { capitalCase } from "change-case";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadVideoModal from "../components/modals/UploadVideoModal";
import CreateQuizModal from "../components/modals/CreateQuizModal";
import QuizViewModal from "../components/modals/QuizViewModal";
import HomeworkSection from "../components/HomeworkSection";
import LessonMaterialsSection from "../components/LessonMaterialsSection";
import UploadLessonMaterialModal from "../components/modals/UploadLessonMaterialModal";
import "./ClassToolPage.css";

const ClassToolPage = () => {
  const { user } = useAuth();
  const { className } = useParams();

  // Debug user object
  console.log("User object:", user);
  // console.log("Class name from params:", className);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLessonMaterialModal, setShowLessonMaterialModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const [uploadedVideos, setUploadedVideos] = useState([]);
  // uploadedHomework state removed - now handled by HomeworkSection
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewQuizModal, setViewQuizModal] = useState(false); // ✅ For view modal
  const [selectedQuiz, setSelectedQuiz] = useState(null); // ✅ Selected quiz
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    index: null,
  });
  const [videoDeleteConfirmation, setVideoDeleteConfirmation] = useState({
    show: false,
    index: null,
  });

  const handleDeleteVideo = async (indexToDelete) => {
    const videoToDelete = uploadedVideos[indexToDelete];
    const videoId = videoToDelete?._id || videoToDelete?.id;

    if (!videoToDelete || !videoId) {
      console.error("Video ID not found:", videoToDelete);
      return;
    }

    try {
      const response = await fetch(`/api/v1/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      setUploadedVideos((prevVideos) =>
        prevVideos.filter((_, index) => index !== indexToDelete)
      );
    } catch (error) {
      console.error("Error deleting video:", error);
      alert(`Failed to delete video: ${error.message}`);
    }
  };

  // handleDeleteHomework removed - now handled by HomeworkSection

  // Show delete confirmation dialog
  const showDeleteConfirmation = (indexToDelete) => {
    setDeleteConfirmation({ show: true, index: indexToDelete });
  };

  // Show video delete confirmation dialog
  const showVideoDeleteConfirmation = (indexToDelete) => {
    setVideoDeleteConfirmation({ show: true, index: indexToDelete });
  };

  // Handle actual quiz deletion
  const handleDeleteQuiz = async (indexToDelete) => {
    const quizToDelete = createdQuizzes[indexToDelete];
    if (!quizToDelete || !quizToDelete.id) return;

    try {
      const response = await fetch(`/api/v1/quizzes/${quizToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quiz");
      }

      // Remove from local state
      setCreatedQuizzes((prev) =>
        prev.filter((_, index) => index !== indexToDelete)
      );
    } catch (error) {
      console.error("Error deleting quiz:", error);
      // Use a more React-friendly approach instead of alert
      console.error(`Failed to delete quiz: ${error.message}`);
    } finally {
      setDeleteConfirmation({ show: false, index: null });
    }
  };

  const handleDownloadQuizResults = async (quizId) => {
    try {
      // Show loading indicator or message
      console.log(`Downloading results for quiz ${quizId}...`);

      // Make a fetch request to the download endpoint
      const response = await fetch(
        `/api/v1/quizzes/${quizId}/results/download`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;

      // Get the quiz details to match the backend filename format
      const quiz = createdQuizzes.find((q) => q.id === quizId);
      link.download = `quiz-results-${
        quiz?.quizTitle || "quiz"
      }-${className}.pdf`;

      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading quiz results:", error);
      alert(`Failed to download quiz results: ${error.message}`);
    }
  };

  // ✅ Quiz logic
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  // Initialize quizSubject with the first subject from user.subjects or a default value
  const [quizSubject, setQuizSubject] = useState(
    user?.subjects?.length > 0
      ? user.subjects[0]?._id || user.subjects[0]
      : "Mathematics"
  );

  // Update quizSubject when user data changes
  useEffect(() => {
    if (user?.subjects?.length > 0 && !quizSubject) {
      setQuizSubject(user.subjects[0]?._id || user.subjects[0]);
    }
  }, [user, quizSubject]);

  // Fetch videos and quizzes for this class
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/v1/videos/class/${className}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUploadedVideos(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    const fetchQuizzes = async () => {
      // Use either _id or id property from user object
      const userId = user?._id || user?.id;

      if (!userId || !className) {
        console.log("Missing user ID or className:", { userId, className });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/v1/quizzes/teacher/${userId}/class/${className}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch quizzes: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.data && Array.isArray(data.data.quizzes)) {
          setCreatedQuizzes(
            data.data.quizzes.map((quiz) => ({
              id: quiz._id,
              quizTitle: quiz.title,
              questions: quiz.questions,
              subject: quiz.subject.name,
            }))
          );
        } else {
          console.error("Unexpected data format:", data);
          setCreatedQuizzes([]);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setCreatedQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
    fetchQuizzes();
  }, [user, className]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.quiz-dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: "",
        options: ["", "", "", ""],
        correctAnswer: null,
      },
    ]);
  };

  // Add first question when modal opens
  useEffect(() => {
    if (showQuizModal && questions.length === 0) {
      addQuestion();
    }
  }, [showQuizModal]);

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionTextChange = (id, text) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const handleOptionChange = (qid, index, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === index ? value : opt)),
            }
          : q
      )
    );
  };

  const handleCorrectAnswerSelect = (qid, index) => {
    setQuestions(
      questions.map((q) => (q.id === qid ? { ...q, correctAnswer: index } : q))
    );
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle || questions.length === 0) return alert("Fill all fields");

    // Validate subject is selected
    if (!quizSubject) {
      return alert("Please select a subject for the quiz");
    }

    // Validate that all questions have text and a selected correct answer
    const isValid = questions.every(
      (q) =>
        q.text.trim() !== "" &&
        q.correctAnswer !== null &&
        q.options.every((opt) => opt.trim() !== "")
    );

    if (!isValid) {
      return alert(
        "Please complete all questions with options and select correct answers"
      );
    }

    // Format the data according to the backend model
    const formattedQuestions = questions.map((q) => ({
      questionText: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswer,
      marks: 1,
      type: "mcq",
    }));

    // Use either _id or id property from user object
    const userId = user?._id || user?.id;

    const quizData = {
      title: quizTitle,
      teacherId: userId,
      class: className,
      subject: quizSubject,
      questions: formattedQuestions,
    };

    try {
      const response = await fetch("/api/v1/quizzes/create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quiz");
      }

      const result = await response.json();
      console.log("Quiz created successfully:", result);

      // Update local state with the new quiz
      // Find the subject name from user's subjects
      const subjectName = user?.subjects?.find(s => 
        (s._id || s) === quizSubject
      )?.name || quizSubject;
      
      const newQuiz = {
        quizTitle: result.data.quiz.title,
        questions: result.data.quiz.questions,
        id: result.data.quiz._id,
        subject: subjectName,
      };

      setCreatedQuizzes([newQuiz, ...createdQuizzes]); // Add to beginning of list

      setQuizTitle("");
      setQuestions([]);
      setShowQuizModal(false);

      alert("Quiz created successfully!");
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert(`Failed to create quiz: ${error.message}`);
    }
  };
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  console.log(`${API_BASE_URL}/api/v1/videos/stream/`);

  return (
    <div className="tool-page">
      <Navbar />
      <div className="tool-page-body">
        <h2>Class Tools({className})</h2>

        <div className="tool-buttons">
          <button className="top-btn" onClick={() => setShowVideoModal(true)}>
            Upload Video
          </button>
          <button
            className="top-btn"
            onClick={() => setShowHomeworkModal(true)}
          >
            Upload Homework
          </button>
          <button className="top-btn" onClick={() => setShowQuizModal(true)}>
            Create Quiz
          </button>
          <button className="top-btn" onClick={() => setShowLessonMaterialModal(true)}>
            Upload Material
          </button>
        </div>

        <div className="content-section">
          <h3>Videos</h3>
          <div className="section-body">
            {uploadedVideos.length === 0 && <p>No videos available for this class.</p>}
            {uploadedVideos.map((video, idx) => (
              <div key={idx} className="tool-card homework-card">
                <div className="homework-info">
                  <span className="homework-title">{video.title}</span>
                  <div className="homework-details">
                    {video.subject && (
                      <span className="homework-subject">
                        Subject: {capitalCase(video.subject.name || video.subject)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="quiz-dropdown-container">
                  <button
                    className="quiz-dropdown-btn"
                    onClick={() => setOpenDropdown(openDropdown === `video-${idx}` ? null : `video-${idx}`)}
                  >
                    Options ▼
                  </button>
                  {openDropdown === `video-${idx}` && (
                    <div className="quiz-dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          const videoId = video._id || video.id;
                          if (videoId) {
                            window.open(
                              `${API_BASE_URL}/api/v1/videos/stream/${videoId}`,
                              "_blank"
                            );
                          } else {
                            console.error("Video ID not found:", video);
                            alert("Cannot play video: ID not found");
                          }
                          setOpenDropdown(null);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="dropdown-item delete-item"
                        onClick={() => {
                          showVideoDeleteConfirmation(idx);
                          setOpenDropdown(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HomeworkSection with modal state passed from parent */}
        <HomeworkSection
          className={className}
          showModal={showHomeworkModal}
          setShowModal={setShowHomeworkModal}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />

        {/* Lesson Materials Section */}
        <LessonMaterialsSection 
          user={user} 
          showUploadButton={false}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
          showModal={showLessonMaterialModal}
          setShowModal={setShowLessonMaterialModal}
          className={className}
          teacherSubjects={user?.subjects || []}
        />

        <div className="content-section">
          <h3>Quizzes</h3>
          <div className="section-body">
            {isLoading ? (
              <p>Loading quizzes...</p>
            ) : createdQuizzes.length === 0 ? (
              <p>No quizzes available for this class.</p>
            ) : (
              createdQuizzes.map((quiz, idx) => (
                <div key={quiz.id || idx} className="tool-card">
                  <div className="quiz-info">
                    <span className="quiz-title">{quiz.quizTitle}</span>
                    {quiz.subject && (
                      <span className="quiz-subject">
                        Subject: {capitalCase(quiz.subject)}
                      </span>
                    )}
                  </div>
                  <div className="quiz-dropdown-container">
                    <button
                      className="quiz-dropdown-btn"
                      onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                    >
                      Options ▼
                    </button>
                    {openDropdown === idx && (
                      <div className="quiz-dropdown-menu">
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setViewQuizModal(true);
                            setOpenDropdown(null);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            handleDownloadQuizResults(quiz.id);
                            setOpenDropdown(null);
                          }}
                        >
                          Download Results
                        </button>
                        <button
                          className="dropdown-item delete-item"
                          onClick={() => {
                            showDeleteConfirmation(idx);
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
        </div>

        {/* Modals */}
        {showVideoModal && (
          <UploadVideoModal
            onClose={() => setShowVideoModal(false)}
            onUpload={async (video) => {
              // Refetch videos to get populated subject data
              try {
                const response = await fetch(`/api/v1/videos/class/${className}`, {
                  credentials: "include",
                });
                if (response.ok) {
                  const data = await response.json();
                  setUploadedVideos(data.data || []);
                }
              } catch (error) {
                console.error("Error refetching videos:", error);
                // Fallback to adding the video without populated subject
                setUploadedVideos([...uploadedVideos, video]);
              }
            }}
            className={className}
          />
        )}

        {/* Homework modal removed - now handled by HomeworkSection */}

        {showQuizModal && (
          <CreateQuizModal
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            questions={questions}
            addQuestion={addQuestion}
            deleteQuestion={deleteQuestion}
            handleOptionChange={handleOptionChange}
            handleQuestionTextChange={handleQuestionTextChange}
            handleCorrectAnswerSelect={handleCorrectAnswerSelect}
            handleSubmit={handleSubmitQuiz}
            closeModal={() => setShowQuizModal(false)}
            quizSubject={quizSubject}
            setQuizSubject={setQuizSubject}
            teacherSubjects={
              user?.subjects || ["Mathematics", "Science", "English"]
            }
          />
        )}

        {viewQuizModal && selectedQuiz && (
          <QuizViewModal
            quiz={selectedQuiz}
            onClose={() => setViewQuizModal(false)}
          />
        )}


      </div>

      {/* Quiz Delete Confirmation Dialog */}
      {deleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this quiz?</p>
            <div className="confirmation-buttons">
              <button
                onClick={() => handleDeleteQuiz(deleteConfirmation.index)}
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button
                onClick={() =>
                  setDeleteConfirmation({ show: false, index: null })
                }
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Delete Confirmation Dialog */}
      {videoDeleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this video?</p>
            <div className="confirmation-buttons">
              <button
                onClick={() => {
                  handleDeleteVideo(videoDeleteConfirmation.index);
                  setVideoDeleteConfirmation({ show: false, index: null });
                }}
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button
                onClick={() =>
                  setVideoDeleteConfirmation({ show: false, index: null })
                }
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ClassToolPage;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadVideoModal from "../components/modals/UploadVideoModal";
import UploadHomeworkModal from "../components/modals/UploadHomeworkModal";
import CreateQuizModal from "../components/modals/CreateQuizModal";
import QuizViewModal from "../components/modals/QuizViewModal"; // ✅ NEW
import "./ClassToolPage.css";

const ClassToolPage = () => {
  const { user } = useAuth();
  const { className } = useParams();

  // Debug user object
  console.log("User object:", user);
  console.log("User ID:", user?._id);
  console.log("Class name from params:", className);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [uploadedHomework, setUploadedHomework] = useState([]);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewQuizModal, setViewQuizModal] = useState(false); // ✅ For view modal
  const [selectedQuiz, setSelectedQuiz] = useState(null); // ✅ Selected quiz
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    index: null,
  });

  const handleDeleteVideo = (indexToDelete) => {
    setUploadedVideos((prevVideos) =>
      prevVideos.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleDeleteHomework = (indexToDelete) => {
    setUploadedHomework((prev) =>
      prev.filter((_, index) => index !== indexToDelete)
    );
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = (indexToDelete) => {
    setDeleteConfirmation({ show: true, index: indexToDelete });
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

      // Use a more React-friendly approach instead of alert
      // You could use a toast notification library here
      console.log("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      // Use a more React-friendly approach instead of alert
      console.error(`Failed to delete quiz: ${error.message}`);
    } finally {
      // Reset confirmation state
      setDeleteConfirmation({ show: false, index: null });
    }
  };

  // ✅ Quiz logic
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  // Initialize quizSubject with the first subject from user.subjects or a default value
  const [quizSubject, setQuizSubject] = useState(
    user?.subjects?.length > 0 ? user.subjects[0] : "Mathematics"
  );

  // Update quizSubject when user data changes
  useEffect(() => {
    if (user?.subjects?.length > 0 && !quizSubject) {
      setQuizSubject(user.subjects[0]);
    }
  }, [user, quizSubject]);

  // Fetch quizzes for this teacher and class
  useEffect(() => {
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
        console.log(
          `Fetching quizzes for teacher ${userId} and class ${className}`
        );

        const response = await fetch(
          `/api/v1/quizzes/teacher/${userId}/class/${className}`,
          {
            credentials: "include",
          }
        );

        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch quizzes: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched quizzes data:", data);

        if (data && data.data && Array.isArray(data.data.quizzes)) {
          setCreatedQuizzes(
            data.data.quizzes.map((quiz) => ({
              id: quiz._id,
              quizTitle: quiz.title,
              questions: quiz.questions,
              subject: quiz.subject,
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

    fetchQuizzes();
  }, [user, className]);

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

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quiz");
      }

      const result = await response.json();
      console.log("Quiz created successfully:", result);

      // Update local state with the new quiz
      const newQuiz = {
        quizTitle: result.data.quiz.title,
        questions: result.data.quiz.questions,
        id: result.data.quiz._id,
        subject: result.data.quiz.subject,
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
        </div>

        <div className="content-section">
          <h3>Videos</h3>
          <div className="section-body">
            {uploadedVideos.length === 0 && <p></p>}
            {uploadedVideos.map((video, idx) => (
              <div key={idx} className="card">
                <span>{video.title}</span>
                <div className="card-buttons">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteVideo(idx)}
                  >
                    Delete
                  </button>
                  <a
                    className="view-btn"
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="delete-btn">View</button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h3>Assignments</h3>
          <div className="section-body">
            {uploadedHomework.length === 0 ? (
              <p></p>
            ) : (
              uploadedHomework.map((hw, idx) => (
                <div key={idx} className="card">
                  <span>{hw.title}</span>
                  <div className="card-buttons">
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteHomework(idx)}
                    >
                      Delete
                    </button>
                    <a
                      className="view-btn"
                      href={hw.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="delete-btn">View</button>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content-section">
          <h3>Quizzes</h3>
          <div className="section-body">
            {isLoading ? (
              <p>Loading quizzes...</p>
            ) : createdQuizzes.length === 0 ? (
              <p>No quizzes available for this class.</p>
            ) : (
              createdQuizzes.map((quiz, idx) => (
                <div key={quiz.id || idx} className="card">
                  <div className="quiz-info">
                    <span className="quiz-title">{quiz.quizTitle}</span>
                    {quiz.subject && (
                      <span className="quiz-subject">
                        Subject: {quiz.subject}
                      </span>
                    )}
                  </div>
                  <div className="card-buttons">
                    <button
                      className="delete-btn"
                      onClick={() => showDeleteConfirmation(idx)}
                    >
                      Delete
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        setViewQuizModal(true);
                      }}
                    >
                      View
                    </button>
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
            onUpload={(video) => setUploadedVideos([...uploadedVideos, video])}
          />
        )}

        {showHomeworkModal && (
          <UploadHomeworkModal
            onClose={() => setShowHomeworkModal(false)}
            onUpload={(hw) => setUploadedHomework([...uploadedHomework, hw])}
          />
        )}

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
            // user?.subjects || ["Mathematics", "Science", "English"]
          />
        )}

        {viewQuizModal && selectedQuiz && (
          <QuizViewModal
            quiz={selectedQuiz}
            onClose={() => setViewQuizModal(false)}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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

      <Footer />
    </div>
  );
};

export default ClassToolPage;

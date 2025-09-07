import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./SubjectPage.css";
import AssignmentCard from "../components/AssignmentCard";

const SubjectPage = () => {
  const { subjectName } = useParams();
  const { user } = useAuth();

  const [videoMaterials, setVideoMaterials] = useState([]);
  const [homeworkAssignments, setHomeworkAssignments] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState([]);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [submittedQuizTitles, setSubmittedQuizTitles] = useState([]);
  const [activeSubmitted, setActiveSubmitted] = useState(null);

  // Fetch subject data when component mounts
  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setLoading(true);
        setError("");

        const studentClass = user?.classes?.className || user?.classes;
        if (!studentClass) {
          setError("Student class not found");
          return;
        }

        // Fetch all subject data in one request
        const response = await fetch(
          `/api/v1/student/subject/${subjectName}/class/${studentClass}`,
          {
            credentials: "include",
          }
        );
        console.log(response);

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setHomeworkAssignments(data.data.assignments);
          setVideoMaterials(data.data.videos);
          setAvailableQuizzes(data.data.quizzes);
        } else {
          setError("Failed to load subject data");
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
        setError("Failed to load subject data");
      } finally {
        setLoading(false);
      }
    };

    if (user && subjectName) {
      fetchSubjectData();
    }
  }, [user, subjectName]);

  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  const handleUpload = (file) => {
    console.log("Uploading:", file.name);
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setViewOnly(false);
    setQuizModalOpen(true);
  };

  const handleAnswerChange = (qIndex, answer) => {
    setAnswers({ ...answers, [qIndex]: answer });
  };

  const handleSubmitQuiz = () => {
    const total = activeQuiz.questions.length;
    let score = 0;

    activeQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score++;
      }
    });

    // Prevent submission if not all answers are selected
    if (Object.keys(answers).length < total) {
      alert("Please answer all questions before submitting.");
      return;
    }

    console.log(`🎯 Student scored: ${score}/${total}`);

    const submitted = {
      quiz: activeQuiz,
      answers: answers,
      score: score,
      total: total,
    };

    setSubmittedQuizzes([...submittedQuizzes, submitted]);
    setSubmittedQuizTitles([...submittedQuizTitles, activeQuiz.title]);
    setActiveQuiz(null);
    setQuizModalOpen(false);
  };

  const handleViewQuiz = (submitted) => {
    setActiveQuiz(submitted.quiz);
    setAnswers(submitted.answers);
    setActiveSubmitted(submitted);
    setViewOnly(true);
    setQuizModalOpen(true);
  };

  const handleDeleteSubmittedQuiz = (index) => {
    const updated = [...submittedQuizzes];
    const updatedTitles = [...submittedQuizTitles];
    updated.splice(index, 1);
    updatedTitles.splice(index, 1);
    setSubmittedQuizzes(updated);
    setSubmittedQuizTitles(updatedTitles);
  };

  const isQuizSubmitted = (quiz) => submittedQuizTitles.includes(quiz.title);

  return (
    <div>
      <Navbar />

      <div className="subject-container">
        <div className="subject-header">
          <h1 className="subject-n">{subjectName}</h1>
          <h4 className="subject-teacher"></h4>
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Videos</h3>
          {loading ? (
            <p>Loading videos...</p>
          ) : videoMaterials.length === 0 ? (
            <p>No videos available for this subject</p>
          ) : (
            videoMaterials.map((v, i) => (
              <AssignmentCard
                key={v._id || i}
                teacher={v.teacherId?.name || "Unknown Teacher"}
                assignmentTitle={v.title}
                dueDate="No"
                onUpload={null}
                onDownload={() =>
                  window.open(
                    `${process.env.REACT_APP_API_BASE_URL}/api/v1/videos/stream/${v._id}`,
                    "_blank"
                  )
                }
                isVideo
                type="video"
              />
            ))
          )}
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Homeworks</h3>
          {loading ? (
            <p>Loading homeworks...</p>
          ) : homeworkAssignments.length === 0 ? (
            <p>No homeworks available for this subject</p>
          ) : (
            homeworkAssignments.map((a, i) => (
              <AssignmentCard
                key={a.id || i}
                teacher={a.teacher?.name || "Unknown Teacher"}
                assignmentTitle={a.title}
                dueDate={
                  a.deadline
                    ? new Date(a.deadline).toLocaleDateString()
                    : "No deadline"
                }
                onUpload={handleUpload}
                onDownload={() =>
                  window.open(
                    `${process.env.REACT_APP_API_BASE_URL}/api/v1/assignments/download/${a.fileName}`,
                    "_blank"
                  )
                }
              />
            ))
          )}
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Available Quizzes</h3>
          {loading ? (
            <p>Loading quizzes...</p>
          ) : availableQuizzes.length === 0 ? (
            <p>No quizzes available for this subject</p>
          ) : (
            availableQuizzes.map(
              (quiz, i) =>
                !isQuizSubmitted(quiz) && (
                  <div className="assignment-card" key={quiz._id || i}>
                    <strong>{quiz.title}</strong>
                    <button
                      className="ans-btn"
                      onClick={() => handleStartQuiz(quiz)}
                    >
                      Answer
                    </button>
                  </div>
                )
            )
          )}
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Previous Quizzes</h3>
          {submittedQuizzes.map((submitted, i) => (
            <div className="assignment-card" key={i}>
              <strong>{submitted.quiz.title}</strong>
              <div className="buttons">
                <button onClick={() => handleViewQuiz(submitted)}>View</button>
                <button onClick={() => handleDeleteSubmittedQuiz(i)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {quizModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{activeQuiz?.title}</h2>

            {viewOnly && activeSubmitted && (
              <p className="score-text">
                Your score: {activeSubmitted.score}/{activeSubmitted.total}
              </p>
            )}

            {activeQuiz.questions.map((q, idx) => (
              <div key={idx} className="question-block">
                <p>
                  <strong>
                    {idx + 1}. {q.text}
                  </strong>
                </p>
                <div className="option-group column-options">
                  {q.options.map((opt, i) => {
                    const isCorrect = q.correctAnswer === opt;
                    const isSelected = answers[idx] === opt;
                    const isWrong = isSelected && !isCorrect;

                    return (
                      <label
                        key={i}
                        style={{
                          color: viewOnly
                            ? isCorrect
                              ? "green"
                              : isWrong
                              ? "red"
                              : "black"
                            : "black",
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={answers[idx] === opt}
                          disabled={viewOnly}
                          onChange={() => handleAnswerChange(idx, opt)}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {!viewOnly ? (
              <button className="submit-btn" onClick={handleSubmitQuiz}>
                Submit
              </button>
            ) : (
              <button
                className="cancel-btn"
                onClick={() => setQuizModalOpen(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SubjectPage;

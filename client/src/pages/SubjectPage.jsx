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
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [submittedQuizTitles, setSubmittedQuizTitles] = useState([]);
  const [submittedQuizData, setSubmittedQuizData] = useState([]);
  const [activeSubmitted, setActiveSubmitted] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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
          console.log('Subject data:', data);
          console.log('Assignments:', data.data.assignments);
          setHomeworkAssignments(data.data.assignments);
          setVideoMaterials(data.data.videos);
          setAvailableQuizzes(data.data.quizzes);

          // Fetch submission status for each assignment
          const submissionPromises = data.data.assignments.map(
            async (assignment) => {
              const assignmentId = assignment.id || assignment._id;
              try {
                const submissionResponse = await fetch(
                  `/api/v1/submissions/assignment/${assignmentId}`,
                  { credentials: "include" }
                );
                if (submissionResponse.ok) {
                  const submissionData = await submissionResponse.json();
                  return { [assignmentId]: submissionData.data };
                }
              } catch (error) {
                console.log(
                  "No submission found for assignment:",
                  assignmentId
                );
              }
              return { [assignmentId]: null };
            }
          );

          const submissionResults = await Promise.all(submissionPromises);
          const submissionsMap = submissionResults.reduce(
            (acc, curr) => ({ ...acc, ...curr }),
            {}
          );
          setSubmissions(submissionsMap);

          // Set submitted quiz titles and data from backend
          const completedQuizzes = data.data.quizzes.filter(
            (quiz) => quiz.isCompleted
          );
          const submittedTitles = completedQuizzes.map((quiz) => quiz.title);
          const submittedData = completedQuizzes.map((quiz) => {
            // Convert backend format to frontend format
            const frontendAnswers = {};
            if (quiz.result && quiz.result.answers) {
              quiz.result.answers.forEach((answer, index) => {
                frontendAnswers[index] = answer.selectedOption;
              });
            }
            return {
              quiz: quiz,
              answers: frontendAnswers,
              score: quiz.result?.score || 0,
              total: quiz.result?.totalQuestions || 0,
            };
          });

          setSubmittedQuizTitles(submittedTitles);
          setSubmittedQuizData(submittedData);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.homework-dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  const handleUpload = (file) => {
    // This function is now handled within AssignmentCard component
    console.log("Uploading:", file.name);
  };

  const handleStartQuiz = (quiz) => {
    console.log("Starting quiz:", quiz);
    setActiveQuiz(quiz);
    setAnswers({});
    setViewOnly(false);
    setQuizSubmitted(false);
    setQuizModalOpen(true);
  };

  const handleAnswerChange = (qIndex, answer) => {
    setAnswers({ ...answers, [qIndex]: answer });
  };

  const handleSubmitQuiz = async () => {
    const total = activeQuiz.questions.length;
    let score = 0;

    // Prevent submission if not all answers are selected
    if (Object.keys(answers).length < total) {
      alert("Please answer all questions before submitting.");
      return;
    }

    // Format answers according to quiz result model
    const formattedAnswers = activeQuiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswerIndex;
      if (isCorrect) score++;

      return {
        questionId: q._id,
        selectedOption: answers[i],
        isCorrect: isCorrect,
      };
    });

    const quizResult = {
      quizId: activeQuiz._id,
      answers: formattedAnswers,
      score: score,
      totalQuestions: total,
    };

    try {
      const response = await fetch("/api/v1/quizzes/submit-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(quizResult),
      });

      if (response.ok) {
        console.log(`🎯 Student scored: ${score}/${total}`);

        const submitted = {
          quiz: activeQuiz,
          answers: answers,
          score: score,
          total: total,
        };

        setSubmittedQuizTitles([...submittedQuizTitles, activeQuiz.title]);
        setSubmittedQuizData([...submittedQuizData, submitted]);
        setActiveSubmitted(submitted);
        setQuizSubmitted(true);
        setViewOnly(true);
      } else {
        alert("Failed to submit quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  const isQuizSubmitted = (quiz) =>
    quiz.isCompleted || submittedQuizTitles.includes(quiz.title);

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
              <div key={a.id || i} className="assignment-card">
                <div>
                  <h4>
                    {a.teacher?.name || "Unknown Teacher"} | {a.title}
                  </h4>
                  <p>Due date: {a.deadline ? new Date(a.deadline).toLocaleDateString() : "No deadline"}</p>
                  {submissions[a.id || a._id] && (
                    <p style={{ color: 'green', fontSize: '12px' }}>
                      Submitted: {submissions[a.id || a._id].originalFileName}
                    </p>
                  )}
                </div>
                <div className="homework-dropdown-container">
                  <button
                    className="homework-dropdown-btn"
                    onClick={() => {
                      console.log('Assignment:', a.id || a._id, 'Submission:', submissions[a.id || a._id]);
                      setOpenDropdown(openDropdown === `homework-${i}` ? null : `homework-${i}`);
                    }}
                  >
                    Options ▼
                  </button>
                  {openDropdown === `homework-${i}` && (
                    <div className="homework-dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          window.open(
                            `http://localhost:8000/api/v1/assignments/download/${a.fileName}`,
                            "_blank"
                          );
                          setOpenDropdown(null);
                        }}
                      >
                        Download Assignment
                      </button>
                      {submissions[a.id || a._id] ? (
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            window.open(
                              `http://localhost:8000/api/v1/submissions/download/${submissions[a.id || a._id].fileName}`,
                              "_blank"
                            );
                            setOpenDropdown(null);
                          }}
                        >
                          View My Submission
                        </button>
                      ) : (
                        <button
                          className="dropdown-item upload-item"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf';
                            input.onchange = async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('pdf', file);
                                try {
                                  const response = await fetch(`/api/v1/submissions/assignment/${a.id || a._id}`, {
                                    method: 'POST',
                                    credentials: 'include',
                                    body: formData
                                  });
                                  if (response.ok) {
                                    const data = await response.json();
                                    setSubmissions(prev => ({ ...prev, [a.id || a._id]: data.data }));
                                    alert('Homework submitted successfully!');
                                  } else {
                                    const error = await response.json();
                                    alert(error.message || 'Failed to submit homework');
                                  }
                                } catch (error) {
                                  alert('Failed to submit homework');
                                }
                              }
                            };
                            input.click();
                            setOpenDropdown(null);
                          }}
                        >
                          Upload Homework
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Quizzes</h3>
          {loading ? (
            <p>Loading quizzes...</p>
          ) : availableQuizzes.length === 0 ? (
            <p>No quizzes available for this subject</p>
          ) : (
            availableQuizzes.map((quiz, i) => (
              <div className="assignment-card" key={quiz._id || i}>
                <strong>{quiz.title}</strong>
                {isQuizSubmitted(quiz) ? (
                  <button
                    className="completed-status"
                    onClick={() => {
                      const submittedQuiz = submittedQuizData.find(
                        (sq) => sq.quiz.title === quiz.title
                      );
                      if (submittedQuiz) {
                        setActiveQuiz(submittedQuiz.quiz);
                        setAnswers(submittedQuiz.answers);
                        setActiveSubmitted(submittedQuiz);
                        setViewOnly(true);
                        setQuizSubmitted(false);
                        setQuizModalOpen(true);
                      }
                    }}
                  >
                    View Results
                  </button>
                ) : (
                  <button
                    className="ans-btn"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    Answer
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {quizModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{activeQuiz?.title}</h2>

            {(viewOnly && activeSubmitted) || quizSubmitted ? (
              <p className="score-text">
                Your score: {activeSubmitted?.score || 0}/
                {activeSubmitted?.total || activeQuiz?.questions?.length || 0}
              </p>
            ) : null}

            {activeQuiz?.questions?.map((q, idx) => (
              <div key={idx} className="question-block">
                <p>
                  <strong>
                    {idx + 1}. {q.questionText || q.text}
                  </strong>
                </p>
                <div className="option-group column-options">
                  {q.options?.map((opt, i) => {
                    const isCorrect = q.correctAnswerIndex === i;
                    const isSelected = answers[idx] === i;
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
                          fontWeight: isSelected ? "bold" : "normal",
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={i}
                          checked={answers[idx] === i}
                          onChange={() =>
                            !viewOnly && handleAnswerChange(idx, i)
                          }
                          disabled={viewOnly}
                          style={{ marginRight: "10px" }}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="modal-buttons">
              {!quizSubmitted && !viewOnly ? (
                <>
                  <button className="submit-btn" onClick={handleSubmitQuiz}>
                    Submit
                  </button>
                  <button
                    className="close-btn"
                    onClick={() => setQuizModalOpen(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="close-btn"
                  onClick={() => setQuizModalOpen(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SubjectPage;

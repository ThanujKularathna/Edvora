import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './SubjectPage.css';
import AssignmentCard from '../components/AssignmentCard';

const SubjectPage = () => {
  const { subjectName } = useParams();

  const videoMaterials = [
    {
      teacher: 'Dimuth Kalpage',
      title: 'Maths Video 2',
      fileUrl: 'http://localhost:5000/files/video02.mp4',
    },
  ];

  const homeworkAssignments = [
    {
      teacher: 'Sepalika Gunawardhana',
      title: 'Assignment 01',
      dueDate: 'July/10/25',
      fileUrl: 'http://localhost:5000/files/assignment01.pdf',
    },
  ];

  const availableQuizzes = [
    {
      title: 'Algebra Quiz',
      questions: [
        {
          text: 'What is 5 + 3?',
          options: ['6', '7', '8', '9'],
          correctAnswer: '8',
        },
        {
          text: 'What is 2 x 4?',
          options: ['6', '7', '8', '10'],
          correctAnswer: '8',
        },
      ],
    },
  ];

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState([]);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [submittedQuizTitles, setSubmittedQuizTitles] = useState([]);
  const [activeSubmitted, setActiveSubmitted] = useState(null);

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  const handleUpload = (file) => {
    console.log('Uploading:', file.name);
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
      alert('Please answer all questions before submitting.');
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
          <h4 className="subject-teacher">Sepalika Gunawardhana</h4>
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Videos</h3>
          {videoMaterials.map((v, i) => (
            <AssignmentCard
              key={i}
              teacher={v.teacher}
              assignmentTitle={v.title}
              dueDate="No"
              onUpload={null}
              onDownload={() => handleDownload(v.fileUrl)}
              isVideo
            />
          ))}
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Homeworks</h3>
          {homeworkAssignments.map((a, i) => (
            <AssignmentCard
              key={i}
              teacher={a.teacher}
              assignmentTitle={a.title}
              dueDate={a.dueDate}
              onUpload={handleUpload}
              onDownload={() => handleDownload(a.fileUrl)}
            />
          ))}
        </div>

        <div className="section-block">
          <h3 className="sub-page-title">Available Quizzes</h3>
          {availableQuizzes.map(
            (quiz, i) =>
              !isQuizSubmitted(quiz) && (
                <div className="assignment-card" key={i}>
                  <strong>{quiz.title}</strong>
                  <button className="ans-btn" onClick={() => handleStartQuiz(quiz)}>
                    Answer
                  </button>
                </div>
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
                <button onClick={() => handleDeleteSubmittedQuiz(i)}>Delete</button>
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
              <p className="score-text">Your score: {activeSubmitted.score}/{activeSubmitted.total}</p>
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
                              ? 'green'
                              : isWrong
                              ? 'red'
                              : 'black'
                            : 'black',
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
              <button className="cancel-btn" onClick={() => setQuizModalOpen(false)}>
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

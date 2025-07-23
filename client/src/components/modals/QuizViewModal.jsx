import React from "react";
import "../../styles/Modal.css";

const QuizViewModal = ({ quiz, onClose }) => {
  if (!quiz) return null;

  // Debug quiz structure
  console.log("Quiz in view modal:", quiz);
  if (quiz.questions && quiz.questions.length > 0) {
    console.log("First question:", quiz.questions[0]);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{quiz.quizTitle}</h2>
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="question-block">
            <h4>
              Q{i + 1}: {q.questionText}?
            </h4>
            <ul>
              {q.options.map((opt, idx) => (
                <li key={idx}>
                  {opt}{" "}
                  {(q.correctAnswer === idx ||
                    q.correctAnswerIndex === idx) && <strong>✓</strong>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default QuizViewModal;

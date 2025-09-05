import React from "react";
import "../../styles/Modal.css";

const CreateQuizModal = ({
  quizTitle,
  setQuizTitle,
  questions,
  addQuestion,
  deleteQuestion,
  handleOptionChange,
  handleQuestionTextChange,
  handleCorrectAnswerSelect,
  handleSubmit,
  closeModal,
  quizSubject,
  setQuizSubject,
  teacherSubjects,
}) => {
  // Ensure questions is always an array
  const safeQuestions = Array.isArray(questions) ? questions : [];

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Create Quiz</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter quiz title"
            value={quizTitle || ""}
            onChange={(e) => setQuizTitle(e.target.value)}
            required
          />

          <div className="subject-select">
            <label htmlFor="subject">Subject:</label>
            <select
              id="subject"
              value={quizSubject}
              onChange={(e) => setQuizSubject(e.target.value)}
              required
            >
              {teacherSubjects.map((subject) => (
                <option key={subject._id || subject} value={subject._id || subject}>
                  {subject.name || subject}
                </option>
              ))}
            </select>
          </div>

          {safeQuestions.map((q, idx) => (
            <div key={q.id} className="question-block">
              <h3>Question {idx + 1}</h3>
              <button
                type="button"
                className="delete-btn"
                onClick={() => deleteQuestion(q.id)}
              >
                Delete
              </button>
              <textarea
                placeholder="Enter question"
                value={q.text || ""}
                onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                required
              />
              {Array.isArray(q.options) &&
                q.options.map((opt, i) => (
                  <div key={i} className="option-block">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctAnswer === i}
                      onChange={() => handleCorrectAnswerSelect(q.id, i)}
                      required
                    />
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt || ""}
                      onChange={(e) =>
                        handleOptionChange(q.id, i, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
            </div>
          ))}

          <div className="modal-action-buttons">
            <button type="button" onClick={addQuestion}>
              Add Question
            </button>
            {safeQuestions.length > 0 && (
              <button type="submit">Submit Quiz</button>
            )}
            <button type="button" onClick={closeModal} className="close-btn">
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;

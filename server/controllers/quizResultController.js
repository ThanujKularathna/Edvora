const PDFDocument = require('pdfkit');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const QuizResult = require('../models/quizResultModel');
const Quiz = require('../models/quizModel');

exports.submitQuizAnswers = catchAsync(async (req, res, next) => {
  const { quizId } = req.params;
  const { studentId, answers } = req.body;

  // Find the quiz
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  let score = 0;
  const processedAnswers = answers.map((answer) => {
    const question = quiz.questions.find(
      (q) => q._id.toString() === answer.questionId
    );

    const isCorrect =
      question && question.correctAnswerIndex === answer.selectedOption * 1;
    if (isCorrect) score += 1;
    return {
      ...answer,
      isCorrect
    };
  });

  // Create or update quiz result
  const result = await QuizResult.findOneAndUpdate(
    { quizId, studentId },
    {
      answers: processedAnswers,
      score,
      totalQuestions: quiz.questions.length,
      submittedAt: Date.now()
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Convert to plain object and remove duplicate IDs
  const resultObj = result.toObject();
  if (resultObj.answers) {
    resultObj.answers = resultObj.answers.map((answer) => {
      const { id, ...answerWithoutId } = answer;
      return answerWithoutId;
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      result: resultObj
    }
  });
});

/**
 * Download quiz results as PDF
 * @route GET /api/v1/quizzes/:quizId/results/download
 */

exports.downloadQuizResults = catchAsync(async (req, res, next) => {
  const { quizId } = req.params;

  // Find the quiz
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return next(new AppError('Quiz not found', 404));
  }

  const results = await QuizResult.find({ quizId }).populate({
    path: 'studentId',
    select: 'name'
  });

  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=quiz-results-${quiz.title}-${quiz.class}.pdf`
  );

  doc.pipe(res);

  // Add content to the PDF
  doc
    .fontSize(20)
    .text(`Quiz Results Report - ${quiz.subject}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Class: ${quiz.class}`);
  doc.text(`Quiz Title: ${quiz.title}`);
  doc.text(`Total Questions: ${quiz.questions.length}`);
  doc.text(`Total Participants: ${results.length}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  const tableTop = doc.y;
  const tableLeft = 50;
  const colWidths = [40, 200, 120, 100]; // Adjusted widths to accommodate new column

  // Table headers
  doc.font('Helvetica-Bold');
  doc.text('No.', tableLeft, tableTop, {
    width: colWidths[0],
    align: 'center'
  });
  doc.text('Student Name', tableLeft + colWidths[0], tableTop);
  doc.text(
    'Correct Answers',
    tableLeft + colWidths[0] + colWidths[1],
    tableTop,
    { width: colWidths[2], align: 'center' }
  );
  doc.text(
    'Marks (%)',
    tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
    tableTop,
    { width: colWidths[3], align: 'center' }
  );
  doc.moveDown();

  // Table rows
  doc.font('Helvetica');
  let rowTop = doc.y;

  results.forEach((result, index) => {
    // Calculate percentage score
    const percentage = (result.score / result.totalQuestions) * 100;

    doc.text(index + 1, tableLeft, rowTop, {
      width: colWidths[0],
      align: 'center'
    });
    doc.text(result.studentId.name, tableLeft + colWidths[0], rowTop);
    doc.text(
      `${result.score}`,
      tableLeft + colWidths[0] + colWidths[1],
      rowTop,
      { width: colWidths[2], align: 'center' }
    );
    doc.text(
      `${percentage.toFixed(2)}%`,
      tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
      rowTop,
      { width: colWidths[3], align: 'center' }
    );
    rowTop = doc.y + 15;
    doc.moveDown();
  });

  // Finalize the PDF
  doc.end();
});

const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'public', 'examen_temas_lean.md');
const content = fs.readFileSync(mdPath, 'utf8');

// Module mapping as defined by user requirements:
// Lean Basics 1 → Preguntas 21-30
// 5S+1 → Preguntas 11-20
// 5 Why → Preguntas 1-10
// Small Group Activities → Preguntas 31-40
// Seven Ways → Preguntas 41-50

const courseMap = {
  1: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  2: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  3: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  4: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  5: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  6: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  7: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  8: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  9: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },
  10: { courseId: '5-whys', name: '5 Whys', moduleNum: 1 },

  11: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  12: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  13: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  14: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  15: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  16: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  17: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  18: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  19: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },
  20: { courseId: '5s-1', name: '5S + 1', moduleNum: 2 },

  21: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  22: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  23: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  24: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  25: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  26: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  27: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  28: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  29: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },
  30: { courseId: 'lean-basics-1', name: 'Lean Basics 1', moduleNum: 3 },

  31: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  32: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  33: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  34: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  35: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  36: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  37: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  38: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  39: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },
  40: { courseId: 'sga-guide', name: 'Small Group Activities (SGA) Guide', moduleNum: 4 },

  41: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  42: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  43: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  44: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  45: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  46: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  47: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  48: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  49: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
  50: { courseId: '7-ways', name: '7 Ways', moduleNum: 5 },
};

// Course ordering
const courseOrder = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];

const questionBlocks = content.split(/### Pregunta\s+(\d+)/i);
const parsedQuestions = [];

for (let i = 1; i < questionBlocks.length; i += 2) {
  const qNum = parseInt(questionBlocks[i], 10);
  const block = questionBlocks[i + 1];

  const optAIndex = block.search(/-\s*A\)/i);
  if (optAIndex === -1) {
    console.error(`Missing options for question ${qNum}`);
    continue;
  }

  const qText = block.substring(0, optAIndex).trim();

  const optAMatch = block.match(/-\s*A\)\s*(.*?)(?=\n-\s*B\))/is);
  const optBMatch = block.match(/-\s*B\)\s*(.*?)(?=\n-\s*C\))/is);
  const optCMatch = block.match(/-\s*C\)\s*(.*?)(?=\n-\s*D\))/is);
  const optDMatch = block.match(/-\s*D\)\s*(.*?)(?=\n\n|\n>\s*\*\*Respuesta)/is);

  const optA = optAMatch ? optAMatch[1].trim() : '';
  const optB = optBMatch ? optBMatch[1].trim() : '';
  const optC = optCMatch ? optCMatch[1].trim() : '';
  const optD = optDMatch ? optDMatch[1].trim() : '';

  const correctMatch = block.match(/>\s*\*\*Respuesta correcta:\*\*\s*\*\*([A-D])\)/i);
  const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : '';
  const letterToIndex = { A: 0, B: 1, C: 2, D: 3 };
  const correctIndex = letterToIndex[correctLetter];

  const explMatch = block.match(/>\s*\*Explicaci[óo]n:\*\s*(.*?)(?=\n\n|\n---|\n###|$)/is);
  const explanation = explMatch ? explMatch[1].replace(/[\r\n]+/g, ' ').trim() : '';

  const meta = courseMap[qNum];
  if (!meta) {
    console.error(`No course mapping for question ${qNum}`);
    continue;
  }

  parsedQuestions.push({
    questionNumber: qNum,
    courseId: meta.courseId,
    courseName: meta.name,
    moduleNum: meta.moduleNum,
    id: `${meta.courseId}-q${qNum}`,
    text: qText,
    options: [optA, optB, optC, optD],
    correctOptionIndex: correctIndex,
    correctLetter,
    points: 10,
    explanation
  });
}

// Group into Exams
const examsMap = {};
courseOrder.forEach(cId => {
  examsMap[cId] = {
    courseId: cId,
    minScore: 80,
    questions: []
  };
});

parsedQuestions.forEach(q => {
  if (examsMap[q.courseId]) {
    examsMap[q.courseId].questions.push({
      id: q.id,
      questionNumber: q.questionNumber,
      text: q.text,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      points: q.points,
      explanation: q.explanation
    });
  }
});

const defaultExams = courseOrder.map(cId => examsMap[cId]);

// Write output JSON files
const srcDataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(srcDataDir)) {
  fs.mkdirSync(srcDataDir, { recursive: true });
}

const srcJsonPath = path.join(srcDataDir, 'exams.json');
fs.writeFileSync(srcJsonPath, JSON.stringify(defaultExams, null, 2), 'utf8');

const publicJsonPath = path.join(__dirname, '..', 'public', 'exams.json');
fs.writeFileSync(publicJsonPath, JSON.stringify(defaultExams, null, 2), 'utf8');

console.log(`[parse_exams] Processed ${parsedQuestions.length} questions across ${defaultExams.length} courses.`);
defaultExams.forEach(e => {
  console.log(` - ${e.courseId}: ${e.questions.length} questions (MinScore: ${e.minScore})`);
});
console.log(`[parse_exams] Generated:`);
console.log(`   -> ${srcJsonPath}`);
console.log(`   -> ${publicJsonPath}`);

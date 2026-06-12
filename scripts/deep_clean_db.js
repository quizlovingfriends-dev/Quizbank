const fs = require('fs');

// 1. Read the file
const fileContent = fs.readFileSync('d:/QUIZBANK/data/questions.js', 'utf8');

// 2. Extract the array content. We'll evaluate it to an actual JS object.
// We need to be careful to extract the array correctly.
let dataToEval = fileContent;
if (!dataToEval.includes('module.exports')) {
    dataToEval += '\nmodule.exports = QUIZ_QUESTIONS;';
}

let questions;
try {
    // A bit hacky but works for valid JS objects
    questions = eval(fileContent + '\nQUIZ_QUESTIONS;');
} catch (e) {
    console.error("Failed to parse questions.js:", e);
    process.exit(1);
}

let originalLength = questions.length;
let removedCount = 0;
let modifiedCount = 0;

// Helper to fix text
function fixText(text, isAnswer) {
    if (!text) return text;
    let orig = text;
    
    // Strip leading "0 " or standalone numbers like "12. " at the start
    text = text.replace(/^(?:[0-9]+[\.\)]?\s*)+/, '');
    
    // Replace " 0 " inside with " "
    text = text.replace(/ 0 /g, ' ');
    
    // Replace "I0" with "10"
    text = text.replace(/I0/g, '10');
    
    // Odd characters
    text = text.replace(/\(s of Prey/g, '(s) of Prey');
    
    // Answer cleanup for fragments
    if (isAnswer && text.length > 30) {
        const fragments = ['TdM', 'AlRLIFT Ad', 'MORI', 'A 1'];
        for (let frag of fragments) {
            const idx = text.indexOf(frag);
            if (idx !== -1) {
                text = text.substring(0, idx).trim();
            }
        }
    }
    
    if (text !== orig) modifiedCount++;
    return text;
}

const cleanedQuestions = [];

for (let q of questions) {
    if (!q || !q.question) {
        console.log("Removing malformed object without 'question' property.");
        removedCount++;
        continue;
    }
    let qText = q.question.text ? q.question.text.trim() : "";
    let aText = q.answer && q.answer.text ? q.answer.text.trim() : "";
    
    // Check if it's a garbage fragment:
    // Single line containing RIGHT or WRONG, and very short.
    const isSingleLine = !qText.includes('\n');
    const hasRightWrong = qText.includes('RIGHT') || qText.includes('WRONG');
    
    if (isSingleLine && hasRightWrong && qText.length < 50) {
        console.log(`Removing fragment: ${qText}`);
        removedCount++;
        continue; // Skip this question
    }
    
    // Check for "ID the company" without context
    if (qText === "ID the company" || qText === "ID the company.") {
        console.log(`Removing contextless: ${qText}`);
        removedCount++;
        continue;
    }

    // Apply fixes
    q.question.text = fixText(q.question.text, false);
    q.answer.text = fixText(q.answer.text, true);
    if (q.funda && q.funda.text) {
        q.funda.text = fixText(q.funda.text, false);
    }
    
    cleanedQuestions.push(q);
}

// Re-assign IDs sequentially to fix duplicates
cleanedQuestions.forEach((q, index) => {
    q.id = index + 1;
});

console.log(`Removed ${removedCount} garbage questions.`);
console.log(`Fixed text in ${modifiedCount} fields.`);
console.log(`New total: ${cleanedQuestions.length}`);

// Reconstruct the file string
// We want to format it nicely.
let outputStr = 'const QUIZ_QUESTIONS = [\n';

cleanedQuestions.forEach(q => {
    // Stringify with formatting, but we need to remove quotes around keys to keep it looking like original JS
    let jsonStr = JSON.stringify(q, null, 2);
    // Remove quotes from keys
    jsonStr = jsonStr.replace(/"([^"]+)":/g, '$1:');
    
    // Adjust indentation
    let indented = jsonStr.split('\n').map(line => '  ' + line).join('\n');
    outputStr += indented + ',\n';
});

outputStr += '];\n';

fs.writeFileSync('d:/QUIZBANK/data/questions.js', outputStr, 'utf8');
console.log("questions.js has been cleaned and rewritten.");

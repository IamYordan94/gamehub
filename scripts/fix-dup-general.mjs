// Replace cross-category duplicate questions in the general bank with fresh ones.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'scripts', 'quiz-bank', 'general.json');

const REPLACEMENTS = [
  { id: 'gen-008', difficulty: 1, question: 'What color do you get when you mix blue and yellow paint?', options: ['Green', 'Purple', 'Orange', 'Brown'], answer: 0 },
  { id: 'gen-002', difficulty: 1, question: 'How many minutes are there in one hour?', options: ['60', '30', '90', '45'], answer: 0 },
  { id: 'gen-004', difficulty: 1, question: 'What do honeybees make?', options: ['Honey', 'Milk', 'Bread', 'Cheese'], answer: 0 },
  { id: 'gen-006', difficulty: 1, question: 'Which of these is a fruit?', options: ['Strawberry', 'Potato', 'Onion', 'Carrot'], answer: 0 },
  { id: 'gen-037', difficulty: 2, question: "In a web address, what does 'www' stand for?", options: ['World Wide Web', 'World Weather Watch', 'Wide Web World', 'Web World Wide'], answer: 0 },
  { id: 'gen-028', difficulty: 2, question: 'Which country is considered the birthplace of pizza?', options: ['Italy', 'France', 'Greece', 'Spain'], answer: 0 },
  { id: 'gen-025', difficulty: 2, question: "Which animal is traditionally called the 'king of the jungle'?", options: ['Lion', 'Tiger', 'Elephant', 'Bear'], answer: 0 },
  { id: 'gen-029', difficulty: 2, question: 'Which instrument is used to measure temperature?', options: ['Thermometer', 'Barometer', 'Speedometer', 'Odometer'], answer: 0 },
  { id: 'gen-053', difficulty: 3, question: 'Which language has the most native speakers in the world?', options: ['Mandarin Chinese', 'English', 'Spanish', 'Hindi'], answer: 0 },
  { id: 'gen-054', difficulty: 3, question: 'Which Dutch painter famously cut off part of his ear?', options: ['Vincent van Gogh', 'Rembrandt', 'Pablo Picasso', 'Claude Monet'], answer: 0 },
  { id: 'gen-043', difficulty: 3, question: 'What is the rarest blood type?', options: ['AB negative', 'O negative', 'A positive', 'B positive'], answer: 0 },
  { id: 'gen-050', difficulty: 3, question: 'Which company created the first iPhone?', options: ['Apple', 'Samsung', 'Nokia', 'Microsoft'], answer: 0 },
  { id: 'gen-044', difficulty: 3, question: 'What is the fear of spiders called?', options: ['Arachnophobia', 'Claustrophobia', 'Acrophobia', 'Agoraphobia'], answer: 0 },
  { id: 'gen-042', difficulty: 3, question: 'Which fictional detective lived at 221B Baker Street?', options: ['Sherlock Holmes', 'Hercule Poirot', 'Miss Marple', 'James Bond'], answer: 0 },
  { id: 'gen-048', difficulty: 3, question: "What color is a polar bear's skin?", options: ['Black', 'White', 'Pink', 'Grey'], answer: 0 },
  { id: 'gen-057', difficulty: 3, question: 'What is the fear of small enclosed spaces called?', options: ['Claustrophobia', 'Arachnophobia', 'Acrophobia', 'Agoraphobia'], answer: 0 },
];

const byId = new Map(REPLACEMENTS.map((r) => [r.id, r]));
const arr = JSON.parse(fs.readFileSync(FILE, 'utf8'));
if (!Array.isArray(arr) || arr.length !== 60) throw new Error('unexpected general.json shape: ' + arr.length);

let replaced = 0;
for (let i = 0; i < arr.length; i++) {
  const rep = byId.get(arr[i].id);
  if (rep) {
    arr[i] = { ...rep };
    replaced++;
  }
}
if (replaced !== REPLACEMENTS.length) throw new Error(`replaced ${replaced}/${REPLACEMENTS.length}`);

fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
console.log(`OK: replaced ${replaced} duplicate questions in general.json`);

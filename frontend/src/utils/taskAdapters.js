/**
 * taskAdapters.js
 *
 * Two-way adapters between backend flat JSON strings and frontend nested objects.
 *
 * Backend shape (TaskResponse):
 *   { id, domain_id, day_number, title, description, video_url, document_url,
 *     notes, resources, mcq_questions (JSON string), coding_prompt (string),
 *     test_cases (JSON string), deadline_days }
 *
 * Frontend shape (TaskObject):
 *   { id, domainId, dayNumber, title, description, videoUrl, documentUrl,
 *     notes, resources, mcqs (array), codingQuestion (object), testCases (array),
 *     deadlineDays }
 */

/**
 * Parse a JSON string safely, returning a fallback value on failure.
 */
function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * adaptTaskFromApi
 * Backend Task → Frontend Task
 *
 * Parses mcq_questions, test_cases from JSON strings.
 * Wraps coding_prompt into a codingQuestion object.
 */
export function adaptTaskFromApi(task) {
  const mcqs = safeJsonParse(task.mcq_questions, []);
  const testCases = safeJsonParse(task.test_cases, []);

  // Normalise MCQ items: backend may store them in various shapes.
  // Expected frontend shape per item:
  //   { id, text, options: [{ label, val, isCorrect? }], correctAnswer? }
  const normalisedMcqs = Array.isArray(mcqs)
    ? mcqs.map((q, idx) => ({
        id: q.id ?? idx + 1,
        text: q.text ?? q.question ?? `Question ${idx + 1}`,
        options: Array.isArray(q.options)
          ? q.options
          : Array.isArray(q.choices)
          ? q.choices.map((c) => ({ label: c, val: c }))
          : [],
        correctAnswer: q.correctAnswer ?? q.correct_answer ?? null,
      }))
    : [];

  return {
    id: task.id,
    domainId: task.domain_id,
    dayNumber: task.day_number,
    title: task.title,
    description: task.description,
    videoUrl: task.video_url ?? null,
    documentUrl: task.document_url ?? null,
    notes: task.notes ?? null,
    resources: task.resources ?? null,
    deadlineDays: task.deadline_days ?? 1,
    // Rich structured fields
    mcqs: normalisedMcqs,
    codingQuestion: task.coding_prompt
      ? {
          prompt: task.coding_prompt,
          testCases,
        }
      : null,
    testCases,
  };
}

/**
 * adaptTaskToApi
 * Frontend Task → Backend TaskCreate payload
 *
 * Stringifies mcqs → mcq_questions, codingQuestion → coding_prompt + test_cases.
 */
export function adaptTaskToApi(task) {
  return {
    domain_id: task.domainId,
    day_number: task.dayNumber,
    title: task.title,
    description: task.description,
    video_url: task.videoUrl ?? null,
    document_url: task.documentUrl ?? null,
    notes: task.notes ?? null,
    resources: task.resources ?? null,
    deadline_days: task.deadlineDays ?? 1,
    mcq_questions: task.mcqs && task.mcqs.length > 0
      ? JSON.stringify(task.mcqs)
      : null,
    coding_prompt: task.codingQuestion?.prompt ?? null,
    coding_solution: task.codingQuestion?.solution ?? null,
    test_cases: task.testCases && task.testCases.length > 0
      ? JSON.stringify(task.testCases)
      : null,
  };
}

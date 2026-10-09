// IGCSE question types and the default generic mark-scheme level descriptors.
// These are defaults only — Ms Lowe can edit the generic templates in-app
// (IgcseMarkSchemeTemplate entity); edited templates pre-fill every new question.

export const QUESTION_TYPES = [
  { value: '4_marker', label: '4 Markers', max: 4 },
  { value: '6_marker', label: '6 Markers', max: 6 },
  { value: '10_marker', label: '10 Markers', max: 10 },
];

const FOUR_MARK = [
  ['Level', 'Description', 'Marks'],
  ['1', 'One mark for each valid point identified or described that addresses the question (up to 4 marks).', '1–4'],
  ['0', 'No creditable response.', '0'],
];

const SIX_MARK = [
  ['Level', 'Description', 'Marks'],
  ['4', 'Explains two reasons.', '6'],
  ['3', 'Explains one reason. Four marks for one explanation, five marks for explanation supported by specific contextual knowledge.', '4–5'],
  ['2', 'Identifies or describes valid reason(s); addresses the question but does not explain. One Level 2 mark for each identification/description.', '2–3'],
  ['1', 'Writes about the topic but does not address the question.', '1'],
  ['0', 'No creditable response.', '0'],
];

const TEN_MARK = [
  ['Level', 'Description', 'Marks'],
  ['5', "Explains both sides and supports a valid judgement on 'how far'. One explanation or more on each side.", '10'],
  ['4', 'Explains both sides. For candidates to be awarded this level they must have one explanation on each side. Seven marks for one explanation on each side; one additional mark for each additional explanation on either side.', '7–9'],
  ['3', 'Explains one side. One Level 3 mark for each explanation.', '4–6'],
  ['2', 'Identifies valid points; addresses the question but does not explain. One Level 2 mark for each identification/description.', '2–3'],
  ['1', 'Writes about the topic but does not address the question.', '1'],
  ['0', 'No creditable response.', '0'],
];

const LEVELS = {
  '4_marker': FOUR_MARK,
  '6_marker': SIX_MARK,
  '10_marker': TEN_MARK,
};

export const genericLevels = (type) => LEVELS[type] || SIX_MARK;
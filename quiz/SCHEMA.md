# Quiz bank schema

One engine (`/quiz/quiz.js`) serves every subject. Each subject lives in a lowercase folder
(`net`, `aa`, `bca`, `ml`, `iot`) containing `bank.json` and `bank.csv`. Release dates come
from `/quiz/schedule.json`: quiz #N of a subject unlocks on the Nth date listed
under its code, at 09:00 IST by default. BCA releases at 11:00 IST (`RELEASE` in quiz.js,
`RELEASE_UTC` in scripts/build_ics.py; keep both in step).

## Subject codes

| Code | Folder | Label |
|------|--------|-------|
| NET | net | Networking |
| AA | aa | Algorithm Analysis |
| BCA | bca | Blockchain & Access Control |
| ML | ml | Machine Learning |
| IOT | iot | Internet of Things |

## bank.json

```json
{
  "title": "Network & Systems Security daily quiz",
  "subject": "Networking",
  "code": "NET",
  "author": "Prasun Chaturvedi",
  "topics": {
    "osi-model": { "title": "OSI model and layer-wise threats", "part": 1 }
  },
  "questions": [ { ...question... } ]
}
```

`topics` maps each `topic` slug to a display title (and an optional `part` number). It may be `{}`.

### Question object (all fields required unless marked optional)

| Field | Type | Rule |
|-------|------|------|
| `id` | string | Permanent ID, independent of day: `<CODE>-<TOPICCODE>-<NNN>`, e.g. `NET-SUBNET-004`. TOPICCODE is short uppercase letters/digits; NNN is 3 digits. Unique across the whole site. Never reuse or renumber. |
| `subject` | string | Subject label, e.g. `"Networking"` |
| `subject_code` | string | `NET`, `AA`, `BCA`, `ML` or `IOT` |
| `quiz_no` | integer | Quiz number (1..number of dates for the subject in schedule.json) |
| `position` | integer | 1..30 within the quiz; Easy first, then Intermediate, then Hard |
| `day` | integer | Same value as `quiz_no` (kept for compatibility) |
| `topic` | string | Topic slug (key in `topics`) |
| `bloom` | string | `Remember`, `Understand`, `Apply`, `Analyse`, `Evaluate` or `Create` |
| `difficulty` | string | `Easy` (Remember/Understand), `Intermediate` (Apply/Analyse), `Hard` (Evaluate/Create) |
| `stem` | string | Question text, plain text (no HTML; the engine escapes it) |
| `options` | array of 4 strings | Exactly four distinct options; no "all/none of the above" |
| `answer` | integer | Index 0-3 of the correct option |
| `explanation` | string | Model answer, 2-4 sentences: why the answer is right and why the tempting distractor is wrong |
| `concept` | string | One-line key concept |
| `ref` | string | Site-relative link to revision notes, e.g. `/learn/osi-model.html`, or `""` if none |
| `source` | string, optional | Citation line, e.g. `"Scenario type: Stallings, Network Security Essentials, ch. 8"` |

Per quiz: 30 questions = 12 Easy + 15 Intermediate + 3 Hard. Spread correct-answer positions evenly.

### Example

```json
{
  "id": "NET-SUBNET-012",
  "subject": "Networking",
  "subject_code": "NET",
  "quiz_no": 3,
  "position": 17,
  "day": 3,
  "topic": "ipv4-addressing",
  "bloom": "Apply",
  "difficulty": "Intermediate",
  "stem": "What is the network address of the host 10.45.77.200/20?",
  "options": ["10.45.77.0", "10.45.64.0", "10.45.72.0", "10.45.80.0"],
  "answer": 1,
  "explanation": "A /20 mask is 255.255.240.0; 77 AND 240 = 64, so the network is 10.45.64.0. 10.45.77.0 wrongly assumes a /24 boundary.",
  "concept": "Network ID = IP AND mask.",
  "ref": "/learn/ipv4-addressing.html",
  "source": "Scenario type: Forouzan, Data Communications and Networking, ch. 19"
}
```

## bank.csv

UTF-8, header row, one row per question, columns in this order:

`id, subject, subject_code, quiz_no, position, day, topic, bloom, difficulty, stem, option_1, option_2, option_3, option_4, answer_index, answer_text, explanation, concept, ref, source`

`answer_index` is 0-based (same as `answer` in JSON).

## schedule.json

```json
{ "NET": ["2026-11-25", "2026-11-26"], "AA": ["2026-11-25"] }
```

Dates are `YYYY-MM-DD`; each unlocks at the subject's release time (default 09:00 IST / 03:30 UTC; BCA 11:00 IST / 05:30 UTC). After editing, run
`python3 scripts/build_ics.py` to regenerate `quiz/<code>/reminders.ics` and `quiz/all.ics`.
- **Further reading (APA 7)**: `/quiz/refs.json` holds `refs` (key → in-text `cite` + full `apa`, `*italics*` marked with asterisks) and per-subject `rules` (first regex matching the question's `topic` wins; `"."` is the fallback). The score page shows a collapsed "Further reading" panel: topics covered with author–date citations, then an alphabetical reference list. Nothing is shown during the quiz. New topics fall back to the subject's core textbooks until a rule is added.

# Quiz build plan, 27 Nov – 3 Dec 2026

Approved by Prasun on 27 Nov 2026. Quizzes go live on schedule without further approval.

Rule: 10 questions a quiz (4 Easy, 5 Intermediate, 1 Hard), three releases a day per subject until 3 Dec.
Slots (IST): NET 09/13/17, AA 10/14/18, BCA 11/15/19, ML 12/16/20, IOT 13/17/21 (scripts/quizlib.py SLOTS).
After 3 Dec: NET Mondays 09:00 (#22–24), BCA one a day 11:00 (#22–39, to 21 Dec). AA/ML/IOT stop at 3 Dec.

Each evening run does the line for that date, then ticks it here.

| Run date | Fix longest-answer bias in quizzes releasing on | New AA, ML, IOT quizzes to write (3 × 10 Qs each) |
|---|---|---|
| [ ] 27 Nov | 29 Nov (#7–9, all five subjects) | 30 Nov (#10–12) |
| [ ] 28 Nov | 30 Nov (NET, BCA #10–12) | 1 Dec (#13–15) |
| [ ] 29 Nov | 1 Dec (NET, BCA #13–15) | 2 Dec (#16–18) |
| [ ] 30 Nov | 2 Dec (NET, BCA #16–18) | 3 Dec (#19–21) |
| [ ] 1 Dec | 3 Dec (NET, BCA #19–21) | none |
| [ ] 2 Dec | NET #22–24 and BCA #22–39 | none; then turn off the scheduled task |

Already done 27 Nov: split of unreleased quizzes into 10-question quizzes; bias fixed in #4–6 (28 Nov).

Tools: `python3 scripts/check_banks.py <first quiz no>` lists problems; `scripts/apply_bias_patch.py <file>`
(dict P: id -> 4 options) and `scripts/patch_one.py <file>` (dict E: id -> {index: text}) apply rewrites;
`python3 scripts/build_ics.py` after any schedule.json change.

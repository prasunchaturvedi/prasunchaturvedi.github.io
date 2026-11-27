#!/usr/bin/env python3
"""One-off (27 Nov 2026): split every unreleased 30-question quiz (#4 onward) into three
10-question quizzes (4 Easy, 5 Intermediate, 1 Hard each) and rebuild schedule.json with
three IST release slots a day from 28 Nov to 3 Dec; leftovers are spaced out after that."""
import json, os, sys
from datetime import date, timedelta
sys.path.insert(0, os.path.dirname(__file__))
import quizlib as L

FIRST_SPLIT = 4
DAYS = [date(2026, 11, 28) + timedelta(d) for d in range(6)]  # 28 Nov .. 3 Dec
sched = json.load(open(os.path.join(L.ROOT, "quiz", "schedule.json")))
for code in L.FOLDERS:
    doc, qs = L.load(code)
    old = sorted({q["quiz_no"] for q in qs if q["quiz_no"] >= FIRST_SPLIT})
    groups = {o: sorted([q for q in qs if q["quiz_no"] == o], key=lambda q: q["position"]) for o in old}
    new_no = FIRST_SPLIT
    for o in old:
        group = groups[o]
        parts = [[], [], []]
        for diff in ("Easy", "Intermediate", "Hard"):
            items = [q for q in group if q["difficulty"] == diff]
            for i, q in enumerate(items):
                parts[i % 3].append(q)
        for k, part in enumerate(parts):
            for pos, q in enumerate(part, 1):
                q["quiz_no"] = new_no + k
                q["position"] = pos
                if "day" in q:
                    q["day"] = new_no + k
        new_no += 3
    L.save(code, doc)
    n_new = new_no - FIRST_SPLIT
    dates = sched[code][:FIRST_SPLIT - 1]
    slots = [f"{d.isoformat()}T{t}" for d in DAYS for t in L.SLOTS[code]]
    dates += slots[:n_new]
    extra = n_new - len(slots[:n_new])
    d = date(2026, 12, 4)
    step = 7 if code == "NET" else 1
    if code == "NET":
        d = date(2026, 12, 7)  # Mondays
    for _ in range(max(0, extra)):
        dates.append(f"{d.isoformat()}T{L.SLOTS[code][0]}")
        d += timedelta(step)
    sched[code] = dates
    print(code, "quizzes", len(dates), "last", dates[-1])
with open(os.path.join(L.ROOT, "quiz", "schedule.json"), "w") as f:
    json.dump(sched, f, indent=1)
    f.write("\n")

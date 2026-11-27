"""Shared helpers for the quiz banks: load/save JSON + CSV in each bank's own layout, and checks."""
import csv
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDERS = {"NET": "net", "AA": "aa", "BCA": "bca", "ML": "ml", "IOT": "iot"}
# Three releases a day per subject (IST), staggered so no two subjects open together.
SLOTS = {"NET": ["09:00", "13:00", "17:00"], "AA": ["10:00", "14:00", "18:00"],
         "BCA": ["11:00", "15:00", "19:00"], "ML": ["12:00", "16:00", "20:00"],
         "IOT": ["13:00", "17:00", "21:00"]}
MIX10 = {"Easy": 4, "Intermediate": 5, "Hard": 1}


def path(code, ext):
    return os.path.join(ROOT, "quiz", FOLDERS[code], "bank." + ext)


def load(code):
    with open(path(code, "json"), encoding="utf-8") as f:
        doc = json.load(f)
    return doc, (doc if isinstance(doc, list) else doc["questions"])


def save(code, doc):
    qs = doc if isinstance(doc, list) else doc["questions"]
    qs.sort(key=lambda q: (q["quiz_no"], q["position"]))
    with open(path(code, "json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")
    with open(path(code, "csv"), encoding="utf-8") as f:
        first = f.readline()
        header = next(csv.reader([first]))
    quoting = csv.QUOTE_ALL if first.startswith('"') else csv.QUOTE_MINIMAL
    with open(path(code, "csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, quoting=quoting)
        w.writerow(header)
        for q in qs:
            row = []
            for h in header:
                if h.startswith("option_"):
                    k = h[7:]
                    i = int(k) - 1 if k.isdigit() else "abcd".index(k)
                    row.append(q["options"][i])
                elif h in ("answer_index", "answer"):
                    row.append(q["answer"])
                elif h == "answer_text":
                    row.append(q["options"][q["answer"]])
                elif h == "day":
                    row.append(q.get("day", q["quiz_no"]))
                elif h == "subject_code":
                    row.append(q.get("subject_code", q.get("code")))
                else:
                    row.append(q.get(h, ""))
            w.writerow(row)


def longest_flag(q):
    """True when the correct option is the unique longest option (a test-wiseness giveaway)."""
    L = [len(o) for o in q["options"]]
    return L[q["answer"]] == max(L) and L.count(max(L)) == 1


def check(code, quizzes=None):
    """Return a list of problems for the given quiz numbers (all if None)."""
    _, qs = load(code)
    probs, ids = [], set()
    by = {}
    for q in qs:
        if q["id"] in ids:
            probs.append("duplicate id " + q["id"])
        ids.add(q["id"])
        by.setdefault(q["quiz_no"], []).append(q)
    for n, group in sorted(by.items()):
        if quizzes and n not in quizzes:
            continue
        if len(group) not in (10, 30):
            probs.append(f"{code} #{n}: {len(group)} questions")
        for q in group:
            o = q["options"]
            if len(o) != 4 or len(set(o)) != 4 or not 0 <= q["answer"] <= 3:
                probs.append(q["id"] + ": options/answer malformed")
            if longest_flag(q):
                probs.append(q["id"] + ": correct option is the unique longest")
    return probs

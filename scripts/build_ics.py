#!/usr/bin/env python3
"""Generate quiz reminder calendars from quiz/schedule.json.

Writes quiz/<folder>/reminders.ics for each subject and quiz/all.ics (combined).
Each quiz unlocks at 09:00 IST (03:30 UTC) unless RELEASE_UTC overrides it (BCA: 11:00 IST). Re-run after editing schedule.json.
"""
import json
import os
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LABELS = {"NET": "Networking", "AA": "Algorithm Analysis", "BCA": "Blockchain & Access Control",
          "ML": "Machine Learning", "IOT": "Internet of Things"}
SITE = "https://prasunchaturvedi.in"
RELEASE_UTC = {"BCA": (5, 30)}  # 11:00 IST; must match RELEASE in quiz/quiz.js


def esc(text):
    return text.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def fold(line):
    """RFC 5545 line folding at 75 octets."""
    out, raw = [], line.encode("utf-8")
    while len(raw) > 75:
        cut = 75 if not out else 74
        while (raw[cut] & 0xC0) == 0x80:  # do not split a UTF-8 sequence
            cut -= 1
        out.append(raw[:cut].decode("utf-8"))
        raw = raw[cut:]
    out.append(raw.decode("utf-8"))
    return "\r\n ".join(out)


def events(code, dates, stamp):
    label, folder = LABELS[code], code.lower()
    url = f"{SITE}/quiz/{folder}/"
    for n, d in enumerate(dates, 1):
        start = datetime.strptime(d, "%Y-%m-%d").replace(hour=RELEASE_UTC.get(code, (3, 30))[0], minute=RELEASE_UTC.get(code, (3, 30))[1], tzinfo=timezone.utc)
        end = start + timedelta(minutes=15)
        yield [
            "BEGIN:VEVENT",
            f"UID:{'nss' if code == 'NET' else folder}-quiz-day{n}@prasunchaturvedi.in",
            f"DTSTAMP:{stamp}",
            f"DTSTART:{start:%Y%m%dT%H%M%SZ}",
            f"DTEND:{end:%Y%m%dT%H%M%SZ}",
            f"SUMMARY:{esc(f'{label} Quiz #{n} is live')}",
            f"DESCRIPTION:{esc(f'{label} daily quiz #{n} (30 questions) is now open: {url}')}",
            f"URL:{url}",
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            f"DESCRIPTION:{esc(f'{label} Quiz #{n} is live')}",
            "TRIGGER:PT0M",
            "END:VALARM",
            "END:VEVENT",
        ]


def calendar(name, blocks):
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//prasunchaturvedi.in//Daily quiz//EN",
             "CALSCALE:GREGORIAN", "METHOD:PUBLISH", f"X-WR-CALNAME:{esc(name)}", "X-WR-TIMEZONE:Asia/Kolkata"]
    for b in blocks:
        lines.extend(b)
    lines.append("END:VCALENDAR")
    return "\r\n".join(fold(l) for l in lines) + "\r\n"


def main():
    with open(os.path.join(ROOT, "quiz", "schedule.json"), encoding="utf-8") as f:
        schedule = json.load(f)
    stamp = "20261124T000000Z"  # fixed so regenerated files only change when the schedule does
    allblocks = []
    for code, dates in schedule.items():
        blocks = list(events(code, dates, stamp))
        allblocks.extend(blocks)
        folder = os.path.join(ROOT, "quiz", code.lower())
        if os.path.isdir(folder):
            with open(os.path.join(folder, "reminders.ics"), "w", encoding="utf-8", newline="") as f:
                f.write(calendar(f"{LABELS[code]} daily quiz", blocks))
            print("wrote", os.path.relpath(os.path.join(folder, "reminders.ics"), ROOT))
    with open(os.path.join(ROOT, "quiz", "all.ics"), "w", encoding="utf-8", newline="") as f:
        f.write(calendar("Daily quizzes by Prasun Chaturvedi", allblocks))
    print("wrote quiz/all.ics")


if __name__ == "__main__":
    main()

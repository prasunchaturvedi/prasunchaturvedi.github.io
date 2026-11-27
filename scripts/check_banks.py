#!/usr/bin/env python3
"""Report bank problems (counts, malformed options, correct option uniquely longest). Optional arg: first quiz number to check."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import quizlib as L
start = int(sys.argv[1]) if len(sys.argv) > 1 else 1
for code in L.FOLDERS:
    _, qs = L.load(code)
    probs = L.check(code, set(range(start, 1000)))
    print(code, len(probs), "problems from quiz #%d" % start)
    for p in probs[:200]:
        print("  ", p)

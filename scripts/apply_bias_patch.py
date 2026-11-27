#!/usr/bin/env python3
"""Apply a distractor-rewrite patch file (dict P: id -> 4 options) to the banks; answer index is kept."""
import runpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import quizlib as L
P = runpy.run_path(sys.argv[1])["P"]
left = dict(P)
for code in L.FOLDERS:
    doc, qs = L.load(code)
    hit = False
    for q in qs:
        if q["id"] in P:
            new = P[q["id"]]
            assert len(new) == 4 and len(set(new)) == 4, q["id"]
            if new[q["answer"]] != q["options"][q["answer"]]:
                print("note: correct text changed", q["id"])
            q["options"] = new
            hit = True
            left.pop(q["id"])
            if L.longest_flag(q):
                print("STILL FLAGGED", q["id"], [len(o) for o in new], "answer", q["answer"])
    if hit:
        L.save(code, doc)
print("unmatched ids:", list(left))

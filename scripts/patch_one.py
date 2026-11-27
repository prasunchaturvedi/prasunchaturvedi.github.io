import sys, os, runpy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import quizlib as L
E_ = runpy.run_path(sys.argv[1])["E"]  # id -> {index: new text}
for code in L.FOLDERS:
    doc, qs = L.load(code); hit = False
    for q in qs:
        if q["id"] in E_:
            for i, t in E_[q["id"]].items():
                q["options"][i] = t
            assert len(set(q["options"])) == 4
            hit = True
            if L.longest_flag(q): print("STILL", q["id"], [len(o) for o in q["options"]], q["answer"])
    if hit: L.save(code, doc)

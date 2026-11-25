/* Daily quiz engine for prasunchaturvedi.in. Vanilla JS, no network calls except the
   same-origin bank.json, no tracking. Progress is stored only in this browser (localStorage). */
(function () {
  "use strict";

  // ---------- configuration ----------
  // Release dates live in /quiz/schedule.json: quiz #N unlocks on the Nth date at the subject's
  // release time (IST). Default 09:00; subjects listed in RELEASE override it.
  var RELEASE = { BCA: "11:00" };
  function releaseTime(code) { return RELEASE[code] || "09:00"; }
  function releaseLabel(code) { var t = releaseTime(code).split(":"), h = +t[0]; return (h % 12 || 12) + ":" + t[1] + (h < 12 ? " AM" : " PM") + " IST"; }
  var DAY_MS = 86400000;
  var SUBJECTS = {
    NET: { code: "NET", folder: "net", label: "Networking", title: "Network & Systems Security" },
    AA: { code: "AA", folder: "aa", label: "Algorithm Analysis", title: "Algorithm Analysis" },
    BCA: { code: "BCA", folder: "bca", label: "Blockchain & Access Control", title: "Blockchain & Access Control" },
    ML: { code: "ML", folder: "ml", label: "Machine Learning", title: "Machine Learning" },
    IOT: { code: "IOT", folder: "iot", label: "Internet of Things", title: "Internet of Things" }
  };
  // Expected success rates used for the design benchmark (not live data).
  var BENCH = { Easy: 0.85, Intermediate: 0.6, Hard: 0.3 };
  var SAMPLE_POSITIONS = [1, 5, 14, 22, 28]; // pre-launch taster from Day 1

  var QUOTES = {
    distinction: [
      ["Well done is better than well said.", "Benjamin Franklin"],
      ["Arise, awake, and stop not till the goal is reached.", "Swami Vivekananda"],
      ["The impediment to action advances action. What stands in the way becomes the way.", "Marcus Aurelius"],
      ["They can conquer who believe they can.", "Virgil"],
      ["Self-trust is the first secret of success.", "Ralph Waldo Emerson"]
    ],
    pass: [
      ["Learning without thought is labour lost; thought without learning is perilous.", "Confucius"],
      ["While we teach, we learn.", "Seneca"],
      ["The journey of a thousand miles begins with a single step.", "Lao Tzu"],
      ["Knowledge is power.", "Francis Bacon"],
      ["He that can have patience can have what he will.", "Benjamin Franklin"]
    ],
    retry: [
      ["It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", "Seneca"],
      ["Waste no more time arguing what a good man should be. Be one.", "Marcus Aurelius"],
      ["Our patience will achieve more than our force.", "Edmund Burke"],
      ["Every noble work is at first impossible.", "Thomas Carlyle"],
      ["Fortune favours the bold.", "Terence"]
    ]
  };

  // ---------- pure helpers (exported for tests) ----------
  // subj.dates = ["YYYY-MM-DD", ...] from schedule.json
  function unlockMs(subj, n) { return Date.parse(subj.dates[n - 1] + "T" + releaseTime(subj.code) + ":00+05:30"); }
  function isUnlocked(subj, n, now, preview) { return n >= 1 && n <= subj.dates.length && (preview || now >= unlockMs(subj, n)); }
  function currentDay(subj, now) {
    var d = 0;
    for (var n = 1; n <= subj.dates.length; n++) { if (now >= unlockMs(subj, n)) d = n; }
    return d; // 0 = before the first quiz (sample mode)
  }
  function nextUnlock(subj, now) {
    for (var n = 1; n <= subj.dates.length; n++) { if (now < unlockMs(subj, n)) return n; }
    return 0;
  }
  function withSchedule(code, schedule) {
    var s = SUBJECTS[code];
    if (!s || !schedule || !schedule[code]) return null;
    var o = {}; for (var k in s) o[k] = s[k];
    o.dates = schedule[code]; o.days = o.dates.length;
    return o;
  }
  function tierFor(pct) {
    if (pct >= 85) return { key: "distinction", label: "Distinction" };
    if (pct >= 60) return { key: "pass", label: "Pass" };
    return { key: "retry", label: "Not yet — retry" };
  }
  function benchmark(qs) {
    var exp = 0;
    qs.forEach(function (q) { exp += BENCH[q.difficulty] || 0.5; });
    var mid = Math.round((exp / qs.length) * 100);
    return { expected: mid, low: Math.max(0, mid - 10), high: Math.min(100, mid + 10) };
  }
  function istDate(ms) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "short", year: "numeric" })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return p.weekday + ", " + p.day + " " + p.month + " " + p.year;
  }
  function countdown(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (d ? d + "d " : "") + h + "h " + m + "m " + sec + "s";
  }
  // Adaptive order: the learner picks the level of the next question.
  var LEVELS = ["Easy", "Intermediate", "Hard"];
  function lvl(q) { var i = LEVELS.indexOf(q.difficulty); return i < 0 ? 1 : i; }
  // qs: the quiz's questions; used: {index:true} already served; target: wanted level index;
  // dir: -1 easier / 0 same / +1 harder (tie-break when the target level is exhausted).
  function pickNext(qs, used, target, dir) {
    var best = -1, bestKey = null;
    qs.forEach(function (q, k) {
      if (used[k]) return;
      var d = Math.abs(lvl(q) - target), side = (lvl(q) - target) * (dir || 1) >= 0 ? 0 : 1;
      var key = [d, side, q.position || k];
      if (!bestKey || key[0] < bestKey[0] || (key[0] === bestKey[0] && (key[1] < bestKey[1] || (key[1] === bestKey[1] && key[2] < bestKey[2])))) { best = k; bestKey = key; }
    });
    return best;
  }
  function hasLevel(qs, used, test) { return qs.some(function (q, k) { return !used[k] && test(lvl(q)); }); }
  // Hook for a future anonymous leaderboard. Returns null until a real data source exists.
  function getPeerStats(day, score) { return null; }

  var api = { SUBJECTS: SUBJECTS, releaseTime: releaseTime, releaseLabel: releaseLabel, unlockMs: unlockMs, isUnlocked: isUnlocked, currentDay: currentDay, nextUnlock: nextUnlock, withSchedule: withSchedule,
    LEVELS: LEVELS, pickNext: pickNext, tierFor: tierFor, benchmark: benchmark, istDate: istDate, countdown: countdown, getPeerStats: getPeerStats, QUOTES: QUOTES };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") return;

  // ---------- browser storage (best effort) ----------
  function load(key, dflt) {
    try { var v = window.localStorage.getItem(key); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; }
  }
  function save(key, val) { try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  // ---------- shared loading ----------
  var params = new URLSearchParams(window.location.search);
  var preview = params.get("preview") === "all";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function getJSON(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { return Array.isArray(j) ? { questions: j } : j; });
  }

  // ---------- hub (quiz/index.html) ----------
  var hub = document.getElementById("quiz-hub");
  if (hub) {
    getJSON("/quiz/schedule.json").then(function (schedule) {
      var codes = Object.keys(SUBJECTS);
      return Promise.all(codes.map(function (c) {
        var s = withSchedule(c, schedule);
        if (!s) return Promise.resolve(null);
        return getJSON("/quiz/" + s.folder + "/bank.json").then(function (doc) {
          s.ready = !!(doc && doc.questions && doc.questions.length); return s;
        }, function () { s.ready = false; return s; });
      })).then(function (list) { renderHub(list.filter(Boolean)); });
    }).catch(function () {
      hub.innerHTML = '<p class="quiz-note" role="alert">The quiz schedule could not be loaded. Please refresh the page.</p>';
    });
  }
  function renderHub(list) {
    var now = Date.now();
    hub.innerHTML = list.map(function (s) {
      var today = currentDay(s, now), next = nextUnlock(s, now);
      var url = "/quiz/play.html?s=" + s.code.toLowerCase();
      var body;
      if (!s.ready) {
        body = '<p class="hub-status">Coming soon</p><p>This subject\u2019s questions are being prepared.</p>';
      } else {
        body = (today ? '<p class="hub-status live">Live today: Quiz #' + today + "</p><p>" + esc(istDate(unlockMs(s, today))) +
          ' · ' + releaseLabel(s.code) + '</p><p><a class="btn btn-primary" href="' + url + "&n=" + today + '">Take Quiz #' + today + "</a></p>"
          : '<p class="hub-status">Starts ' + esc(istDate(unlockMs(s, 1))) + ', ' + releaseLabel(s.code) + '</p><p><a class="btn btn-primary" href="' + url + '">Try the free sample</a></p>') +
          (next ? '<p class="hub-next">Quiz #' + next + ' opens in <strong data-until="' + unlockMs(s, next) + '"></strong></p>' : "<p class=\"hub-next\">All quizzes released.</p>") +
          (today > 1 ? '<p class="hub-archive">Archive: ' + Array.apply(null, Array(today - 1)).map(function (_, k) {
            return '<a href="' + url + "&n=" + (k + 1) + '">#' + (k + 1) + "</a>"; }).join(" ") + "</p>" : "");
      }
      return '<li class="hub-card' + (s.ready ? "" : " is-soon") + '"><h2>' + esc(s.label) + "</h2>" + body + "</li>";
    }).join("");
    var tick = function () {
      Array.prototype.forEach.call(hub.querySelectorAll("[data-until]"), function (el) {
        el.textContent = countdown(parseInt(el.getAttribute("data-until"), 10) - Date.now());
      });
    };
    tick(); setInterval(tick, 1000);
  }

  // ---------- quiz player ----------
  var root = document.getElementById("quiz-app");
  if (!root) return;
  var key = (params.get("s") || root.getAttribute("data-subject") || "net").toUpperCase();
  var subj = null, histKey = "";
  var state = { bank: [], day: 0, qs: [], i: 0, answers: [], started: 0, timer: null, sample: false };
  var storeKey = function (d) { return "quiz:" + subj.code + ":day" + d; };

  var tabs = root.querySelector("[data-tabs]");
  var panel = root.querySelector("[data-panel]");
  var headline = root.querySelector("[data-headline]");

  getJSON("/quiz/schedule.json")
    .then(function (schedule) {
      subj = withSchedule(key, schedule);
      if (!subj) throw new Error("unknown subject");
      histKey = "quiz:" + subj.code + ":history";
      document.title = subj.label + " Quiz | Prasun Chaturvedi";
      return getJSON("/quiz/" + subj.folder + "/bank.json");
    })
    .then(function (doc) {
      state.bank = doc.questions;
      state.topics = doc.topics || {};
      var now = Date.now();
      var today = currentDay(subj, now);
      var want = parseInt(params.get("n") || params.get("day"), 10);
      var day = (want >= 1 && want <= subj.days) ? want : (preview && !today ? 1 : today);
      if (day && !isUnlocked(subj, day, now, preview) && !(want >= 1)) day = today;
      buildTabs(today);
      selectDay(day);
    })
    .catch(function () {
      headline.textContent = subj ? subj.label + " Quiz \u2014 coming soon" : "Quiz";
      panel.innerHTML = '<p class="quiz-note" role="status">' + (subj ? "This quiz is coming soon. " : "") +
        'Please check the <a href="/quiz/">quiz hub</a> for live quizzes.</p>';
    });

  function buildTabs(today) {
    var now = Date.now(), html = "";
    for (var n = 1; n <= subj.days; n++) {
      var open = isUnlocked(subj, n, now, preview);
      html += '<button type="button" class="quiz-tab" data-day="' + n + '" aria-pressed="false">' +
        "#" + n + (open ? "" : ' <span aria-hidden="true">🔒</span><span class="sr">(locked)</span>') +
        (n === today ? ' <span class="sr">(today)</span>' : "") + "</button>";
    }
    tabs.innerHTML = html;
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-day]");
      if (b) selectDay(parseInt(b.getAttribute("data-day"), 10));
    });
  }

  function markTab(day) {
    Array.prototype.forEach.call(tabs.querySelectorAll("button[data-day]"), function (b) {
      b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-day"), 10) === day));
    });
  }

  function setHeadline(day, sample) {
    if (sample) { headline.textContent = subj.label + " Quiz — free sample (Quiz #1 opens " + istDate(unlockMs(subj, 1)) + ", " + releaseLabel(subj.code) + ")"; return; }
    headline.textContent = subj.label + " Quiz #" + day + " — " + istDate(unlockMs(subj, day));
  }

  function selectDay(day) {
    clearInterval(state.timer);
    var now = Date.now();
    if (day === 0) {
      state.sample = true;
      state.day = 1;
      markTab(-1);
      setHeadline(1, true);
      var d1 = state.bank.filter(function (q) { return q.quiz_no === 1; });
      startQuiz(SAMPLE_POSITIONS.map(function (p) { return d1[p - 1]; }), null);
      return;
    }
    state.sample = false;
    state.day = day;
    markTab(day);
    setHeadline(day, false);
    if (!isUnlocked(subj, day, now, preview)) {
      panel.innerHTML = '<div class="quiz-locked"><h2>Quiz #' + day + ' is locked</h2><p>It opens on ' + esc(istDate(unlockMs(subj, day))) +
        ' at ' + releaseLabel(subj.code) + '.</p><p class="quiz-count" aria-live="off">Opens in <strong data-count></strong></p></div>';
      var el = panel.querySelector("[data-count]");
      var tick = function () {
        var left = unlockMs(subj, day) - Date.now();
        if (left <= 0) { clearInterval(state.timer); window.location.reload(); return; }
        el.textContent = countdown(left);
      };
      tick();
      state.timer = setInterval(tick, 1000);
      return;
    }
    var qs = state.bank.filter(function (q) { return q.quiz_no === day; }).sort(function (a, b) { return a.position - b.position; });
    startQuiz(qs, storeKey(day));
  }

  function startQuiz(qs, sk) {
    state.qs = qs;
    state.sk = sk;
    var saved = sk ? load(sk, null) : null;
    if (saved && saved.answers && saved.answers.length) {
      state.answers = saved.answers;
      state.started = saved.started || Date.now();
      state.finished = saved.finished || 0;
    } else {
      state.answers = [];
      state.started = Date.now();
      state.finished = 0;
    }
    state.served = [];
    var served = saved && saved.served;
    if (!served || served.length < state.answers.length) served = state.answers.map(function (_, k) { return k; }); // older saves: sequential
    state.served = served.slice(0, Math.max(state.answers.length, 0));
    state.i = Math.min(state.answers.length, qs.length);
    if (state.i >= qs.length) { showResult(); return; }
    state.served[state.i] = pickNext(qs, usedMap(), state.i ? lvl(qs[state.served[state.i - 1]]) : 0, 0);
    showQuestion();
  }

  function persist() {
    if (state.sk) save(state.sk, { answers: state.answers, served: state.served, started: state.started, finished: state.finished });
  }

  function usedMap() { var u = {}; state.served.forEach(function (k, j) { if (j < state.answers.length || j === state.i) u[k] = true; }); return u; }
  function cur() { return state.qs[state.served[state.i]]; }
  function progressHTML() {
    var n = state.qs.length, done = state.answers.length;
    return '<div class="quiz-progress"><div class="quiz-progress-label">Question ' + Math.min(state.i + 1, n) + " of " + n +
      '</div><div class="quiz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + done +
      '" aria-label="Questions answered"><span style="width:' + (done / n * 100) + '%"></span></div></div>';
  }

  function showQuestion() {
    var q = cur();
    var html = progressHTML() +
      '<article class="quiz-card" aria-labelledby="q-stem">' +
      '<div class="quiz-meta"><span class="badge badge-' + q.difficulty.toLowerCase() + '">' + esc(q.difficulty) + '</span>' +
      '<span class="badge badge-bloom">Bloom: ' + esc(q.bloom) + '</span><span class="quiz-id">ID ' + esc(q.id) + "</span></div>" +
      '<h2 id="q-stem" class="quiz-stem" tabindex="-1">' + esc(q.stem) + "</h2>" +
      '<ol class="quiz-options" role="list">';
    q.options.forEach(function (o, k) {
      html += '<li><button type="button" class="quiz-opt" data-k="' + k + '"><span class="quiz-key" aria-hidden="true">' + (k + 1) +
        "</span><span class=\"quiz-opt-text\">" + esc(o) + '</span><span class="quiz-mark" aria-hidden="true"></span></button></li>';
    });
    html += '</ol><p class="quiz-skip-row"><button type="button" class="btn btn-ghost" data-skip>Skip \u2014 I don\u2019t know</button></p>' +
      '<div class="quiz-feedback" data-feedback aria-live="polite"></div>' +
      '<p class="quiz-hint">Keys: 1–4 to answer, S to skip. After each question: E easier, Enter same level, H harder.</p></article>';
    panel.innerHTML = html;
    panel.querySelector("#q-stem").focus({ preventScroll: true });
    panel.querySelector(".quiz-options").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-k]");
      if (b) answer(parseInt(b.getAttribute("data-k"), 10));
    });
    panel.querySelector("[data-skip]").addEventListener("click", function () { answer(-1); });
  }

  function answer(k) {
    if (state.answers.length > state.i) return; // already answered
    var q = cur();
    var ok = k === q.answer, skipped = k === -1;
    var sk = panel.querySelector("[data-skip]"); if (sk) sk.parentNode.removeChild(sk);
    state.answers.push(k);
    if (state.answers.length === state.qs.length) state.finished = Date.now();
    persist();
    if (skipped) {
      Array.prototype.forEach.call(panel.querySelectorAll(".quiz-opt"), function (b) { b.disabled = true; });
      panel.querySelector("[data-feedback]").innerHTML = '<p class="quiz-verdict skip"><span aria-hidden="true">\u21b7</span> Skipped. ' +
        'The answer stays hidden; you can try this question again at the end.</p>' + nextControls(state.i === state.qs.length - 1, lvl(q));
      wireNext(); return;
    }
    Array.prototype.forEach.call(panel.querySelectorAll(".quiz-opt"), function (b) {
      var bk = parseInt(b.getAttribute("data-k"), 10);
      b.disabled = true;
      var mark = b.querySelector(".quiz-mark");
      if (bk === q.answer) { b.classList.add("is-correct"); mark.textContent = "✔ Correct answer"; }
      else if (bk === k) { b.classList.add("is-wrong"); mark.textContent = "✖ Your answer"; }
    });
    var last = state.i === state.qs.length - 1;
    panel.querySelector("[data-feedback]").innerHTML =
      '<p class="quiz-verdict ' + (ok ? "ok" : (skipped ? "skip" : "no")) + '"><span aria-hidden="true">' + (ok ? "✔" : (skipped ? "\u21b7" : "✖")) + "</span> " +
      (ok ? "Correct." : "Not quite. The correct answer is option " + (q.answer + 1) + ".") + "</p>" +
      '<div class="quiz-model"><h3>Model answer</h3><p>' + esc(q.explanation) + "</p>" +
      '<p class="quiz-concept"><strong>Key concept:</strong> ' + esc(q.concept) + "</p>" +
      (q.source ? '<p class="quiz-source">' + esc(q.source) + "</p>" : "") +
      (q.ref ? '<p><a href="' + esc(q.ref) + '">Revise this topic in the notes</a></p>' : "") + '</div>' +
      nextControls(last, lvl(q));
    wireNext();
  }
  function wireNext() {
    var fb = panel.querySelector("[data-feedback]");
    fb.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-next]");
      if (b && !b.disabled) goNext(parseInt(b.getAttribute("data-next"), 10));
    });
    panel.querySelector('[data-next="0"]').focus({ preventScroll: true });
  }

  function nextControls(last, L) {
    if (last) return '<button type="button" class="btn btn-primary" data-next="0">See my score</button>';
    var used = usedMap();
    var easier = hasLevel(state.qs, used, function (x) { return x < L; });
    var harder = hasLevel(state.qs, used, function (x) { return x > L; });
    return '<div class="quiz-level" role="group" aria-label="Choose the level of the next question">' +
      '<span class="quiz-level-label">Next question:</span>' +
      '<button type="button" class="btn btn-outline" data-next="-1"' + (easier ? "" : " disabled") + '>\u25bc Easier</button>' +
      '<button type="button" class="btn btn-primary" data-next="0">Same level</button>' +
      '<button type="button" class="btn btn-outline" data-next="1"' + (harder ? "" : " disabled") + '>Harder \u25b2</button></div>';
  }

  function goNext(dir) {
    var L = lvl(cur());
    state.i += 1;
    if (state.i >= state.qs.length) { showResult(); return; }
    state.served[state.i] = pickNext(state.qs, usedMap(), Math.max(0, Math.min(2, L + (dir || 0))), dir || 0);
    persist();
    showQuestion();
    window.scrollTo({ top: root.offsetTop - 16, behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (!panel.querySelector(".quiz-options")) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    var open = state.answers.length === state.i, k = e.key.toLowerCase();
    if (/^[1-4]$/.test(e.key) && open) { answer(parseInt(e.key, 10) - 1); e.preventDefault(); }
    else if (k === "s" && open) { answer(-1); e.preventDefault(); }
    else if (!open && (k === "e" || k === "h")) {
      var b = panel.querySelector('[data-next="' + (k === "e" ? -1 : 1) + '"]');
      if (b && !b.disabled) { goNext(k === "e" ? -1 : 1); e.preventDefault(); }
    }
    else if (e.key === "Enter" && !open && e.target.tagName !== "A") {
      if (e.target.matches && e.target.matches("[data-next]")) return; // native button click handles it
      goNext(0); e.preventDefault();
    }
  });

  function breakdown(field, order) {
    var rows = {};
    state.served.forEach(function (qi, j) {
      var q = state.qs[qi];
      var r = rows[q[field]] || (rows[q[field]] = { n: 0, ok: 0 });
      r.n++; if (state.answers[j] === q.answer) r.ok++;
    });
    return order.filter(function (o) { return rows[o]; }).map(function (o) {
      return "<tr><th scope=\"row\">" + o + "</th><td>" + rows[o].ok + " / " + rows[o].n + "</td><td>" + Math.round(rows[o].ok / rows[o].n * 100) + "%</td></tr>";
    }).join("");
  }

  function sealSVG(pct, tier) {
    var r = 52, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    var col = { distinction: "#b5132b", pass: "#14213d", retry: "#6b7280" }[tier.key];
    var ring = tier.key === "distinction" ? "#c9a227" : (tier.key === "pass" ? "#4a5162" : "#d5dae5");
    return '<svg class="seal seal-' + tier.key + (reduceMotion ? "" : " animate") + '" viewBox="0 0 140 140" width="160" height="160" role="img" aria-labelledby="seal-t">' +
      '<title id="seal-t">' + esc(tier.label) + ": " + pct + "%</title>" +
      '<circle cx="70" cy="70" r="66" fill="' + ring + '" opacity="0.25"/>' +
      '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="#e5e2da" stroke-width="10"/>' +
      '<circle class="seal-arc" cx="70" cy="70" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round" ' +
      'transform="rotate(-90 70 70)" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" style="--c:' + c.toFixed(1) + '"/>' +
      '<text x="70" y="68" text-anchor="middle" font-size="28" font-weight="700" fill="' + col + '">' + pct + "%</text>" +
      '<text x="70" y="90" text-anchor="middle" font-size="11" fill="#23262b">' + (tier.key === "retry" ? "NOT YET" : tier.label.toUpperCase()) + "</text></svg>";
  }

  // Further reading (APA 7): shown only on the score page, collapsed, from /quiz/refs.json.
  var refsDoc = null;
  function apaHTML(t) { return esc(t).replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/(https?:\/\/[^\s<]+[^\s<.,;)])/g, '<a href="$1" rel="noopener">$1</a>'); }
  function addReading(box) {
    var run = function (doc) {
      if (!doc || !box.isConnected) return;
      var rules = (doc.rules || {})[subj.code] || [], labels = (doc.labels || {})[subj.code] || {};
      var seen = {}, topicRows = [], used = {};
      state.served.forEach(function (qi) {
        var t = state.qs[qi].topic; if (seen[t]) return; seen[t] = true;
        var rule = null; for (var r = 0; r < rules.length && !rule; r++) { if (new RegExp(rules[r].match, "i").test(t)) rule = rules[r]; }
        if (!rule) return;
        var name = (state.topics[t] && state.topics[t].title) || labels[t] || t;
        rule.refs.forEach(function (k) { used[k] = true; });
        topicRows.push("<li><strong>" + esc(name) + "</strong>: " + "(" + rule.refs.map(function (k) { return esc(doc.refs[k].cite); }).join("; ") + ")" + "</li>");
      });
      var list = Object.keys(used).map(function (k) { return doc.refs[k]; })
        .sort(function (a, b) { return a.apa.localeCompare(b.apa); });
      if (!list.length) return;
      var d = document.createElement("details");
      d.className = "quiz-reading";
      d.innerHTML = "<summary>Further reading on these topics (APA 7) \u2014 " + list.length + " reference" + (list.length === 1 ? "" : "s") + "</summary>" +
        '<h4>By topic</h4><ul class="reading-topics">' + topicRows.join("") + "</ul>" +
        '<h4>References</h4><ul class="reading-refs">' + list.map(function (x) { return "<li>" + apaHTML(x.apa) + "</li>"; }).join("") + "</ul>";
      var act = box.querySelector(".actions"); box.insertBefore(d, act);
    };
    if (refsDoc) run(refsDoc); else getJSON("/quiz/refs.json").then(function (j) { refsDoc = j; run(j); }, function () {});
  }

  function fmtTime(ms) {
    var s = Math.round(ms / 1000);
    return Math.floor(s / 60) + " min " + (s % 60) + " s";
  }

  function showResult() {
    var n = state.qs.length, score = 0, missed = [], skippedN = 0;
    state.served.forEach(function (qi, j) {
      var q = state.qs[qi], a = state.answers[j];
      if (a === q.answer) score++; else { if (a === -1) skippedN++; missed.push({ q: q, skipped: a === -1 }); }
    });
    var pct = Math.round(score / n * 100);
    var tier = tierFor(pct);
    var bench = benchmark(state.qs);
    var hist = load(histKey, []);
    if (!state.sample && state.sk) {
      var already = hist.some(function (h) { return h.day === state.day && h.finished === state.finished; });
      if (!already) { hist.push({ day: state.day, score: score, n: n, pct: pct, finished: state.finished || Date.now() }); save(histKey, hist); }
    }
    var mine = hist.filter(function (h) { return h.day === state.day; });
    var daysDone = {}; hist.forEach(function (h) { daysDone[h.day] = true; });
    var streak = 0; for (var d = currentDay(subj, Date.now()) || 0; d >= 1 && daysDone[d]; d--) streak++;
    var peers = getPeerStats(state.day, score);
    var pool = QUOTES[tier.key];
    var quote = pool[(state.day + score) % pool.length];
    var dayLabel = state.sample ? "the sample" : "Quiz #" + state.day;
    var shareText = "I scored " + score + "/" + n + " (" + tier.label + ") on " + (state.sample ? "the sample" : subj.label + " Quiz #" + state.day) +
      " — daily quiz by Prasun Chaturvedi — prasunchaturvedi.in/quiz/" + subj.folder + "/";
    var where = pct < bench.low ? "below" : (pct > bench.high ? "above" : "within");

    var html = '<section class="quiz-result" aria-labelledby="res-h">' +
      '<h2 id="res-h" tabindex="-1">Your score for ' + dayLabel + "</h2>" +
      '<div class="result-top">' + sealSVG(pct, tier) +
      '<div><p class="result-score"><strong>' + score + " / " + n + "</strong> (" + pct + "%)</p>" +
      (skippedN ? "<p>Skipped: " + skippedN + " (counted as not correct)</p>" : "") +
      '<p class="result-tier">Result: <strong>' + esc(tier.label) + "</strong></p>" +
      (state.finished ? '<p>Time taken: ' + fmtTime(state.finished - state.started) + "</p>" : "") +
      '<blockquote class="result-quote"><p>“' + esc(quote[0]) + '”</p><footer>— ' + esc(quote[1]) + "</footer></blockquote></div></div>" +
      '<div class="two-col result-tables"><div><h3>By difficulty</h3><table class="data"><thead><tr><th scope="col">Level</th><th scope="col">Correct</th><th scope="col">%</th></tr></thead><tbody>' +
      breakdown("difficulty", ["Easy", "Intermediate", "Hard"]) + "</tbody></table></div>" +
      '<div><h3>By Bloom level</h3><table class="data"><thead><tr><th scope="col">Bloom</th><th scope="col">Correct</th><th scope="col">%</th></tr></thead><tbody>' +
      breakdown("bloom", ["Remember", "Understand", "Apply", "Analyse", "Evaluate", "Create"]) + "</tbody></table></div></div>" +
      '<h3>Where you stand</h3><p>Design benchmark for this set: <strong>typical range ' + bench.low + "–" + bench.high +
      "%</strong>, from expected success rates of 85% (Easy), 60% (Intermediate) and 30% (Hard). Your " + pct + "% is " + where +
      ' that range. <em>This is a benchmark, not live rankings: no scores leave your browser.</em></p>' +
      (peers ? "<p>" + esc(peers.summary) + "</p>" : "") +
      (mine.length > 1 ? "<p>Your attempts at " + dayLabel + ": " + mine.map(function (h) { return h.pct + "%"; }).join(", ") + ".</p>" : "") +
      (!state.sample ? "<p>Quizzes completed on this device: " + Object.keys(daysDone).length + " of " + subj.days + "; current streak: " + streak + " day" + (streak === 1 ? "" : "s") + ".</p>" : "") +
      (missed.length ? "<h3>Questions to revisit (" + missed.length + ")</h3><ol class=\"missed\">" + missed.map(function (m) {
        var q = m.q;
        return '<li><span class="quiz-id">' + esc(q.id) + "</span> " + (m.skipped ? '<em>(skipped \u2014 answer hidden until you attempt it)</em> ' : "") + esc(q.stem) +
          (m.skipped ? "" : '<br><strong>Answer:</strong> ' + esc(q.options[q.answer])) +
          (q.ref ? ' · <a href="' + esc(q.ref) + '">notes</a>' : "") + '</li>';
      }).join("") + "</ol>" : "<p>No misses. Excellent work.</p>") +
      '<div class="actions">' + (skippedN ? '<button type="button" class="btn btn-primary" data-skipped>Try my ' + skippedN + ' skipped question' + (skippedN === 1 ? "" : "s") + '</button>' : "") +
      '<button type="button" class="btn ' + (skippedN ? "btn-outline" : "btn-primary") + '" data-retry>Retry ' + dayLabel + "</button>" +
      '<button type="button" class="btn btn-outline" data-share>Share my score</button></div>' +
      '<p class="quiz-note" data-share-msg aria-live="polite"></p></section>';
    panel.innerHTML = html;
    var rem = document.getElementById("reminders");
    if (rem) {
      var copy = rem.cloneNode(true);
      copy.removeAttribute("id");
      Array.prototype.forEach.call(copy.querySelectorAll("[id]"), function (el) { el.removeAttribute("id"); });
      var h = copy.querySelector("h2"); if (h) { var h3 = document.createElement("h3"); h3.textContent = h.textContent; h.replaceWith(h3); }
      panel.querySelector(".quiz-result").appendChild(copy);
    }
    addReading(panel.querySelector(".quiz-result"));
    panel.querySelector("#res-h").focus({ preventScroll: true });
    panel.querySelector("[data-retry]").addEventListener("click", function () {
      if (state.sk) save(state.sk, null);
      startQuiz(state.qs, state.sk);
    });
    var ts = panel.querySelector("[data-skipped]");
    if (ts) ts.addEventListener("click", function () {
      var sv = [], an = [];
      state.served.forEach(function (qi, j) { if (state.answers[j] !== -1) { sv.push(qi); an.push(state.answers[j]); } });
      state.served = sv; state.answers = an; state.finished = 0; state.i = an.length;
      var used = usedMap();
      state.served[state.i] = pickNext(state.qs, used, 0, 0);
      persist(); showQuestion();
    });
    panel.querySelector("[data-share]").addEventListener("click", function () {
      var msg = panel.querySelector("[data-share-msg]");
      if (navigator.share) {
        navigator.share({ text: shareText, url: "https://prasunchaturvedi.in/quiz/" + subj.folder + "/" }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(function () { msg.textContent = "Copied to clipboard: " + shareText; },
          function () { msg.textContent = shareText; });
      } else { msg.textContent = shareText; }
    });
  }
})();

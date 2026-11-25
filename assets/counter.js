/* Public visit counter in the footer, from GoatCounter's TOTAL.json (cached by GoatCounter up to 4 h).
   Stays hidden until the total reaches MIN, or if the count can't be fetched. */
(function () {
  "use strict";
  var MIN = 100;
  var SINCE = "Nov 2026";
  var f = document.querySelector("footer .wrap") || document.querySelector("footer");
  if (!f || !window.fetch) return;
  fetch("https://prasunchaturvedi.goatcounter.com/counter/TOTAL.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) {
      var n = parseInt(String(j.count || "0").replace(/[^0-9]/g, ""), 10);
      if (!(n >= MIN)) return;
      var el = document.createElement("p");
      el.className = "visit-counter";
      el.innerHTML = '<span aria-hidden="true">★</span> <strong>' + n.toLocaleString("en-IN") + "</strong> visits since " + SINCE + " — thank you for reading";
      f.appendChild(el);
    })
    .catch(function () {});
})();

/* =========================================================
   HEAVY HITTER TRANSPORT LLC — network-canvas.js
   Decorative canvas animation for the "Network Visual" section: drifting
   nodes connected by lines, with an occasional traveling pulse along a link
   to suggest live dispatch/data flow. Gold/gunmetal palette only, no
   business data drawn. Respects prefers-reduced-motion (renders one static
   frame, no animation loop, no listeners that would restart it).
   ========================================================= */
(function () {
  "use strict";

  function setupNetworkCanvas() {
    var canvas = document.getElementById("network-canvas");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var GOLD = "200,161,59";
    var GOLD_LIGHT = "227,194,101";

    var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    var width = 0, height = 0;
    var nodes = [];
    var pulses = [];
    var rafId = null;
    var lastTime = 0;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      var density = 22000; // px^2 per node, tuned for a sparse, premium look
      var count = Math.max(14, Math.min(46, Math.round((width * height) / density)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: 1.6 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2
        });
      }
      pulses = [];
    }

    function linkDistance() {
      return Math.max(120, Math.min(width, height) * 0.22);
    }

    function step(t) {
      var dt = lastTime ? Math.min(48, t - lastTime) : 16;
      lastTime = t;

      ctx.clearRect(0, 0, width, height);

      // Move nodes, bounce off edges
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx * (dt / 16);
        n.y += n.vy * (dt / 16);
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
        n.phase += dt * 0.0015;
      }

      // Draw connections
      var maxDist = linkDistance();
      var edges = [];
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            var alpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = "rgba(" + GOLD + "," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
            edges.push({ a: nodes[a], b: nodes[b], dist: dist });
          }
        }
      }

      // Occasionally launch a traveling pulse along a real edge (dispatch/data-flow feel)
      if (edges.length && Math.random() < 0.02 && pulses.length < 5) {
        var edge = edges[Math.floor(Math.random() * edges.length)];
        pulses.push({ a: edge.a, b: edge.b, t: 0, speed: 0.0011 + Math.random() * 0.0009 });
      }
      pulses = pulses.filter(function (p) { return p.t < 1; });
      for (var p = 0; p < pulses.length; p++) {
        var pulse = pulses[p];
        pulse.t += pulse.speed * dt;
        var px = pulse.a.x + (pulse.b.x - pulse.a.x) * pulse.t;
        var py = pulse.a.y + (pulse.b.y - pulse.a.y) * pulse.t;
        var fade = Math.sin(Math.PI * pulse.t);
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + GOLD_LIGHT + "," + (0.85 * fade).toFixed(3) + ")";
        ctx.shadowColor = "rgba(" + GOLD_LIGHT + ",0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes with a soft pulse glow
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        var glow = 0.55 + 0.45 * Math.sin(node.phase);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + GOLD_LIGHT + "," + (0.55 * glow + 0.25).toFixed(3) + ")";
        ctx.shadowColor = "rgba(" + GOLD + ",0.6)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId = window.requestAnimationFrame(step);
    }

    resize();

    if (reduceMotion) {
      // Draw a single static frame (nodes + links, no motion, no pulses) and stop.
      step(0);
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
      return;
    }

    rafId = window.requestAnimationFrame(step);

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = null;
        lastTime = 0;
      } else if (!rafId) {
        rafId = window.requestAnimationFrame(step);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupNetworkCanvas);
  } else {
    setupNetworkCanvas();
  }
})();

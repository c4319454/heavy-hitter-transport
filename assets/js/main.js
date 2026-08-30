/* =========================================================
   HEAVY HITTER TRANSPORT LLC — main.js
   Vanilla JS: nav, mobile menu, reveal-on-scroll, FAQ accordion,
   radio chips, and the quote form (mailto fallback — see README
   "Connect the quote form" for wiring a real backend/service).
   ========================================================= */
(function () {
  "use strict";

  /* ---- Contact placeholders — replace with real business info ---- */
  var PHONE_DISPLAY = "PHONE_PLACEHOLDER";     // e.g. "(347) 555-0123"
  var PHONE_TEL = "PHONE_PLACEHOLDER";         // e.g. "+13475550123" (digits/plus only, used in tel: links)
  var EMAIL_ADDRESS = "EMAIL_PLACEHOLDER";     // e.g. "dispatch@heavyhittertransportllc.com"
  /* Optional: point this at a form backend (Formspree, Getform, a
     serverless endpoint, etc). Leave empty to use the mailto fallback. */
  var FORM_ENDPOINT = "";

  document.addEventListener("DOMContentLoaded", function () {
    injectContactInfo();
    setupNav();
    setupMobileMenu();
    setupReveal();
    setupFaq();
    setupRadioChips();
    setupForm();
    setupYear();
  });

  function injectContactInfo() {
    document.querySelectorAll("[data-phone-display]").forEach(function (el) {
      el.textContent = PHONE_DISPLAY;
    });
    document.querySelectorAll("[data-email-display]").forEach(function (el) {
      el.textContent = EMAIL_ADDRESS;
    });
    document.querySelectorAll("a[data-tel-link]").forEach(function (el) {
      el.setAttribute("href", "tel:" + PHONE_TEL);
    });
    document.querySelectorAll("a[data-sms-link]").forEach(function (el) {
      el.setAttribute("href", "sms:" + PHONE_TEL);
    });
    document.querySelectorAll("a[data-mail-link]").forEach(function (el) {
      el.setAttribute("href", "mailto:" + EMAIL_ADDRESS);
    });
  }

  function setupNav() {
    var nav = document.querySelector(".navbar");
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 12) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); });
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  function setupFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var btn = item.querySelector(".faq-q");
      var answer = item.querySelector(".faq-a");
      if (!btn || !answer) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("open");
            openItem.querySelector(".faq-a").style.maxHeight = null;
            openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          }
        });
        if (isOpen) {
          item.classList.remove("open");
          answer.style.maxHeight = null;
          btn.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function setupRadioChips() {
    document.querySelectorAll(".radio-chip").forEach(function (chip) {
      var input = chip.querySelector("input");
      if (!input) return;
      function refresh() {
        var group = input.name;
        document.querySelectorAll('input[name="' + group + '"]').forEach(function (i) {
          i.closest(".radio-chip").classList.toggle("active", i.checked);
        });
      }
      input.addEventListener("change", refresh);
      refresh();
    });
  }

  function setupYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function setupForm() {
    var form = document.getElementById("quote-form");
    if (!form) return;
    var status = document.getElementById("form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = collectFormData(form);

      if (FORM_ENDPOINT) {
        submitToEndpoint(data, status, form);
      } else {
        submitViaMailto(data, status, form);
      }
    });
  }

  function collectFormData(form) {
    var fd = new FormData(form);
    var obj = {};
    fd.forEach(function (value, key) {
      if (obj[key]) {
        obj[key] = Array.isArray(obj[key]) ? obj[key].concat(value) : [obj[key], value];
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }

  function submitToEndpoint(data, status, form) {
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        showSuccess(status, form);
      })
      .catch(function () {
        status.className = "form-status error";
        status.textContent =
          "Something went wrong sending that automatically. Please call or text " + PHONE_DISPLAY + " instead.";
      });
  }

  /* GitHub Pages has no server-side form processing. Until FORM_ENDPOINT
     is configured with a real form service, this opens a pre-filled
     email to EMAIL_ADDRESS with everything the visitor entered — a real
     working fallback, not a fake "success". See README: "Connect the
     quote form". */
  function submitViaMailto(data, status, form) {
    var lines = [
      "New quote request — Heavy Hitter Transport",
      "",
      "Name: " + (data.full_name || ""),
      "Business: " + (data.business_name || "—"),
      "Phone: " + (data.phone || ""),
      "Email: " + (data.email || ""),
      "Pickup: " + (data.pickup_address || ""),
      "Delivery: " + (data.delivery_address || ""),
      "Requested date: " + (data.requested_date || ""),
      "Job type: " + (data.job_type || ""),
      "Cargo description: " + (data.cargo_description || ""),
      "Estimated items/pallets: " + (data.item_count || ""),
      "Pickup loading dock: " + (data.pickup_dock || "Not specified"),
      "Delivery loading dock: " + (data.delivery_dock || "Not specified"),
      "Loading assistance needed: " + (data.loading_assistance || "Not specified"),
      "Special instructions: " + (data.special_instructions || "—")
    ];
    var subject = encodeURIComponent("Quote Request — " + (data.full_name || "New Lead"));
    var body = encodeURIComponent(lines.join("\n"));
    var mailtoUrl = "mailto:" + EMAIL_ADDRESS + "?subject=" + subject + "&body=" + body;

    window.location.href = mailtoUrl;
    showSuccess(status, form);
  }

  function showSuccess(status, form) {
    status.className = "form-status success";
    status.textContent =
      "Thanks for contacting Heavy Hitter Transport. Your request has been received and we'll contact you regarding availability and job details.";
    form.reset();
    document.querySelectorAll(".radio-chip.active").forEach(function (c) {
      c.classList.remove("active");
    });
  }
})();

/* =========================================================
   HEAVY HITTER TRANSPORT LLC — main.js
   Vanilla JS: nav, mobile menu, reveal-on-scroll, FAQ accordion,
   radio chips, and the quote form (mailto fallback — see README
   "Connect the quote form" for wiring a real backend/service).
   ========================================================= */
(function () {
  "use strict";

  /* ---- Business contact info ---- */
  var PHONE_DISPLAY = "(347) 832-5320";
  var PHONE_TEL = "+13478325320";              // digits/plus only, used in tel:/sms: links
  var EMAIL_ADDRESS = "dprashad21@gmail.com";
  /* Optional: point this at a form backend (Formspree, Getform, a
     serverless endpoint, etc). Leave empty to use the mailto fallback. */
  var FORM_ENDPOINT = "";

  /* ---- Published rate card (must match the Pricing section on the page) ---- */
  var RATES = {
    fiveboro: {
      full:    { flat: 850, includedHours: 4, includedMiles: 40, extraHourRate: 145, extraMileRate: 2.25 },
      partial: { flat: 450, includedHours: 2, includedMiles: 20, extraHourRate: 125, extraMileRate: 2.25 }
    },
    tristate: {
      base: 700, includedHours: 4, includedMiles: 20, extraMileRate: 3.00, fuelSurchargePct: 0.15
    },
    extraStop: 75,
    waitingPer30Min: 50,
    /* Courier: driver-only, single small item/package, rush-capable. No helper on the job,
       so the crew-cost basis (and therefore the rate) is lower than the labor-included tiers. */
    courier: {
      flat: 175, includedHours: 1, includedMiles: 15, extraHourRate: 95, extraMileRate: 2.50,
      rushFee: 50, tristateExtraMileRate: 3.00, fuelSurchargePct: 0.15
    },
    /* Freight & pallet — dock-to-dock: driver stays with the truck, receiver's own dock crew
       (forklift/pallet jack) handles unloading. No helper on our side, so this is priced off the
       driver+truck+fuel cost only — not the two-person labor rate. */
    freightDockToDock: {
      perPallet: 95, minPallets: 2, minCharge: 190, extraPalletRate: 80,
      includedMiles: 25, extraMileRate: 2.75, waitFreeMin: 20, waitPer20Min: 40,
      tristateFuelSurchargePct: 0.15
    },
    /* Freight & pallet — hand-load: no dock/forklift at pickup or drop-off, so our crew (driver +
       helper) physically loads/unloads. Priced like the labor-included tiers. */
    freightHandLoad: {
      perPallet: 150, minPallets: 2, minCharge: 300, extraPalletRate: 115,
      includedMiles: 25, extraMileRate: 3.00, waitFreeMin: 30, waitPer30Min: 50,
      tristateFuelSurchargePct: 0.15
    },
    /* Truck + driver only — customer supplies their own loading/unloading crew; driver pulls up
       and waits. Priced on an hourly basis (driver wage + truck cost + fuel + insurance/overhead),
       with no labor line at all — the lowest tier on the card because there's no crew cost to cover. */
    truckDriverOnly: {
      hourlyRate: 115, minHours: 2, minCharge: 230, includedMilesPerHour: 10, extraMileRate: 2.00,
      tristateFuelSurchargePct: 0.15
    }
  };

  /* ---- Business credentials (trust strip placeholders) ----
     Leave every value empty/false until the owner supplies confirmed information. Never invent
     a number here. Filling one in and redeploying is the only change needed to activate it —
     no markup edits required. */
  var BUSINESS_CREDENTIALS = {
    usdot: "6414188",    // confirmed by owner 2026-09-04
    nyAuthority: "",     // e.g. "T-123456" — leave "" until confirmed
    insured: "$25,000 Commercial General Liability Coverage"  // confirmed by owner 2026-09-05 (coverage amount only; no carrier/policy details disclosed)
  };

  /* ---- Truck specifications (spec table placeholders) ----
     Leave a field empty until the owner supplies a verified measurement. Empty fields render
     "Available upon confirmation" automatically. */
  var TRUCK_SPECS = {
    interiorLength: "",
    interiorWidth: "",
    interiorHeight: "",
    rearDoorOpening: "",
    payloadCapacity: "",
    gvwr: "",
    palletCapacity: "",
    liftgate: "",
    dockHeight: "",
    palletJack: "",
    eTrack: "",
    movingBlankets: "",
    straps: ""
  };

  document.addEventListener("DOMContentLoaded", function () {
    injectContactInfo();
    injectBusinessCredentials();
    injectTruckSpecs();
    setupNav();
    setupMobileMenu();
    setupReveal();
    setupFaq();
    setupRadioChips();
    setupForm();
    setupBusinessForm();
    setupYear();
    setupEstimator();
    setupScrollProgress();
    setupHeroGlow();
  });

  function injectBusinessCredentials() {
    var usdotEls = document.querySelectorAll("[data-usdot-display]");
    var authorityEls = document.querySelectorAll("[data-ny-authority-display]");
    var insuranceEls = document.querySelectorAll("[data-insurance-display]");
    usdotEls.forEach(function (el) {
      if (BUSINESS_CREDENTIALS.usdot) {
        el.textContent = BUSINESS_CREDENTIALS.usdot;
        el.setAttribute("data-confirmed", "true");
      }
    });
    authorityEls.forEach(function (el) {
      if (BUSINESS_CREDENTIALS.nyAuthority) {
        el.textContent = BUSINESS_CREDENTIALS.nyAuthority;
        el.setAttribute("data-confirmed", "true");
      }
    });
    insuranceEls.forEach(function (el) {
      if (BUSINESS_CREDENTIALS.insured) {
        el.textContent = BUSINESS_CREDENTIALS.insured;
        el.setAttribute("data-confirmed", "true");
      }
    });
  }

  function injectTruckSpecs() {
    document.querySelectorAll("[data-spec]").forEach(function (el) {
      var key = el.getAttribute("data-spec");
      var value = TRUCK_SPECS[key];
      if (value) {
        el.textContent = value;
        el.setAttribute("data-confirmed", "true");
      }
    });
  }

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

  function setupScrollProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      bar.style.width = pct + "%";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function setupHeroGlow() {
    var hero = document.querySelector(".hero");
    var glow = document.getElementById("hero-glow");
    if (!hero || !glow) return;
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      glow.style.setProperty("--mx", x + "%");
      glow.style.setProperty("--my", y + "%");
    }, { passive: true });
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
      ""
    ];
    if (data.estimate_summary) {
      lines.push("Instant estimate provided by customer:", data.estimate_summary, "");
    }
    lines.push(
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
    );
    var subject = encodeURIComponent("Quote Request — " + (data.full_name || "New Lead"));
    var body = encodeURIComponent(lines.join("\n"));
    var mailtoUrl = "mailto:" + EMAIL_ADDRESS + "?subject=" + subject + "&body=" + body;

    window.location.href = mailtoUrl;
    showSuccess(status, form);
  }

  function showSuccess(status, form) {
    status.className = "form-status success";
    status.innerHTML =
      "<strong>Request Received.</strong> Heavy Hitter has received your job details. We will review the request and contact you to confirm availability and final pricing.";
    form.reset();
    document.querySelectorAll(".radio-chip.active").forEach(function (c) {
      c.classList.remove("active");
    });
    var summaryField = document.getElementById("estimate-summary-field");
    if (summaryField) summaryField.style.display = "none";
  }

  /* ---- Business account form (mailto fallback, same pattern as the quote form) ---- */
  function setupBusinessForm() {
    var form = document.getElementById("business-form");
    if (!form) return;
    var status = document.getElementById("business-form-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = collectFormData(form);
      var lines = [
        "New business account request — Heavy Hitter Transport",
        "",
        "Company: " + (data.company_name || ""),
        "Contact: " + (data.contact_name || ""),
        "Phone: " + (data.phone || ""),
        "Email: " + (data.email || ""),
        "Service needed: " + (data.service_needed || ""),
        "Pickup area: " + (data.pickup_area || ""),
        "Delivery area: " + (data.delivery_area || ""),
        "Frequency: " + (data.frequency || ""),
        "Estimated loads per week/month: " + (data.loads_estimate || "—"),
        "Pallet count / load description: " + (data.load_description || "—")
      ];
      var subject = encodeURIComponent("Business Account Request — " + (data.company_name || "New Business Lead"));
      var body = encodeURIComponent(lines.join("\n"));
      window.location.href = "mailto:" + EMAIL_ADDRESS + "?subject=" + subject + "&body=" + body;

      status.className = "form-status success";
      status.innerHTML =
        "<strong>Request Received.</strong> Heavy Hitter has received your business account request. We will review it and follow up to confirm scheduling and pricing.";
      form.reset();
    });
  }

  /* ---- Instant estimate calculator ---- */
  var SERVICE_LABELS = {
    moving: "Moving / Delivery (Box Truck + Crew)",
    truckDriverOnly: "Truck & Driver Only (You Load It)",
    courier: "Dedicated Local Delivery",
    freightDockToDock: "Local Pallet & Dock Run",
    freightHandLoad: "Pallet & Freight — Labor Assist"
  };
  var SERVICE_TO_JOB_TYPE = {
    moving: "Furniture",
    truckDriverOnly: "Other",
    courier: "Other",
    freightDockToDock: "Warehouse/Dock",
    freightHandLoad: "Pallet/Freight"
  };
  var lastEstimate = null;

  function setupEstimator() {
    var btn = document.getElementById("est-calc-btn");
    var serviceEl = document.getElementById("est-service");
    var zoneEl = document.getElementById("est-zone");
    if (!btn || !serviceEl || !zoneEl) return;

    var loadField = document.getElementById("est-load-field");
    var palletsField = document.getElementById("est-pallets-field");
    var milesField = document.getElementById("est-miles-field");
    var hoursField = document.getElementById("est-hours-field");
    var stopsField = document.getElementById("est-stops-field");
    var rushField = document.getElementById("est-rush-field");

    function show(el, on) { if (el) el.style.display = on ? "" : "none"; }

    function syncFields() {
      var service = serviceEl.value;
      var isFreight = service === "freightDockToDock" || service === "freightHandLoad";
      show(loadField, service === "moving");
      show(palletsField, isFreight);
      show(hoursField, service === "moving" || service === "truckDriverOnly");
      show(stopsField, service === "moving" || isFreight);
      show(rushField, service === "courier");
      // Tri-State load-size choice only matters for the moving service; miles always shown.
      if (loadField) loadField.style.display = (service === "moving" && zoneEl.value !== "tristate") ? "" : "none";
    }

    serviceEl.addEventListener("change", syncFields);
    zoneEl.addEventListener("change", syncFields);
    syncFields();

    btn.addEventListener("click", function () {
      var service = serviceEl.value;
      var zone = zoneEl.value;
      var inputs = {
        loadType: document.getElementById("est-load").value,
        miles: parseFloat(document.getElementById("est-miles").value) || 0,
        hours: parseFloat(document.getElementById("est-hours").value) || 0,
        stops: parseInt(document.getElementById("est-stops").value, 10) || 0,
        pallets: parseInt(document.getElementById("est-pallets").value, 10) || 0,
        rush: document.getElementById("est-rush").checked
      };

      var result = calculateEstimate(service, zone, inputs);
      lastEstimate = { service: service, zone: zone, inputs: inputs, result: result };
      renderEstimate(result);
    });

    var requestBtn = document.getElementById("est-request-btn");
    if (requestBtn) {
      requestBtn.addEventListener("click", transferEstimateToQuoteForm);
    }
  }

  /* Transfers the calculated estimate into the quote form so the customer never re-enters
     service type, location, load size, miles, hours, stops or the calculated price. */
  function transferEstimateToQuoteForm() {
    if (!lastEstimate) return;
    var e = lastEstimate;
    var rangeText = e.result.high > e.result.low
      ? "$" + Math.round(e.result.low).toLocaleString() + " – $" + Math.round(e.result.high).toLocaleString()
      : "$" + Math.round(e.result.low).toLocaleString();

    var summaryLines = [
      "Service Type: " + (SERVICE_LABELS[e.service] || e.service),
      "Location: " + (e.zone === "tristate" ? "Tri-State" : "New York City"),
    ];
    if (e.service === "moving") {
      summaryLines.push("Load Size: " + (e.inputs.loadType === "partial" ? "Partial Load / Single Item" : "Full Truckload"));
    }
    if (e.service === "freightDockToDock" || e.service === "freightHandLoad") {
      summaryLines.push("Pallets: " + e.inputs.pallets);
    }
    summaryLines.push("Estimated Miles: " + e.inputs.miles);
    if (e.service === "moving" || e.service === "truckDriverOnly") {
      summaryLines.push("Estimated Hours: " + e.inputs.hours);
    }
    summaryLines.push("Extra Stops: " + e.inputs.stops);
    if (e.inputs.rush) summaryLines.push("Rush pickup window requested");
    summaryLines.push("Calculated Estimate: " + rangeText + " (published rate structure, not a final price)");

    var summaryField = document.getElementById("estimate-summary-field");
    var summaryInput = document.getElementById("estimate_summary");
    if (summaryField && summaryInput) {
      summaryInput.value = summaryLines.join("\n");
      summaryField.style.display = "";
    }

    var itemCount = document.getElementById("item_count");
    if (itemCount && (e.service === "freightDockToDock" || e.service === "freightHandLoad") && e.inputs.pallets) {
      itemCount.value = e.inputs.pallets + " pallets";
    }

    var jobTypeValue = SERVICE_TO_JOB_TYPE[e.service];
    if (jobTypeValue) {
      var radio = document.querySelector('input[name="job_type"][value="' + jobTypeValue + '"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change"));
      }
    }

    var quoteSection = document.getElementById("quote");
    if (quoteSection) quoteSection.scrollIntoView({ behavior: "smooth", block: "start" });
    var fullName = document.getElementById("full_name");
    if (fullName) window.setTimeout(function () { fullName.focus(); }, 450);
  }

  function calculateEstimate(service, zone, inputs) {
    switch (service) {
      case "courier": return calcCourier(zone, inputs);
      case "freightDockToDock": return calcFreight(RATES.freightDockToDock, zone, inputs, "waitPer20Min", "waitFreeMin");
      case "freightHandLoad": return calcFreight(RATES.freightHandLoad, zone, inputs, "waitPer30Min", "waitFreeMin");
      case "truckDriverOnly": return calcTruckDriverOnly(zone, inputs);
      default: return calcMoving(zone, inputs);
    }
  }

  function calcMoving(zone, inputs) {
    var lines = [];
    var low, high, base;
    var miles = inputs.miles, hours = inputs.hours, stops = inputs.stops;

    if (zone === "tristate") {
      var t = RATES.tristate;
      base = t.base;
      lines.push({ label: "Base (includes " + t.includedHours + " hrs / " + t.includedMiles + " mi beyond NYC)", value: base });

      var extraMiles = Math.max(0, miles - t.includedMiles);
      var mileageCharge = extraMiles * t.extraMileRate;
      if (extraMiles > 0) lines.push({ label: "Extra mileage (" + extraMiles + " mi \u00d7 $" + t.extraMileRate.toFixed(2) + ")", value: mileageCharge });

      var fuelSurcharge = mileageCharge * t.fuelSurchargePct;
      if (mileageCharge > 0) lines.push({ label: "Fuel surcharge (" + (t.fuelSurchargePct * 100).toFixed(0) + "% of mileage)", value: fuelSurcharge });

      var subtotal = base + mileageCharge + fuelSurcharge;
      var stopCharge = stops * RATES.extraStop;
      if (stops > 0) lines.push({ label: stops + " extra stop(s) \u00d7 $" + RATES.extraStop, value: stopCharge });

      var total = subtotal + stopCharge;
      low = total;
      high = total * 1.15; // tri-state is negotiable/quoted — show a realistic spread
    } else {
      var tier = RATES.fiveboro[inputs.loadType] || RATES.fiveboro.full;
      base = tier.flat;
      lines.push({ label: "Flat rate (up to " + tier.includedHours + " hrs / " + tier.includedMiles + " mi)", value: base });

      var extraHours = Math.max(0, hours - tier.includedHours);
      var timeCharge = extraHours * tier.extraHourRate;
      if (extraHours > 0) lines.push({ label: extraHours + " extra hr(s) \u00d7 $" + tier.extraHourRate, value: timeCharge });

      var extraMi = Math.max(0, miles - tier.includedMiles);
      var mileCharge = extraMi * tier.extraMileRate;
      if (extraMi > 0) lines.push({ label: extraMi + " extra mile(s) \u00d7 $" + tier.extraMileRate.toFixed(2), value: mileCharge });

      var stopCharge2 = stops * RATES.extraStop;
      if (stops > 0) lines.push({ label: stops + " extra stop(s) \u00d7 $" + RATES.extraStop, value: stopCharge2 });

      var flatTotal = base + timeCharge + mileCharge + stopCharge2;
      low = flatTotal;
      high = flatTotal; // 5-borough tiers are flat/predictable once inputs are known
    }

    return { zone: zone, low: low, high: high, lines: lines };
  }

  function calcCourier(zone, inputs) {
    var c = RATES.courier;
    var lines = [];
    var base = c.flat;
    lines.push({ label: "Flat rate (up to " + c.includedHours + " hr / " + c.includedMiles + " mi)", value: base });

    var extraHours = Math.max(0, inputs.hours - c.includedHours);
    var timeCharge = extraHours * c.extraHourRate;
    if (extraHours > 0) lines.push({ label: extraHours + " extra hr(s) \u00d7 $" + c.extraHourRate, value: timeCharge });

    var mileRate = zone === "tristate" ? c.tristateExtraMileRate : c.extraMileRate;
    var extraMiles = Math.max(0, inputs.miles - c.includedMiles);
    var mileCharge = extraMiles * mileRate;
    if (extraMiles > 0) lines.push({ label: extraMiles + " extra mile(s) \u00d7 $" + mileRate.toFixed(2), value: mileCharge });

    var fuelSurcharge = 0;
    if (zone === "tristate") {
      fuelSurcharge = mileCharge * c.fuelSurchargePct;
      if (mileCharge > 0) lines.push({ label: "Fuel surcharge (" + (c.fuelSurchargePct * 100).toFixed(0) + "% of mileage, Tri-State)", value: fuelSurcharge });
    }

    var rushFee = inputs.rush ? c.rushFee : 0;
    if (rushFee > 0) lines.push({ label: "Rush booking fee", value: rushFee });

    var total = base + timeCharge + mileCharge + fuelSurcharge + rushFee;
    return { zone: zone, low: total, high: zone === "tristate" ? total * 1.1 : total, lines: lines };
  }

  function calcFreight(rates, zone, inputs, waitKey, waitFreeKey) {
    var lines = [];
    var pallets = Math.max(inputs.pallets, rates.minPallets);
    // Base = minCharge for the minimum, plus extraPalletRate for pallets beyond the minimum.
    var extraPallets = Math.max(0, pallets - rates.minPallets);
    var base = rates.minCharge;
    lines.push({ label: rates.minPallets + "-pallet minimum (base charge)", value: base });

    var extraPalletCharge = extraPallets * rates.extraPalletRate;
    if (extraPallets > 0) lines.push({ label: extraPallets + " extra pallet(s) \u00d7 $" + rates.extraPalletRate, value: extraPalletCharge });

    var extraMiles = Math.max(0, inputs.miles - rates.includedMiles);
    var mileCharge = extraMiles * rates.extraMileRate;
    if (extraMiles > 0) lines.push({ label: extraMiles + " extra mile(s) \u00d7 $" + rates.extraMileRate.toFixed(2), value: mileCharge });

    var stopCharge = inputs.stops * RATES.extraStop;
    if (inputs.stops > 0) lines.push({ label: inputs.stops + " extra stop(s) \u00d7 $" + RATES.extraStop, value: stopCharge });

    var fuelSurcharge = 0;
    if (zone === "tristate") {
      fuelSurcharge = (extraPalletCharge + mileCharge) * rates.tristateFuelSurchargePct;
      if (fuelSurcharge > 0) lines.push({ label: "Fuel surcharge (" + (rates.tristateFuelSurchargePct * 100).toFixed(0) + "% of pallet + mileage, Tri-State)", value: fuelSurcharge });
    }

    var total = base + extraPalletCharge + mileCharge + stopCharge + fuelSurcharge;
    return { zone: zone, low: total, high: zone === "tristate" ? total * 1.1 : total, lines: lines };
  }

  function calcTruckDriverOnly(zone, inputs) {
    var r = RATES.truckDriverOnly;
    var lines = [];
    var hours = Math.max(inputs.hours, r.minHours);
    var base = hours * r.hourlyRate;
    lines.push({ label: hours + " hr(s) \u00d7 $" + r.hourlyRate + "/hr (2-hr minimum applied)", value: base });

    var includedMiles = hours * r.includedMilesPerHour;
    var extraMiles = Math.max(0, inputs.miles - includedMiles);
    var mileCharge = extraMiles * r.extraMileRate;
    if (extraMiles > 0) lines.push({ label: extraMiles + " extra mile(s) \u00d7 $" + r.extraMileRate.toFixed(2) + " (beyond " + includedMiles + " mi included)", value: mileCharge });

    var fuelSurcharge = 0;
    if (zone === "tristate") {
      fuelSurcharge = mileCharge * r.tristateFuelSurchargePct;
      if (fuelSurcharge > 0) lines.push({ label: "Fuel surcharge (" + (r.tristateFuelSurchargePct * 100).toFixed(0) + "% of mileage, Tri-State)", value: fuelSurcharge });
    }

    var total = Math.max(base + mileCharge + fuelSurcharge, r.minCharge);
    return { zone: zone, low: total, high: zone === "tristate" ? total * 1.1 : total, lines: lines };
  }

  function renderEstimate(result) {
    var box = document.getElementById("est-result");
    if (!box) return;

    var rangeText = result.high > result.low
      ? "$" + Math.round(result.low).toLocaleString() + " \u2013 $" + Math.round(result.high).toLocaleString()
      : "$" + Math.round(result.low).toLocaleString();

    var rowsHtml = result.lines.map(function (line) {
      return '<div class="row"><span>' + line.label + "</span><span>$" + Math.round(line.value).toLocaleString() + "</span></div>";
    }).join("");

    box.innerHTML =
      '<div class="est-range">' + rangeText + "</div>" +
      '<div class="est-breakdown">' + rowsHtml + "</div>" +
      '<p class="est-note">Estimate only, based on the published rate card. Tolls, special handling and unusual access are not included. Your final confirmed quote is issued after Heavy Hitter reviews the complete job details.</p>' +
      '<button type="button" class="btn btn-gold btn-lg btn-block est-request-btn" id="est-request-btn">Request This Job</button>';

    var requestBtn = document.getElementById("est-request-btn");
    if (requestBtn) requestBtn.addEventListener("click", transferEstimateToQuoteForm);
  }
})();

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const toast = (message) => {
    const node = $("#toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(window.__khardzToast);
    window.__khardzToast = setTimeout(() => node.classList.remove("show"), 2400);
  };
  window.khardzToast = toast;

  const storedTheme = localStorage.getItem("khardz_theme");
  if (storedTheme) document.documentElement.dataset.theme = storedTheme;

  const themeButton = $("#themeButton");
  const updateThemeLabel = () => {
    if (!themeButton) return;
    const isLight = document.documentElement.dataset.theme === "light";
    themeButton.setAttribute("aria-label", isLight ? "Use dark theme" : "Use light theme");
    themeButton.title = isLight ? "Use dark theme" : "Use light theme";
  };
  updateThemeLabel();
  themeButton?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("khardz_theme", next);
    updateThemeLabel();
  });

  const menuButton = $("#menuButton");
  const mobileMenu = $("#mobileMenu");
  menuButton?.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
  $$("#mobileMenu a").forEach((link) => link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  const currentPage = location.pathname.split("/").pop() || "index.html";
  $$("a[href='hub.html']").forEach((link) => {
    if (link.textContent.trim() === "Kutz Hub") link.textContent = "Hub";
  });
  $$("#mobileMenu a[href='quote.html']").forEach((link) => { link.textContent = "Quote"; });
  $$("#mobileMenu a[href='booking.html']").forEach((link) => { link.textContent = "Book"; });
  $$("[data-nav]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  const progress = $("#scrollProgress");
  const updateScroll = () => {
    if (!progress) return;
    const available = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${available > 0 ? (scrollY / available) * 100 : 0}%`;
  };
  addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const importantWords = /\b(short|easy|clear|fair|safe|work|job|jobs|book|booking|mow|mows|mowing|cut|cuts|lawn|lawns|grass|edge|edges|price|quote|quotes|agree|agreed|gate|gates|dog|dogs|address|service|services|tidy|clean|regular|visit|visits|gear|Kawiti|clippings|steps|ready)\b/gi;
  const highlightImportantWords = (root = document) => {
    const paragraphs = root.matches?.("p") ? [root] : $$("p", root);
    paragraphs.forEach((paragraph) => {
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue.trim() || node.parentElement.closest(".word-glow")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        importantWords.lastIndex = 0;
        if (!importantWords.test(node.nodeValue)) return;
        importantWords.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const match of node.nodeValue.matchAll(importantWords)) {
          fragment.append(node.nodeValue.slice(cursor, match.index));
          const mark = document.createElement("span");
          mark.className = "word-glow";
          mark.textContent = match[0];
          fragment.append(mark);
          cursor = match.index + match[0].length;
        }
        fragment.append(node.nodeValue.slice(cursor));
        node.replaceWith(fragment);
      });
    });
  };
  highlightImportantWords();

  const revealNodes = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const activateWithKeyboard = (node, action) => {
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  };

  const servicePanels = $$(".service-card");
  const savedService = localStorage.getItem("khardz_package");
  const chooseService = (panel, announce = true) => {
    const name = $("h3", panel)?.textContent.trim();
    if (!name) return;
    servicePanels.forEach((item) => {
      item.classList.remove("is-chosen");
      item.setAttribute("aria-pressed", "false");
      $(".panel-state", item)?.remove();
    });
    panel.classList.add("is-chosen");
    panel.setAttribute("aria-pressed", "true");
    const state = document.createElement("span");
    state.className = "panel-state";
    state.textContent = "Selected";
    panel.appendChild(state);
    localStorage.setItem("khardz_package", name);
    if (announce) toast(`${name} selected.`);
  };
  servicePanels.forEach((panel) => {
    panel.tabIndex = 0;
    panel.setAttribute("role", "button");
    panel.setAttribute("aria-pressed", "false");
    panel.setAttribute("aria-label", `Select ${$("h3", panel)?.textContent.trim() || "service"}`);
    panel.addEventListener("click", () => chooseService(panel));
    activateWithKeyboard(panel, () => chooseService(panel));
    if (savedService && $("h3", panel)?.textContent.trim() === savedService) chooseService(panel, false);
  });

  $$(".feature-card, .process-card, .policy-card, .value-card").forEach((panel) => {
    panel.tabIndex = 0;
    panel.setAttribute("role", "button");
    panel.setAttribute("aria-pressed", "false");
    const toggle = () => {
      const active = panel.classList.toggle("is-inspected");
      panel.setAttribute("aria-pressed", String(active));
    };
    panel.addEventListener("click", toggle);
    activateWithKeyboard(panel, toggle);
  });

  const resultRange = $("#resultRange");
  const resultFeature = $("#resultFeature");
  if (resultRange && resultFeature) {
    const updateResultScan = () => resultFeature.style.setProperty("--scan", `${resultRange.value}%`);
    resultRange.addEventListener("input", updateResultScan);
    updateResultScan();
  }

  const tips = [
    "Clean edges make a lawn look done.",
    "Long grass may need more than one cut.",
    "Regular cuts keep the lawn tidy.",
    "Move toys and tools before we mow.",
    "Gate notes help us find the lawn."
  ];
  $("#newHomeTip")?.addEventListener("click", () => {
    const output = $("#homeTip");
    output.textContent = tips[Math.floor(Math.random() * tips.length)];
    highlightImportantWords(output);
  });

  const chaosButtons = $$("[data-chaos]");
  chaosButtons.forEach((button) => button.addEventListener("click", () => {
    chaosButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.setAttribute("aria-pressed", "true");
    const score = Number(button.dataset.chaos);
    const packageName = button.dataset.package;
    const copy = button.dataset.copy;
    const meter = $("#chaosFill");
    const scoreNode = $("#chaosScore");
    const result = $("#chaosResult");
    if (meter) meter.style.width = `${score}%`;
    if (scoreNode) scoreNode.textContent = `${score}`;
    if (result) result.innerHTML = `<strong>${packageName}</strong><span>${copy}</span>`;
    if (result) highlightImportantWords(result);
    localStorage.setItem("khardz_package", packageName);
  }));

  const quoteRoot = $("#quoteBuilder");
  if (quoteRoot) {
    const size = $("#lawnSize");
    const condition = $("#grassCondition");
    const sizeNames = { 1: "Small", 2: "Medium", 3: "Large", 4: "Very large" };
    const extras = $$("[data-quote-extra]");

    const calculateQuote = () => {
      const sizeValue = Number(size.value);
      const conditionValue = Number(condition.value);
      let workload = 14 + sizeValue * 12 + conditionValue;
      extras.forEach((box) => { if (box.checked) workload += Number(box.dataset.weight || 0); });
      workload = Math.min(100, workload);
      const edges = $("#extraEdges")?.checked;
      const packageName = conditionValue >= 34 ? "Jungle Kutz" : edges ? "Full Kutz" : "Quick Kutz";
      const tone = workload > 76 ? "Big job" : workload > 48 ? "Medium job" : "Small job";

      $("#sizeValue").textContent = sizeNames[sizeValue];
      $("#workloadScore").textContent = `${workload}`;
      $("#workloadFill").style.width = `${workload}%`;
      $("#recommendedPackage").textContent = packageName;
      $("#workloadTone").textContent = tone;
      $("#summarySize").textContent = sizeNames[sizeValue];
      $("#summaryCondition").textContent = condition.selectedOptions[0].textContent;
      $("#summaryExtras").textContent = extras.filter((box) => box.checked).length || "None";

      return {
        size: sizeNames[sizeValue],
        condition: condition.selectedOptions[0].textContent,
        conditionValue,
        workload,
        packageName,
        extras: extras.filter((box) => box.checked).map((box) => box.value)
      };
    };

    [size, condition, ...extras].forEach((field) => field.addEventListener("input", calculateQuote));
    $("#saveScope")?.addEventListener("click", () => {
      localStorage.setItem("khardz_scope", JSON.stringify(calculateQuote()));
      toast("Quote details saved.");
    });
    calculateQuote();
  }

  const bookingForm = $("#bookingForm");
  if (bookingForm) {
    const byId = (id) => document.getElementById(id);
    const mainServices = $$(".main-service");
    const addOnServices = $$(".addon-service");
    const savedScope = JSON.parse(localStorage.getItem("khardz_scope") || "null");
    const savedPackage = localStorage.getItem("khardz_package");
    const packageToUse = savedScope?.packageName || savedPackage;
    if (packageToUse) {
      const match = mainServices.find((box) => box.value === packageToUse);
      if (match) match.checked = true;
    }

    const selected = (items) => items.filter((box) => box.checked).map((box) => box.value);
    const needsAccessNotes = () => ["preferred", "restricted", "both"].includes(byId("accessType").value);

    const toggleConditionals = () => {
      const accessRequired = needsAccessNotes();
      byId("accessNotesWrap").classList.toggle("show", accessRequired);
      byId("accessNotes").required = accessRequired;
      const dogsPresent = byId("dogs").value === "yes";
      byId("dogAckWrap").classList.toggle("show", dogsPresent);
      byId("dogAck").required = dogsPresent;
    };

    const categoryState = () => {
      const contact = Boolean(byId("firstName").value.trim() && byId("lastName").value.trim() && byId("phone").value.trim());
      const location = Boolean(byId("street").value.trim() && byId("suburb").value.trim() && byId("region").value.trim());
      const services = selected(mainServices).length > 0;
      const accessNotes = !needsAccessNotes() || byId("accessNotes").value.trim().length >= 5;
      const pets = byId("dogs").value !== "yes" || byId("dogAck").checked;
      const access = accessNotes && pets;
      const policies = byId("policyAccess").checked && byId("policySafety").checked && byId("policyPrice").checked;
      return { contact, location, services, access, policies };
    };

    const validate = () => {
      toggleConditionals();
      const state = categoryState();
      const entries = Object.entries(state);
      const completed = entries.filter(([, okay]) => okay).length;
      const percent = Math.round((completed / entries.length) * 100);
      const allReady = entries.every(([, okay]) => okay);
      byId("readinessRing").style.setProperty("--ready", `${percent}%`);
      byId("readinessPercent").textContent = `${percent}%`;
      entries.forEach(([key, okay]) => {
        const row = byId(`ready-${key}`);
        row.classList.toggle("complete", okay);
        row.querySelector("b").textContent = okay ? "Ready" : "Missing";
      });
      byId("submitBooking").disabled = !allReady;
      byId("submitBooking").textContent = allReady ? "Save booking" : "Finish the steps";
      return allReady;
    };

    bookingForm.addEventListener("input", validate);
    bookingForm.addEventListener("change", validate);
    byId("locationButton")?.addEventListener("click", () => {
      if (!navigator.geolocation) {
        toast("Location is not available here.");
        return;
      }
      byId("locationButton").textContent = "Finding you...";
      navigator.geolocation.getCurrentPosition((position) => {
        const pin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        };
        localStorage.setItem("khardz_location_pin", JSON.stringify(pin));
        byId("locationStatus").textContent = `Pin added. About ${pin.accuracy} m close. Address still needed.`;
        highlightImportantWords(byId("locationStatus"));
        byId("locationButton").textContent = "Update location";
        toast("Location added.");
      }, () => {
        byId("locationButton").textContent = "Add my location";
        toast("Add your address instead.");
      }, { enableHighAccuracy: true, timeout: 9000 });
    });

    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) {
        byId("bookingError").classList.add("show");
        return;
      }
      byId("bookingError").classList.remove("show");
      const middle = byId("middleName").value.trim();
      const booking = {
        createdAt: new Date().toISOString(),
        customer: {
          firstName: byId("firstName").value.trim(),
          middleName: middle,
          lastName: byId("lastName").value.trim(),
          fullName: [byId("firstName").value.trim(), middle, byId("lastName").value.trim()].filter(Boolean).join(" "),
          phone: byId("phone").value.trim(),
          email: byId("email").value.trim()
        },
        location: {
          street: byId("street").value.trim(),
          suburb: byId("suburb").value.trim(),
          postcode: byId("postcode").value.trim(),
          region: byId("region").value.trim(),
          pin: JSON.parse(localStorage.getItem("khardz_location_pin") || "null")
        },
        services: selected(mainServices),
        addOns: selected(addOnServices),
        preferredDate: byId("preferredDate").value,
        access: {
          type: byId("accessType").selectedOptions[0].textContent,
          notes: byId("accessNotes").value.trim(),
          dogs: byId("dogs").value,
          dogsSecured: byId("dogAck").checked,
          hazards: byId("hazards").value.trim()
        },
        pricing: "Price agreed before work"
      };
      localStorage.setItem("khardz_booking", JSON.stringify(booking));
      localStorage.setItem("khardz_status", "0");
      byId("savedCustomerName").textContent = booking.customer.firstName;
      byId("bookingModal").showModal();
    });

    validate();
  }

  const hubRoot = $("#hubRoot");
  if (hubRoot) {
    const booking = JSON.parse(localStorage.getItem("khardz_booking") || "null");
    let status = Number(localStorage.getItem("khardz_status") || 0);
    const labels = ["Booking saved", "Price agreed", "Day set", "Cut done"];
    const rows = $$(".status-row");

    const drawHub = () => {
      rows.forEach((row, index) => {
        row.classList.toggle("done", Boolean(booking) && index < status);
        row.classList.toggle("active", Boolean(booking) && index === status);
        const pill = $(".status-pill", row);
        pill.textContent = !booking ? "Waiting" : index < status ? "Done" : index === status ? "Current" : "Next";
      });
      $("#hubProgress").style.width = booking ? `${((status + 1) / labels.length) * 100}%` : "0%";
      $("#hubStatusLabel").textContent = booking ? labels[status] : "No request saved";
    };

    if (booking) {
      $("#emptyHub").hidden = true;
      $("#loadedHub").hidden = false;
      $("#hubName").textContent = `${booking.customer.firstName}'s lawn`;
      $("#hubAddress").textContent = [booking.location.street, booking.location.suburb, booking.location.region].filter(Boolean).join(", ");
      $("#hubServices").textContent = [...booking.services, ...booking.addOns].join(", ") || "No services saved";
      $("#hubDate").textContent = booking.preferredDate || "To be arranged";
    }

    $("#advanceStatus")?.addEventListener("click", () => {
      if (!booking) return toast("Save a booking request first.");
      status = Math.min(labels.length - 1, status + 1);
      localStorage.setItem("khardz_status", String(status));
      drawHub();
    });
    $("#resetStatus")?.addEventListener("click", () => {
      status = 0;
      localStorage.setItem("khardz_status", "0");
      drawHub();
      toast("Demo reset.");
    });
    drawHub();
  }
})();

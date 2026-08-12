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
  $$("a[href='results.html']").forEach((link) => {
    if (link.textContent.trim() === "Results") link.textContent = "Photos";
  });
  $$("#mobileMenu a[href='quote.html']").forEach((link) => { link.textContent = "Quote"; });
  $$("#mobileMenu a[href='booking.html']").forEach((link) => { link.textContent = "Book"; });
  [[$(".nav-links"), true], [$("#mobileMenu"), false], ...$$(".footer-nav").map((nav) => [nav, false])].forEach(([nav, isMain]) => {
    if (!nav || $("a[href='contact.html']", nav)) return;
    const link = document.createElement("a");
    link.href = "contact.html";
    link.textContent = "Help";
    if (isMain) link.dataset.nav = "";
    const hubLink = $("a[href='hub.html']", nav);
    if (hubLink) nav.insertBefore(link, hubLink);
    else nav.appendChild(link);
  });
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

  const importantWords = /\b(short|easy|clear|fair|safe|work|job|jobs|book|booking|help|message|photo|photos|mow|mows|mowing|cut|cuts|lawn|lawns|grass|edge|edges|price|quote|quotes|agree|agreed|gate|gates|dog|dogs|address|service|services|tidy|clean|regular|visit|visits|gear|Kawiti|clippings|steps|ready)\b/gi;
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

  const grassCanvas = $("#grassCanvas");
  if (grassCanvas) {
    const context = grassCanvas.getContext("2d");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let blades = [];
    let frame = 0;
    let pointer = { x: -1000, y: -1000, active: false, moved: 0 };
    let touchStart = null;
    let touchMode = null;
    let touchOnGrass = false;

    const makeBlades = () => {
      const box = grassCanvas.getBoundingClientRect();
      const width = Math.max(320, Math.round(box.width));
      const height = Math.max(240, Math.round(box.height));
      const ratio = Math.min(devicePixelRatio || 1, 2);
      grassCanvas.width = Math.round(width * ratio);
      grassCanvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const pen = mask.getContext("2d", { willReadFrequently: true });
      pen.fillStyle = "#fff";
      pen.textAlign = "center";
      pen.textBaseline = "middle";
      pen.font = `900 ${width < 650 ? Math.min(82, width / 4.7) : Math.min(172, width / 8.1)}px Manrope, Arial, sans-serif`;
      if (width < 650) {
        pen.fillText("KAWITI", width / 2, height * 0.38);
        pen.fillText("MOWS", width / 2, height * 0.68);
      } else {
        pen.fillText("KAWITI MOWS", width / 2, height / 2);
      }
      const pixels = pen.getImageData(0, 0, width, height).data;
      const gap = width < 650 ? 6 : 8;
      blades = [];
      for (let y = gap; y < height; y += gap) {
        for (let x = gap; x < width; x += gap) {
          if (pixels[(y * width + x) * 4 + 3] > 80) {
            blades.push({ x, y, sway: Math.random() * Math.PI * 2, size: 4 + Math.random() * 3.5 });
          }
        }
      }
      drawGrass(performance.now());
    };

    const drawGrass = (now) => {
      const box = grassCanvas.getBoundingClientRect();
      context.clearRect(0, 0, box.width, box.height);
      context.lineCap = "round";
      const livePointer = pointer.active && now - pointer.moved < 850;
      blades.forEach((blade) => {
        const dx = blade.x - pointer.x;
        const dy = blade.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const push = livePointer ? Math.max(0, 1 - distance / 105) : 0;
        const breeze = still ? 0 : Math.sin(now * 0.0015 + blade.sway) * 0.08;
        const lean = breeze + Math.sign(dx || 1) * push * 1.15;
        const angle = -Math.PI / 2 + lean;
        const length = blade.size + push * 6;
        context.beginPath();
        context.moveTo(blade.x, blade.y);
        context.lineTo(blade.x + Math.cos(angle) * length, blade.y + Math.sin(angle) * length);
        context.strokeStyle = push > 0.1 ? "#b7ff75" : "#58d909";
        context.lineWidth = push > 0.1 ? 2.2 : 1.5;
        context.shadowColor = "rgba(88,217,9,.72)";
        context.shadowBlur = push > 0.1 ? 10 : 4;
        context.stroke();
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(blade.x, blade.y, push > 0.1 ? 1.8 : 1.2, 0, Math.PI * 2);
        context.fillStyle = push > 0.1 ? "#e3ffc9" : "#7aec35";
        context.fill();
      });
      if (!still) frame = requestAnimationFrame(drawGrass);
    };

    const movePointer = (clientX, clientY) => {
      const box = grassCanvas.getBoundingClientRect();
      pointer = { x: clientX - box.left, y: clientY - box.top, active: true, moved: performance.now() };
      if (still) drawGrass(performance.now());
    };
    const isNearGrass = (clientX, clientY) => {
      const box = grassCanvas.getBoundingClientRect();
      const x = clientX - box.left;
      const y = clientY - box.top;
      return blades.some((blade) => Math.hypot(blade.x - x, blade.y - y) < 20);
    };
    grassCanvas.addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY));
    grassCanvas.addEventListener("pointerdown", (event) => movePointer(event.clientX, event.clientY));
    grassCanvas.addEventListener("pointerleave", () => { pointer.active = false; });
    grassCanvas.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
      touchMode = null;
      touchOnGrass = Boolean(touch && isNearGrass(touch.clientX, touch.clientY));
    }, { passive: true });
    grassCanvas.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      if (touchStart) {
        const dx = touch.clientX - touchStart.x;
        const dy = touch.clientY - touchStart.y;
        if (!touchMode && Math.hypot(dx, dy) > 7) touchMode = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        if (touchOnGrass && touchMode === "horizontal") event.preventDefault();
      }
      movePointer(touch.clientX, touch.clientY);
    }, { passive: false });
    const endTouch = () => { touchStart = null; touchMode = null; touchOnGrass = false; pointer.active = false; };
    grassCanvas.addEventListener("touchend", endTouch, { passive: true });
    grassCanvas.addEventListener("touchcancel", endTouch, { passive: true });
    addEventListener("resize", () => {
      cancelAnimationFrame(frame);
      clearTimeout(window.__khardzGrassResize);
      window.__khardzGrassResize = setTimeout(makeBlades, 120);
    }, { passive: true });
    makeBlades();
  }

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
        photoPermission: byId("photoPermission").checked,
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
      $("#hubPhotos").textContent = booking.photoPermission ? "Yes" : "No";
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

  const helpForm = $("#helpForm");
  if (helpForm) {
    const savedBooking = JSON.parse(localStorage.getItem("khardz_booking") || "null");
    if (savedBooking?.customer) {
      $("#helpName").value = savedBooking.customer.fullName || savedBooking.customer.firstName || "";
      $("#helpPhone").value = savedBooking.customer.phone || "";
    }
    const buildHelpMessage = () => {
      const note = $("#helpNote").value.trim();
      return [
        "Hi Kawiti, I need help booking a lawn cut.",
        `Name: ${$("#helpName").value.trim()}`,
        `Mobile: ${$("#helpPhone").value.trim()}`,
        note ? `Help needed: ${note}` : "Please contact me and we can take it from there."
      ].join("\n");
    };
    const copyHelpMessage = async () => {
      const message = $("#helpMessage").value;
      try {
        await navigator.clipboard.writeText(message);
        toast("Message copied.");
      } catch {
        $("#helpMessage").focus();
        $("#helpMessage").select();
        document.execCommand("copy");
        toast("Message copied.");
      }
    };
    helpForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!helpForm.reportValidity()) return;
      const message = buildHelpMessage();
      $("#helpMessage").value = message;
      $("#helpOutput").hidden = false;
      if (!navigator.share) return copyHelpMessage();
      try {
        await navigator.share({ title: "Khardz Kutz booking help", text: message });
        toast("Message shared.");
      } catch (error) {
        if (error.name !== "AbortError") toast("Message ready below.");
      }
    });
    $("#copyHelp")?.addEventListener("click", copyHelpMessage);
  }
})();

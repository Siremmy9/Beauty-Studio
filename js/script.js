/* =========================================================
   Angel's Treat — script.js
   Public site logic. Vanilla JS, ES6+.
   Uses localStorage to simulate a backend for this demo.
   TODO: Replace localStorage with API/database integration in production.
   ========================================================= */

/* ---------- 1. CONFIG ---------- */
const STUDIO_CONFIG = {
  name: "Angel's Treat",
  phone: "+2348141713798",
  whatsapp: "2348141713798", // digits only, no + , used for wa.me links
  email: "hello@angelstreat.com",
  address: "23 Seriki Balogun street, Bashorun Estate, Majek",
  instagram: "https://instagram.com/angelstreat",
  facebook: "https://facebook.com/angelstreat",
  tiktok: "https://tiktok.com/@angelstreat",
  whatsappDefaultMessage: "Hello, I'd like to make an appointment.",
};

/* ---------- 2. DEMO DATA (mark clearly — remove/replace for production) ---------- */
// DEMO DATA START
const SERVICES = [
  {
    id: "bridal",
    name: "Bridal Makeup",
    desc: "Luxury makeup for your most unforgettable day.",
    price: "From ₦120,000",
    duration: "120 mins",
    img: "./assets/images/finger.jpg",
    includes: [
      "Pre-wedding trial session",
      "Skin prep & long-wear base",
      "HD bridal application",
      "False lash styling",
      "Touch-up kit",
    ],
  },
  {
    id: "signature",
    name: "Signature Glam",
    desc: "A polished glam experience for special occasions.",
    price: "From ₦65,000",
    duration: "90 mins",
    img: "./assets/images/image1.jpg",
    includes: [
      "Full face HD makeup",
      "Premium lash application",
      "Contour & highlight",
      "Long-wear setting spray",
    ],
  },
  {
    id: "soft-glam",
    name: "Soft Glam",
    desc: "Elegant, natural-looking beauty.",
    price: "From ₦45,000",
    duration: "60 mins",
    img: "./assets/images/image2.jpg",
    includes: [
      "Skin prep & priming",
      "Natural glam application",
      "Soft lash styling",
      "Dewy finish setting",
    ],
  },
  {
    id: "photoshoot",
    name: "Photoshoot Makeup",
    desc: "Camera-ready makeup for professional shoots.",
    price: "From ₦70,000",
    duration: "90 mins",
    img: "./assets/images/image4.jpg",
    includes: [
      "HD camera-ready base",
      "Studio lighting-tested finish",
      "Touch-ups between looks",
      "Optional look changes",
    ],
  },
  {
    id: "events",
    name: "Event Makeup",
    desc: "Look flawless for birthdays, dinners and celebrations.",
    price: "From ₦50,000",
    duration: "60 mins",
    img: "./assets/images/pro.jpg",
    includes: [
      "Skin prep & priming",
      "Full glam application",
      "Lash styling",
      "60 minute session",
    ],
  },
  {
    id: "traditional",
    name: "Traditional Makeup",
    desc: "Beautiful looks for Nigerian traditional events.",
    price: "From ₦90,000",
    duration: "100 mins",
    img: "./assets/images/fingers.jpg",
    includes: [
      "Bold, long-wear application",
      "Gele-ready base finish",
      "Statement lash styling",
      "Touch-up kit",
    ],
  },
];

const GALLERY_ITEMS = [
  {
    src: "./assets/images/image2.jpg",
    category: "bridal",
    caption: "Bridal — Radiant Ivory",
  },
  {
    src: "./assets/images/pro.jpg",
    category: "signature",
    caption: "Signature Glam — Evening",
  },
  {
    src: "./assets/images/image6.jpg",
    category: "soft-glam",
    caption: "Soft Glam — Daytime",
  },
  {
    src: "./assets/images/image4.jpg",
    category: "events",
    caption: "Event Glam — Gold Hour",
  },
  {
    src: "./assets/images/image3.jpg",
    category: "photoshoot",
    caption: "Editorial — Studio Light",
  },
  {
    src: "./assets/images/image2.jpg",
    category: "bridal",
    caption: "Bridal — Classic Glow",
  },
  {
    src: "./assets/images/image1.jpg",
    category: "soft-glam",
    caption: "Soft Glam — Rose Nude",
  },
  {
    src: "./assets/images/nails1.jpg",
    category: "signature",
    caption: "Signature — Bold Lip",
  },
  {
    src: "./assets/images/nails2.jpg",
    category: "photoshoot",
    caption: "Editorial — Highlight",
  },
];

const TESTIMONIALS = [
  {
    name: "Chiamaka O.",
    role: "Bride, Lagos",
    img: "./assets/images/client1.jpg",
    text: "Angel's Treat made my wedding morning feel like a dream. My makeup lasted from 9am to midnight — flawless.",
  },
  {
    name: "Adaeze N.",
    role: "Brand Executive",
    img: "./assets/images/client2.jpg",
    text: "The soft glam look was so natural yet camera-ready. I get compliments every time I wear my Angel's Treat face.",
  },
];

const FAQS = [
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 2 weeks in advance for regular appointments and 2–3 months for bridal packages, to secure your preferred date.",
  },
  {
    q: "Do you offer bridal makeup?",
    a: "Yes — our Bridal Experience package includes a trial session, wedding day application and a touch-up kit for your entire day.",
  },
  {
    q: "Do you travel to clients?",
    a: "Yes, we offer on-location services across Lagos for an additional travel fee, calculated based on distance from our studio.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfer, debit cards and cash. A 50% deposit is required to confirm bridal bookings.",
  },
  {
    q: "Can I reschedule?",
    a: "Absolutely — please notify us at least 48 hours in advance and we'll be happy to find a new slot for you.",
  },
  {
    q: "How long does an appointment take?",
    a: "Most appointments take 60–120 minutes depending on the service. Bridal looks may take up to 2.5 hours.",
  },
];
// DEMO DATA END

/* ---------- 3. UTILITIES ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(message, type = "info") {
  const container = $("#toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 450);
  }, 3600);
}

function genBookingRef() {
  const year = new Date().getFullYear();
  const existing = JSON.parse(localStorage.getItem("ma_bookings") || "[]");
  const next = String(existing.length + 1).padStart(3, "0");
  return `LUX-${year}-${next}`;
}

/* ---------- 4. LOADER ---------- */
window.addEventListener("load", () => {
  setTimeout(() => $("#loader").classList.add("hidden"), 550);
});

/* ---------- 5. NAVBAR ---------- */
const navbar = $("#navbar");
const sections = $$("section[id]");
const navLinks = $$(".nav-links a");

function onScroll() {
  navbar.classList.toggle("scrolled", window.scrollY > 60);

  let current = "";
  sections.forEach((sec) => {
    const top = sec.offsetTop - 140;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${current}`,
    );
  });
}
window.addEventListener("scroll", onScroll);
onScroll();

/* ---------- 6. MOBILE MENU ---------- */
const hamburger = $("#hamburger");
const mobileMenu = $("#mobileMenu");

hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});
$$(".mobile-menu a").forEach((a) =>
  a.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }),
);

/* ---------- 7. THEME TOGGLE ---------- */
const themeToggle = $("#themeToggle");
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("ma_theme", theme);
}
applyTheme(localStorage.getItem("ma_theme") || "light");
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

/* ---------- 8. STAT COUNTERS ---------- */
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const decimals = parseInt(el.dataset.decimal || "0", 10);
      let current = 0;
      const steps = 60;
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current.toFixed(decimals) + suffix;
      }, 25);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 },
);
$$(".stat h3").forEach((el) => statObserver.observe(el));

/* ---------- 9. SCROLL REVEAL ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);
$$(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- 10. RENDER SERVICES ---------- */
const serviceGrid = $("#serviceGrid");
SERVICES.forEach((svc, i) => {
  const card = document.createElement("article");
  card.className = "service-card reveal";
  card.style.transitionDelay = `${(i % 3) * 0.08}s`;
  card.innerHTML = `
    <div class="service-media">
      <img src="${svc.img}" alt="${svc.name} example look" loading="lazy">
      <span class="service-price-tag">${svc.price}</span>
    </div>
    <div class="service-body">
      <h3>${svc.name}</h3>
      <p>${svc.desc}</p>
      <div class="service-meta">
        <span class="service-duration">${svc.duration}</span>
        <button class="service-link" data-id="${svc.id}">View Details</button>
      </div>
    </div>`;
  serviceGrid.appendChild(card);
});
const serviceCardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        serviceCardObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);
$$(".service-card").forEach((c) => serviceCardObserver.observe(c));

/* Populate booking service select */
const bkServiceSelect = $("#bkService");
SERVICES.forEach((svc) => {
  const opt = document.createElement("option");
  opt.value = svc.name;
  opt.textContent = `${svc.name} — ${svc.price}`;
  bkServiceSelect.appendChild(opt);
});

/* ---------- 11. SERVICE MODAL ---------- */
const serviceModal = $("#serviceModal");
function openServiceModal(id) {
  const svc = SERVICES.find((s) => s.id === id);
  if (!svc) return;
  $("#modalImg").src = svc.img;
  $("#modalImg").alt = svc.name;
  $("#modalName").textContent = svc.name;
  $("#modalDesc").textContent = svc.desc;
  $("#modalPrice").textContent = `${svc.price} · ${svc.duration}`;
  $("#modalIncludes").innerHTML = svc.includes
    .map((i) => `<li>${i}</li>`)
    .join("");
  serviceModal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(overlay) {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}
serviceGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("service-link"))
    openServiceModal(e.target.dataset.id);
});
$("#closeServiceModal").addEventListener("click", () =>
  closeModal(serviceModal),
);
serviceModal.addEventListener("click", (e) => {
  if (e.target === serviceModal) closeModal(serviceModal);
});
$("#modalBookBtn").addEventListener("click", () => closeModal(serviceModal));

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  [serviceModal, $("#confirmModal")].forEach((m) => {
    if (m.classList.contains("open")) closeModal(m);
  });
  if ($("#lightbox").classList.contains("open")) closeLightbox();
});

/* ---------- 12. BOOKING FORM ---------- */
const bookingForm = $("#bookingForm");
$("#bkDate").min = new Date().toISOString().split("T")[0];

function validateField(field, condition) {
  field.classList.toggle("invalid", !condition);
  return condition;
}

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#bkName"),
    phone = $("#bkPhone"),
    email = $("#bkEmail"),
    service = $("#bkService"),
    date = $("#bkDate"),
    time = $("#bkTime");

  const today = new Date().toISOString().split("T")[0];
  let valid = true;
  valid =
    validateField(name.closest(".field"), name.value.trim().length > 2) &&
    valid;
  valid =
    validateField(
      phone.closest(".field"),
      /^[+\d][\d\s-]{7,}$/.test(phone.value.trim()),
    ) && valid;
  valid =
    validateField(
      email.closest(".field"),
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),
    ) && valid;
  valid =
    validateField(service.closest(".field"), service.value !== "") && valid;
  valid =
    validateField(
      date.closest(".field"),
      date.value !== "" && date.value >= today,
    ) && valid;
  valid = validateField(time.closest(".field"), time.value !== "") && valid;

  if (!valid) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  const ref = genBookingRef();
  const booking = {
    ref,
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    service: service.value,
    date: date.value,
    time: time.value,
    notes: $("#bkNotes").value.trim(),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  // TODO: Replace localStorage with API/database integration in production.
  const bookings = JSON.parse(localStorage.getItem("ma_bookings") || "[]");
  bookings.push(booking);
  localStorage.setItem("ma_bookings", JSON.stringify(bookings));

  // Add a matching admin notification
  const notifications = JSON.parse(
    localStorage.getItem("ma_notifications") || "[]",
  );
  notifications.unshift({
    id: Date.now(),
    text: `New appointment request from ${booking.name}.`,
    read: false,
    time: new Date().toISOString(),
  });
  localStorage.setItem("ma_notifications", JSON.stringify(notifications));

  $("#bookingRefBox").innerHTML = `
    <div><span class="k">Reference</span><span class="v">${ref}</span></div>
    <div><span class="k">Service</span><span class="v">${booking.service}</span></div>
    <div><span class="k">Date</span><span class="v">${booking.date}</span></div>
    <div><span class="k">Time</span><span class="v">${booking.time}</span></div>`;

  const waMsg = encodeURIComponent(
    `Hi Angel's Treat, I just booked ${booking.service} on ${booking.date} at ${booking.time}. My reference is ${ref}.`,
  );
  $("#whatsappConfirmBtn").href =
    `https://wa.me/${STUDIO_CONFIG.whatsapp}?text=${waMsg}`;

  $("#confirmModal").classList.add("open");
  document.body.style.overflow = "hidden";
  bookingForm.reset();
  showToast(`Appointment ${ref} requested successfully.`, "success");
});

$("#closeConfirmModal").addEventListener("click", () =>
  closeModal($("#confirmModal")),
);
$("#closeConfirmBtn").addEventListener("click", () =>
  closeModal($("#confirmModal")),
);
$("#confirmModal").addEventListener("click", (e) => {
  if (e.target === $("#confirmModal")) closeModal($("#confirmModal"));
});

/* ---------- 13. WHATSAPP FLOAT + CONFIG ---------- */
const waMsgDefault = encodeURIComponent(STUDIO_CONFIG.whatsappDefaultMessage);
$("#waFloat").href =
  `https://wa.me/${STUDIO_CONFIG.whatsapp}?text=${waMsgDefault}`;

/* ---------- 14. GALLERY ---------- */
const masonryGrid = $("#masonryGrid");
GALLERY_ITEMS.forEach((item, i) => {
  const el = document.createElement("div");
  el.className = "masonry-item";
  el.dataset.category = item.category;
  el.dataset.index = i;
  el.innerHTML = `<img src="${item.src}" alt="${item.caption}" loading="lazy"><div class="g-overlay"><span>${item.caption}</span></div>`;
  masonryGrid.appendChild(el);
});

$$(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    $$(".masonry-item").forEach((item) => {
      const match = filter === "all" || item.dataset.category === filter;
      item.classList.toggle("hide", !match);
    });
  });
});

/* ---------- 15. LIGHTBOX ---------- */
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxCounter = $("#lightboxCounter");
let currentLightboxIndex = 0;

function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightbox();
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}
function updateLightbox() {
  const item = GALLERY_ITEMS[currentLightboxIndex];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.caption;
  lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${GALLERY_ITEMS.length}`;
}
function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}
masonryGrid.addEventListener("click", (e) => {
  const item = e.target.closest(".masonry-item");
  if (item) openLightbox(parseInt(item.dataset.index, 10));
});
$("#lightboxClose").addEventListener("click", closeLightbox);
$("#lightboxPrev").addEventListener("click", () => {
  currentLightboxIndex =
    (currentLightboxIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
  updateLightbox();
});
$("#lightboxNext").addEventListener("click", () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % GALLERY_ITEMS.length;
  updateLightbox();
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* ---------- 16. TESTIMONIAL SLIDER ---------- */
const tTrack = $("#tTrack");
TESTIMONIALS.forEach((t) => {
  const slide = document.createElement("div");
  slide.className = "t-slide";
  slide.innerHTML = `
    <div class="stars">★★★★★</div>
    <p class="quote">"${t.text}"</p>
    <div class="t-person">
      <img src="${t.img}" alt="${t.name}">
      <div style="text-align:left;">
        <div class="name">${t.name}</div>
        <div class="role">${t.role}</div>
      </div>
    </div>`;
  tTrack.appendChild(slide);
});

let tIndex = 0;
function goToSlide(i) {
  tIndex = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
  tTrack.style.transform = `translateX(-${tIndex * 100}%)`;
}
$("#tPrev").addEventListener("click", () => goToSlide(tIndex - 1));
$("#tNext").addEventListener("click", () => goToSlide(tIndex + 1));

let tAutoTimer = setInterval(() => goToSlide(tIndex + 1), 5500);
const tSlider = $(".t-slider");
tSlider.addEventListener("mouseenter", () => clearInterval(tAutoTimer));
tSlider.addEventListener("mouseleave", () => {
  tAutoTimer = setInterval(() => goToSlide(tIndex + 1), 5500);
});

// basic swipe support
let touchStartX = 0;
tSlider.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
  },
  { passive: true },
);
tSlider.addEventListener(
  "touchend",
  (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) goToSlide(diff > 0 ? tIndex - 1 : tIndex + 1);
  },
  { passive: true },
);

/* ---------- 17. FAQ ACCORDION ---------- */
const faqList = $("#faqList");
FAQS.forEach((item) => {
  const el = document.createElement("div");
  el.className = "faq-item";
  el.innerHTML = `
    <button class="faq-q" aria-expanded="false">${item.q}<span class="plus">+</span></button>
    <div class="faq-a"><p>${item.a}</p></div>`;
  faqList.appendChild(el);
});
faqList.addEventListener("click", (e) => {
  const btn = e.target.closest(".faq-q");
  if (!btn) return;
  const item = btn.closest(".faq-item");
  const answer = item.querySelector(".faq-a");
  const isOpen = item.classList.contains("open");

  $$(".faq-item").forEach((f) => {
    f.classList.remove("open");
    f.querySelector(".faq-a").style.maxHeight = null;
    f.querySelector(".faq-q").setAttribute("aria-expanded", "false");
  });

  if (!isOpen) {
    item.classList.add("open");
    answer.style.maxHeight = answer.scrollHeight + "px";
    btn.setAttribute("aria-expanded", "true");
  }
});

/* ---------- 18. CONTACT FORM ---------- */
const contactForm = $("#contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#cName"),
    email = $("#cEmail"),
    phone = $("#cPhone"),
    message = $("#cMessage");
  let valid = true;
  valid =
    validateField(name.closest(".field"), name.value.trim().length > 1) &&
    valid;
  valid =
    validateField(
      email.closest(".field"),
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),
    ) && valid;
  valid =
    validateField(
      phone.closest(".field"),
      /^[+\d][\d\s-]{7,}$/.test(phone.value.trim()),
    ) && valid;
  valid =
    validateField(message.closest(".field"), message.value.trim().length > 4) &&
    valid;

  if (!valid) {
    showToast("Please check the form for errors.", "error");
    return;
  }

  // TODO: Replace localStorage with API/database integration in production.
  const messages = JSON.parse(localStorage.getItem("ma_messages") || "[]");
  messages.push({
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    message: message.value.trim(),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("ma_messages", JSON.stringify(messages));

  showToast("Message sent! We'll be in touch shortly.", "success");
  contactForm.reset();
});

/* ---------- 13b. TRACK BOOKING ---------- */
const trackForm = $("#trackForm");
const trackError = $("#trackError");
const trackResult = $("#trackResult");

function normalize(str) {
  return (str || "").toString().trim().toLowerCase().replace(/[\s-]/g, "");
}

trackForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const refInput = normalize($("#trackRef").value);
  const contactInput = normalize($("#trackContact").value);

  if (!refInput || !contactInput) {
    trackError.textContent =
      "Please enter both your booking reference and the phone number or email you booked with.";
    trackError.classList.add("show");
    trackResult.classList.remove("show");
    return;
  }

  const bookings = JSON.parse(localStorage.getItem("ma_bookings") || "[]");
  const match = bookings.find(
    (b) =>
      normalize(b.ref) === refInput &&
      (normalize(b.phone) === contactInput ||
        normalize(b.email) === contactInput),
  );

  if (!match) {
    trackError.textContent =
      "We couldn't find a booking matching those details. Please check your reference and contact info.";
    trackError.classList.add("show");
    trackResult.classList.remove("show");
    return;
  }

  trackError.classList.remove("show");
  renderTrackResult(match);
});

function renderTrackResult(booking) {
  $("#resultRef").textContent = booking.ref;
  $("#resultService").textContent = booking.service;
  $("#resultDate").textContent = booking.date;
  $("#resultTime").textContent = booking.time;
  $("#resultName").textContent = booking.name;

  const badge = $("#resultStatusBadge");
  badge.textContent = booking.status;
  badge.className = `status-badge ${booking.status.toLowerCase()}`;

  const order = ["Pending", "Confirmed", "Completed"];
  const steps = $$("#trackSteps .track-step");

  steps.forEach((step) =>
    step.classList.remove("done", "current", "cancelled-step"),
  );

  if (booking.status === "Cancelled") {
    steps.forEach((step) => step.classList.add("cancelled-step"));
  } else {
    const currentIndex = order.indexOf(booking.status);
    steps.forEach((step, i) => {
      if (i < currentIndex) step.classList.add("done");
      else if (i === currentIndex) {
        step.classList.add("done", "current");
      }
    });
  }

  trackResult.classList.add("show");
}

/* ---------- 19. SEED DEMO DATA FOR ADMIN (only runs once) ---------- */
(function seedDemoData() {
  if (localStorage.getItem("ma_seeded")) return;

  const demoClients = [
    {
      name: "Chiamaka Okafor",
      phone: "+2348012345001",
      email: "chiamaka.o@email.com",
    },
    {
      name: "Funmi Adebayo",
      phone: "+2348012345002",
      email: "funmi.a@email.com",
    },
    {
      name: "Ngozi Eze",
      phone: "+2348012345003",
      email: "ngozi.eze@email.com",
    },
    {
      name: "Bisi Lawal",
      phone: "+2348012345004",
      email: "bisi.lawal@email.com",
    },
    {
      name: "Amaka Johnson",
      phone: "+2348012345005",
      email: "amaka.j@email.com",
    },
    {
      name: "Tolu Fashina",
      phone: "+2348012345006",
      email: "tolu.f@email.com",
    },
  ];

  const demoBookings = [
    {
      ref: "LUX-2026-001",
      name: "Chiamaka Okafor",
      phone: "+2348012345001",
      email: "chiamaka.o@email.com",
      service: "Bridal Makeup",
      date: "2026-09-12",
      time: "08:00",
      notes: "Trial requested first.",
      status: "Confirmed",
    },
    {
      ref: "LUX-2026-002",
      name: "Funmi Adebayo",
      phone: "+2348012345002",
      email: "funmi.a@email.com",
      service: "Signature Glam",
      date: "2026-09-08",
      time: "14:00",
      notes: "",
      status: "Pending",
    },
    {
      ref: "LUX-2026-003",
      name: "Ngozi Eze",
      phone: "+2348012345003",
      email: "ngozi.eze@email.com",
      service: "Soft Glam",
      date: "2026-09-05",
      time: "10:30",
      notes: "",
      status: "Completed",
    },
    {
      ref: "LUX-2026-004",
      name: "Bisi Lawal",
      phone: "+2348012345004",
      email: "bisi.lawal@email.com",
      service: "Event Makeup",
      date: "2026-09-20",
      time: "16:00",
      notes: "Birthday dinner.",
      status: "Confirmed",
    },
    {
      ref: "LUX-2026-005",
      name: "Amaka Johnson",
      phone: "+2348012345005",
      email: "amaka.j@email.com",
      service: "Photoshoot Makeup",
      date: "2026-09-03",
      time: "09:00",
      notes: "",
      status: "Completed",
    },
    {
      ref: "LUX-2026-006",
      name: "Tolu Fashina",
      phone: "+2348012345006",
      email: "tolu.f@email.com",
      service: "Traditional Makeup",
      date: "2026-09-25",
      time: "07:30",
      notes: "Igbo traditional wedding.",
      status: "Pending",
    },
    {
      ref: "LUX-2026-007",
      name: "Chiamaka Okafor",
      phone: "+2348012345001",
      email: "chiamaka.o@email.com",
      service: "Soft Glam",
      date: "2026-08-28",
      time: "11:00",
      notes: "",
      status: "Completed",
    },
    {
      ref: "LUX-2026-008",
      name: "Funmi Adebayo",
      phone: "+2348012345002",
      email: "funmi.a@email.com",
      service: "Signature Glam",
      date: "2026-08-22",
      time: "13:00",
      notes: "",
      status: "Cancelled",
    },
    {
      ref: "LUX-2026-009",
      name: "Ngozi Eze",
      phone: "+2348012345003",
      email: "ngozi.eze@email.com",
      service: "Event Makeup",
      date: "2026-09-14",
      time: "15:00",
      notes: "",
      status: "Pending",
    },
    {
      ref: "LUX-2026-010",
      name: "Bisi Lawal",
      phone: "+2348012345004",
      email: "bisi.lawal@email.com",
      service: "Bridal Makeup",
      date: "2026-10-02",
      time: "07:00",
      notes: "Trial completed.",
      status: "Confirmed",
    },
    {
      ref: "LUX-2026-011",
      name: "Amaka Johnson",
      phone: "+2348012345005",
      email: "amaka.j@email.com",
      service: "Soft Glam",
      date: "2026-09-01",
      time: "12:00",
      notes: "",
      status: "Completed",
    },
  ];

  const demoActivities = [
    {
      date: "2026-09-05",
      type: "Service",
      description: "Completed 3 soft glam appointments.",
      revenue: 135000,
      expense: 0,
      notes: "Great client feedback.",
    },
    {
      date: "2026-09-03",
      type: "Service",
      description: "Photoshoot makeup session for a magazine editorial.",
      revenue: 70000,
      expense: 8000,
      notes: "Travel to studio location.",
    },
    {
      date: "2026-08-28",
      type: "Service",
      description: "Bridal trial session completed.",
      revenue: 30000,
      expense: 0,
      notes: "",
    },
    {
      date: "2026-08-22",
      type: "Expense",
      description: "Restocked premium foundation and setting spray.",
      revenue: 0,
      expense: 65000,
      notes: "Supplier: GlowSupply NG",
    },
    {
      date: "2026-08-18",
      type: "Service",
      description: "Completed 5 event makeup appointments.",
      revenue: 250000,
      expense: 0,
      notes: "Referral surge from Instagram.",
    },
  ];

  const demoNotifications = [
    {
      id: 1,
      text: "New appointment request from Ngozi Eze.",
      read: false,
      time: new Date(Date.now() - 3600e3).toISOString(),
    },
    {
      id: 2,
      text: "Appointment confirmed for Bisi Lawal.",
      read: false,
      time: new Date(Date.now() - 7200e3).toISOString(),
    },
    {
      id: 3,
      text: "New client registered: Tolu Fashina.",
      read: true,
      time: new Date(Date.now() - 86400e3).toISOString(),
    },
  ];

  localStorage.setItem("ma_clients", JSON.stringify(demoClients));
  localStorage.setItem("ma_bookings", JSON.stringify(demoBookings));
  localStorage.setItem("ma_activities", JSON.stringify(demoActivities));
  localStorage.setItem("ma_notifications", JSON.stringify(demoNotifications));
  localStorage.setItem("ma_services", JSON.stringify(SERVICES));
  localStorage.setItem("ma_gallery", JSON.stringify(GALLERY_ITEMS));
  localStorage.setItem("ma_seeded", "true");
})();

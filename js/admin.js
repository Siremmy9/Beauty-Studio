/* =========================================================
   Angel's Treat — admin.js
   Admin dashboard logic. Vanilla JS, ES6+.
   Uses localStorage to simulate a backend for this demo.
   TODO: Replace localStorage with API/database integration in production.
   TODO: Replace demo authentication with secure server-side authentication.
   ========================================================= */

/* ---------- 1. DEMO AUTH CONFIG ---------- */
const ADMIN_CREDENTIALS = { email: "admin@beautystudio.com", password: "admin123" };

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function money(n) { return "₦" + Number(n || 0).toLocaleString("en-NG"); }

function showToast(message, type = "info") {
  const container = $("#a-toast-container");
  const toast = document.createElement("div");
  toast.className = `a-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 3200);
}

/* ---------- 2. DATA HELPERS ---------- */
const DB = {
  get(key, fallback = []) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

/* ---------- 3. AUTH ---------- */
const loginScreen = $("#loginScreen");
const adminApp = $("#adminApp");

function checkAuth() {
  if (localStorage.getItem("ma_admin_auth") === "true") {
    loginScreen.style.display = "none";
    adminApp.classList.add("active");
    initDashboard();
  } else {
    loginScreen.style.display = "flex";
    adminApp.classList.remove("active");
  }
}

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#loginEmail").value.trim();
  const password = $("#loginPassword").value;
  const errorEl = $("#loginError");

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    // TODO: Replace demo authentication with secure server-side authentication.
    localStorage.setItem("ma_admin_auth", "true");
    errorEl.classList.remove("show");
    checkAuth();
  } else {
    errorEl.classList.add("show");
  }
});

$("#logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("ma_admin_auth");
  checkAuth();
});

/* ---------- 4. NAVIGATION ---------- */
function initNav() {
  $$(".side-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".side-nav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".page").forEach(p => p.classList.remove("active"));
      $(`#page-${btn.dataset.page}`).classList.add("active");
      $("#pageTitle").textContent = btn.textContent.trim();
      $("#sidebar").classList.remove("open");
      renderPage(btn.dataset.page);
    });
  });
  $("#drawerToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
}

function renderPage(page) {
  const renderers = {
    overview: renderOverview, appointments: renderAppointments, calendar: renderCalendar,
    clients: renderClients, activity: renderActivity, analytics: renderAnalytics,
    services: renderServices, gallery: renderGallery, settings: renderSettings
  };
  if (renderers[page]) renderers[page]();
}

/* ---------- 5. INIT ---------- */
function initDashboard() {
  initNav();
  initNotifications();
  initModals();
  renderOverview();
}

/* ---------- 6. OVERVIEW ---------- */
function renderOverview() {
  const bookings = DB.get("ma_bookings");
  const clients = DB.get("ma_clients");
  const activities = DB.get("ma_activities");
  const today = new Date().toISOString().split("T")[0];

  const todays = bookings.filter(b => b.date === today).length;
  const pending = bookings.filter(b => b.status === "Pending").length;
  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const completed = bookings.filter(b => b.status === "Completed").length;
  const revenue = activities.reduce((sum, a) => sum + (a.revenue || 0), 0);

  const kpis = [
    { label: "TODAY'S APPOINTMENTS", value: todays, icon: "📅", color: "var(--accent)" },
    { label: "PENDING APPOINTMENTS", value: pending, icon: "⏳", color: "var(--amber)" },
    { label: "CONFIRMED APPOINTMENTS", value: confirmed, icon: "✔", color: "var(--accent)" },
    { label: "TOTAL CLIENTS", value: clients.length, icon: "◈", color: "var(--gold)" },
    { label: "MONTHLY REVENUE", value: money(revenue), icon: "₦", color: "var(--green)" },
    { label: "COMPLETED SERVICES", value: completed, icon: "✓", color: "var(--green)" }
  ];
  $("#kpiGrid").innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon" style="background:${k.color}22; color:${k.color};">${k.icon}</div>
      <h3 data-final="${k.value}">0</h3>
      <p>${k.label}</p>
    </div>`).join("");
  animateKpis(kpis);

  renderApptBarChart(bookings);
  renderDonut(bookings);
  renderRevenueChart(activities);
  renderPopularServices(bookings, "#popularServices");
}

function animateKpis(kpis) {
  $$("#kpiGrid h3").forEach((el, i) => {
    const final = kpis[i].value;
    if (typeof final === "string") { el.textContent = final; return; }
    let cur = 0; const steps = 30; const inc = final / steps || 0;
    const t = setInterval(() => { cur += inc; if (cur >= final) { cur = final; clearInterval(t); } el.textContent = Math.round(cur); }, 20);
  });
}

function renderApptBarChart(bookings) {
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const max = Math.max(1, ...days.map(d => bookings.filter(b => b.date === d.toISOString().split("T")[0]).length));
  $("#apptChart").innerHTML = days.map(d => {
    const count = bookings.filter(b => b.date === d.toISOString().split("T")[0]).length;
    const h = Math.max(6, (count / max) * 160);
    return `<div class="bar-col"><div class="bar" style="height:${h}px;" title="${count}"></div><span class="bar-label">${d.toLocaleDateString("en-US",{weekday:"short"})}</span></div>`;
  }).join("");
}

function renderDonut(bookings) {
  const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
  const colors = { Pending: "#E0A951", Confirmed: "#8E7CF0", Completed: "#57C08A", Cancelled: "#E5695F" };
  const counts = statuses.map(s => bookings.filter(b => b.status === s).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;

  let offset = 0;
  const r = 55, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let circles = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#262C36" stroke-width="18"></circle>`;
  statuses.forEach((s, i) => {
    const frac = counts[i] / total;
    const dash = frac * circ;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[s]}" stroke-width="18"
      stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"></circle>`;
    offset += dash;
  });
  $("#donutSvg").innerHTML = circles;
  $("#donutLegend").innerHTML = statuses.map((s, i) => `<li><span class="dot" style="background:${colors[s]}"></span>${s} (${counts[i]})</li>`).join("");
}

function renderRevenueChart(activities) {
  const last = activities.slice(-6);
  const max = Math.max(1, ...last.map(a => a.revenue || 0));
  $("#revenueChart").innerHTML = last.map(a => {
    const h = Math.max(6, ((a.revenue || 0) / max) * 160);
    const label = new Date(a.date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
    return `<div class="bar-col"><div class="bar" style="height:${h}px;" title="${money(a.revenue)}"></div><span class="bar-label">${label}</span></div>`;
  }).join("") || `<p style="color:var(--text-dim); font-size:13px;">No revenue activity yet.</p>`;
}

function renderPopularServices(bookings, target) {
  const counts = {};
  bookings.forEach(b => { counts[b.service] = (counts[b.service] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(1, ...sorted.map(s => s[1]));
  $(target).innerHTML = sorted.map(([name, count]) => `
    <li>
      <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:6px;"><span>${name}</span><span style="color:var(--text-dim);">${count}</span></div>
      <div style="height:6px; background:var(--bg-panel-2); border-radius:100px; overflow:hidden;">
        <div style="height:100%; width:${(count/max)*100}%; background:var(--gold); border-radius:100px;"></div>
      </div>
    </li>`).join("") || `<p style="color:var(--text-dim); font-size:13px;">No bookings yet.</p>`;
}

/* ---------- 7. APPOINTMENTS ---------- */
let apptFilterText = "", apptFilterStatus = "all";
function renderAppointments() {
  const bookings = DB.get("ma_bookings");
  const filtered = bookings.filter(b =>
    (apptFilterStatus === "all" || b.status === apptFilterStatus) &&
    b.name.toLowerCase().includes(apptFilterText.toLowerCase())
  );

  $("#apptTableBody").innerHTML = filtered.length ? filtered.map(b => `
    <tr>
      <td data-label="Client">${b.name}<br><span style="color:var(--text-dim); font-size:11.5px;">${b.ref}</span></td>
      <td data-label="Service">${b.service}</td>
      <td data-label="Date">${b.date}</td>
      <td data-label="Time">${b.time}</td>
      <td data-label="Status"><span class="status-pill status-${b.status.toLowerCase()}">${b.status}</span></td>
      <td data-label="Actions">
        <div class="row-actions">
          <button data-view="${b.ref}" title="View">👁</button>
        </div>
      </td>
    </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state">No appointments match your filters.</div></td></tr>`;
}

$("#apptSearch")?.addEventListener("input", (e) => { apptFilterText = e.target.value; renderAppointments(); });
$("#apptStatusFilter")?.addEventListener("change", (e) => { apptFilterStatus = e.target.value; renderAppointments(); });

let activeApptRef = null;
function openApptModal(ref) {
  const bookings = DB.get("ma_bookings");
  const b = bookings.find(x => x.ref === ref);
  if (!b) return;
  activeApptRef = ref;
  $("#apptModalBody").innerHTML = `
    <div class="detail-row"><span class="k">Reference</span><span>${b.ref}</span></div>
    <div class="detail-row"><span class="k">Client</span><span>${b.name}</span></div>
    <div class="detail-row"><span class="k">Phone</span><span>${b.phone}</span></div>
    <div class="detail-row"><span class="k">Email</span><span>${b.email}</span></div>
    <div class="detail-row"><span class="k">Service</span><span>${b.service}</span></div>
    <div class="detail-row"><span class="k">Date</span><span>${b.date}</span></div>
    <div class="detail-row"><span class="k">Time</span><span>${b.time}</span></div>
    <div class="detail-row"><span class="k">Notes</span><span>${b.notes || "—"}</span></div>
    <div class="detail-row"><span class="k">Status</span><span class="status-pill status-${b.status.toLowerCase()}">${b.status}</span></div>`;
  $("#apptModal").classList.add("open");
}

$("#apptTableBody")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-view]");
  if (btn) openApptModal(btn.dataset.view);
});

$("#apptModal .a-modal-actions")?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn || !activeApptRef) return;
  const action = btn.dataset.action;
  let bookings = DB.get("ma_bookings");

  if (action === "Delete") {
    bookings = bookings.filter(b => b.ref !== activeApptRef);
    showToast("Appointment deleted.", "warning");
  } else {
    bookings = bookings.map(b => b.ref === activeApptRef ? { ...b, status: action } : b);
    showToast(`Appointment marked ${action.toLowerCase()}.`, "success");
  }
  DB.set("ma_bookings", bookings);
  closeAllModals();
  renderAppointments();
  renderOverview();
}, true);

/* ---------- 8. CALENDAR ---------- */
let calDate = new Date();
function renderCalendar() {
  const bookings = DB.get("ma_bookings");
  const dowNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  $("#calDow").innerHTML = dowNames.map(d => `<div class="cal-dow">${d}</div>`).join("");

  const year = calDate.getFullYear(), month = calDate.getMonth();
  $("#calMonthLabel").textContent = calDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

  let cells = "";
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const dayBookings = bookings.filter(b => b.date === dateStr);
    const isToday = dateStr === todayStr;
    cells += `<div class="cal-cell ${isToday ? "today" : ""}">${d}
      <div class="cal-dots">${dayBookings.slice(0,4).map(b => `<span title="${b.name} — ${b.service}" data-ref="${b.ref}"></span>`).join("")}</div>
    </div>`;
  }
  $("#calGrid").innerHTML = cells;
}
$("#calPrev")?.addEventListener("click", () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); });
$("#calNext")?.addEventListener("click", () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); });
$("#calGrid")?.addEventListener("click", (e) => {
  const dot = e.target.closest("[data-ref]");
  if (dot) openApptModal(dot.dataset.ref);
});

/* ---------- 9. CLIENTS ---------- */
let clientFilterText = "";
function renderClients() {
  const clients = DB.get("ma_clients");
  const bookings = DB.get("ma_bookings");

  const enriched = clients.map(c => {
    const theirs = bookings.filter(b => b.name === c.name);
    const last = theirs.map(b => b.date).sort().reverse()[0] || "—";
    return { ...c, total: theirs.length, last };
  }).filter(c => c.name.toLowerCase().includes(clientFilterText.toLowerCase()));

  $("#clientTableBody").innerHTML = enriched.length ? enriched.map(c => `
    <tr>
      <td data-label="Name">${c.name}</td>
      <td data-label="Phone">${c.phone}</td>
      <td data-label="Email">${c.email}</td>
      <td data-label="Total Appointments">${c.total}</td>
      <td data-label="Last Appointment">${c.last}</td>
      <td data-label="Actions">
        <div class="row-actions">
          <button data-client-view="${c.phone}" title="View">👁</button>
          <button data-client-delete="${c.phone}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state">No clients found.</div></td></tr>`;
}
$("#clientSearch")?.addEventListener("input", (e) => { clientFilterText = e.target.value; renderClients(); });

$("#clientTableBody")?.addEventListener("click", (e) => {
  const viewBtn = e.target.closest("[data-client-view]");
  const delBtn = e.target.closest("[data-client-delete]");
  if (viewBtn) {
    const client = DB.get("ma_clients").find(c => c.phone === viewBtn.dataset.clientView);
    const bookings = DB.get("ma_bookings").filter(b => b.name === client.name);
    $("#clientModalBody").innerHTML = `
      <div class="detail-row"><span class="k">Name</span><span>${client.name}</span></div>
      <div class="detail-row"><span class="k">Phone</span><span>${client.phone}</span></div>
      <div class="detail-row"><span class="k">Email</span><span>${client.email}</span></div>
      <div class="detail-row"><span class="k">Total Appointments</span><span>${bookings.length}</span></div>
      <p style="margin:16px 0 8px; font-size:12px; color:var(--text-dim);">BOOKING HISTORY</p>
      ${bookings.map(b => `<div class="detail-row"><span class="k">${b.date} — ${b.service}</span><span class="status-pill status-${b.status.toLowerCase()}">${b.status}</span></div>`).join("") || "<p style='color:var(--text-dim); font-size:13px;'>No bookings yet.</p>"}`;
    $("#clientModal").classList.add("open");
  }
  if (delBtn) {
    const clients = DB.get("ma_clients").filter(c => c.phone !== delBtn.dataset.clientDelete);
    DB.set("ma_clients", clients);
    showToast("Client removed.", "warning");
    renderClients();
  }
});

/* ---------- 10. ACTIVITY LOG ---------- */
let activityFilterText = "", activityFilterDate = "";
function renderActivity() {
  let activities = DB.get("ma_activities").slice().sort((a,b) => b.date.localeCompare(a.date));
  activities = activities.filter(a =>
    a.description.toLowerCase().includes(activityFilterText.toLowerCase()) &&
    (!activityFilterDate || a.date === activityFilterDate)
  );

  $("#activityList").innerHTML = activities.length ? activities.map((a, i) => `
    <div class="activity-item">
      <div>
        <div class="a-desc">${a.description}</div>
        <div class="a-meta">${a.date} · ${a.type}${a.notes ? " · " + a.notes : ""}</div>
      </div>
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="text-align:right;">
          ${a.revenue ? `<div class="a-money pos">+${money(a.revenue)}</div>` : ""}
          ${a.expense ? `<div class="a-money neg">-${money(a.expense)}</div>` : ""}
        </div>
        <button class="a-btn a-btn-sm a-btn-danger" data-del-activity="${i}">🗑</button>
      </div>
    </div>`).join("") : `<div class="empty-state">No activity logged for this filter.</div>`;
}
$("#activitySearch")?.addEventListener("input", e => { activityFilterText = e.target.value; renderActivity(); });
$("#activityDateFilter")?.addEventListener("change", e => { activityFilterDate = e.target.value; renderActivity(); });

$("#addActivityBtn")?.addEventListener("click", () => {
  $("#activityForm").reset();
  $("#actDate").value = new Date().toISOString().split("T")[0];
  $("#activityModal").classList.add("open");
});

$("#activityForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const activities = DB.get("ma_activities");
  activities.push({
    date: $("#actDate").value, type: $("#actType").value, description: $("#actDesc").value.trim(),
    revenue: Number($("#actRevenue").value) || 0, expense: Number($("#actExpense").value) || 0, notes: $("#actNotes").value.trim()
  });
  DB.set("ma_activities", activities);
  closeAllModals();
  renderActivity();
  showToast("Activity saved.", "success");
});

$("#activityList")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del-activity]");
  if (!btn) return;
  let activities = DB.get("ma_activities").slice().sort((a,b) => b.date.localeCompare(a.date));
  activities.splice(Number(btn.dataset.delActivity), 1);
  // re-map back preserving original order roughly (fine for demo)
  DB.set("ma_activities", activities);
  renderActivity();
  showToast("Activity deleted.", "warning");
});

/* ---------- 11. ANALYTICS ---------- */
let analyticsRange = "month";
function withinRange(dateStr, range) {
  const d = new Date(dateStr); const now = new Date();
  const diffDays = (now - d) / 86400000;
  if (range === "today") return dateStr === now.toISOString().split("T")[0];
  if (range === "week") return diffDays <= 7 && diffDays >= 0;
  if (range === "month") return diffDays <= 30 && diffDays >= 0;
  if (range === "quarter") return diffDays <= 90 && diffDays >= 0;
  return true;
}

function renderAnalytics() {
  const bookings = DB.get("ma_bookings").filter(b => withinRange(b.date, analyticsRange));
  const activities = DB.get("ma_activities").filter(a => withinRange(a.date, analyticsRange));

  const totalBookings = bookings.length;
  const completed = bookings.filter(b => b.status === "Completed").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;
  const revenue = activities.reduce((s,a) => s + (a.revenue||0), 0);
  const expenses = activities.reduce((s,a) => s + (a.expense||0), 0);
  const profit = revenue - expenses;

  const kpis = [
    { label: "TOTAL BOOKINGS", value: totalBookings, color: "var(--accent)" },
    { label: "COMPLETED", value: completed, color: "var(--green)" },
    { label: "CANCELLED", value: cancelled, color: "var(--red)" },
    { label: "ESTIMATED PROFIT", value: money(profit), color: "var(--gold)" }
  ];
  $("#analyticsKpis").innerHTML = kpis.map(k => `
    <div class="kpi-card"><h3 style="color:${k.color};">${k.value}</h3><p>${k.label}</p></div>`).join("");

  renderPopularServices(bookings, "#analyticsPopular");

  const nameCounts = {};
  bookings.forEach(b => { nameCounts[b.name] = (nameCounts[b.name]||0)+1; });
  const returning = Object.entries(nameCounts).filter(([,c]) => c > 1).sort((a,b)=>b[1]-a[1]);
  $("#returningClients").innerHTML = returning.length ? returning.map(([name,count]) => `
    <li style="display:flex; justify-content:space-between; font-size:13px;"><span>${name}</span><span style="color:var(--gold); font-weight:700;">${count} visits</span></li>`).join("")
    : `<p style="color:var(--text-dim); font-size:13px;">No returning clients in this period.</p>`;
}

$("#analyticsFilters")?.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$(".chip", $("#analyticsFilters")).forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  analyticsRange = chip.dataset.range;
  renderAnalytics();
});

/* ---------- 12. SERVICES MANAGEMENT ---------- */
function renderServices() {
  const services = DB.get("ma_services");
  $("#serviceTableBody").innerHTML = services.map((s, i) => `
    <tr>
      <td data-label="Service">${s.name}</td>
      <td data-label="Price">${s.price}</td>
      <td data-label="Duration">${s.duration}</td>
      <td data-label="Status"><span class="status-pill ${s.enabled === false ? "status-cancelled" : "status-completed"}">${s.enabled === false ? "Disabled" : "Active"}</span></td>
      <td data-label="Actions">
        <div class="row-actions">
          <button data-edit-service="${i}" title="Edit">✎</button>
          <button data-delete-service="${i}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>`).join("");
}

$("#addServiceBtn")?.addEventListener("click", () => {
  $("#serviceForm").reset(); $("#svcEditId").value = ""; $("#svcEnabled").checked = true;
  $("#serviceFormTitle").textContent = "Add Service";
  $("#serviceFormModal").classList.add("open");
});

$("#serviceTableBody")?.addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit-service]");
  const delBtn = e.target.closest("[data-delete-service]");
  const services = DB.get("ma_services");
  if (editBtn) {
    const i = Number(editBtn.dataset.editService); const s = services[i];
    $("#svcEditId").value = i; $("#svcName").value = s.name; $("#svcDesc").value = s.desc;
    $("#svcPrice").value = s.price; $("#svcDuration").value = s.duration; $("#svcImg").value = s.img;
    $("#svcEnabled").checked = s.enabled !== false;
    $("#serviceFormTitle").textContent = "Edit Service";
    $("#serviceFormModal").classList.add("open");
  }
  if (delBtn) {
    const i = Number(delBtn.dataset.deleteService);
    services.splice(i, 1);
    DB.set("ma_services", services);
    showToast("Service deleted.", "warning");
    renderServices();
  }
});

$("#serviceForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const services = DB.get("ma_services");
  const editId = $("#svcEditId").value;
  const data = {
    id: (editId !== "" ? services[editId].id : $("#svcName").value.toLowerCase().replace(/\s+/g,"-")),
    name: $("#svcName").value.trim(), desc: $("#svcDesc").value.trim(), price: $("#svcPrice").value.trim(),
    duration: $("#svcDuration").value.trim(), img: $("#svcImg").value.trim(),
    includes: editId !== "" ? services[editId].includes : ["Consultation", "Application", "Touch-up"],
    enabled: $("#svcEnabled").checked
  };
  if (editId !== "") services[editId] = data; else services.push(data);
  DB.set("ma_services", services);
  closeAllModals();
  renderServices();
  showToast("Changes saved.", "success");
});

/* ---------- 13. GALLERY MANAGEMENT ---------- */
function renderGallery() {
  const gallery = DB.get("ma_gallery");
  $("#galleryAdminGrid").innerHTML = gallery.map((g, i) => `
    <div class="gallery-admin-item">
      <img src="${g.src}" alt="${g.caption}" loading="lazy">
      <button data-del-gallery="${i}" title="Delete">✕</button>
      <div class="cap">${g.caption}</div>
    </div>`).join("");
}
$("#addGalleryBtn")?.addEventListener("click", () => { $("#galleryForm").reset(); $("#galleryFormModal").classList.add("open"); });

$("#galleryForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const gallery = DB.get("ma_gallery");
  // TODO: Replace image URL input with a real image storage/upload service in production.
  gallery.push({ src: $("#galImg").value.trim(), category: $("#galCategory").value, caption: $("#galCaption").value.trim() });
  DB.set("ma_gallery", gallery);
  closeAllModals();
  renderGallery();
  showToast("Image added to gallery.", "success");
});

$("#galleryAdminGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-del-gallery]");
  if (!btn) return;
  const gallery = DB.get("ma_gallery");
  gallery.splice(Number(btn.dataset.delGallery), 1);
  DB.set("ma_gallery", gallery);
  renderGallery();
  showToast("Image removed.", "warning");
});

/* ---------- 14. SETTINGS ---------- */
function renderSettings() {
  const settings = DB.get("ma_settings", {
    name: "Angel's Treat", phone: "+234 800 000 0000", whatsapp: "2348000000000", email: "hello@angelstreat.com",
    address: "14 Bourdillon Road, Ikoyi, Lagos, Nigeria", hours: "Tue – Sun, 9:00 AM – 7:00 PM",
    instagram: "https://instagram.com/angelstreat", facebook: "https://facebook.com/angelstreat", tiktok: "https://tiktok.com/@angelstreat"
  });
  $("#setName").value = settings.name; $("#setPhone").value = settings.phone; $("#setWhatsapp").value = settings.whatsapp;
  $("#setEmail").value = settings.email; $("#setAddress").value = settings.address; $("#setHours").value = settings.hours;
  $("#setInstagram").value = settings.instagram; $("#setFacebook").value = settings.facebook; $("#setTiktok").value = settings.tiktok;
}
$("#settingsForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  DB.set("ma_settings", {
    name: $("#setName").value, phone: $("#setPhone").value, whatsapp: $("#setWhatsapp").value, email: $("#setEmail").value,
    address: $("#setAddress").value, hours: $("#setHours").value, instagram: $("#setInstagram").value,
    facebook: $("#setFacebook").value, tiktok: $("#setTiktok").value
  });
  showToast("Changes saved.", "success");
});

/* ---------- 15. NOTIFICATIONS ---------- */
function initNotifications() {
  const btn = $("#notifBtn"), dropdown = $("#notifDropdown");
  btn.addEventListener("click", () => { dropdown.classList.toggle("open"); renderNotifications(); });
  document.addEventListener("click", (e) => { if (!dropdown.contains(e.target) && e.target !== btn) dropdown.classList.remove("open"); });
  $("#markAllRead").addEventListener("click", () => {
    const notifs = DB.get("ma_notifications").map(n => ({ ...n, read: true }));
    DB.set("ma_notifications", notifs);
    renderNotifications();
  });
  renderNotifications();
}

function renderNotifications() {
  const notifs = DB.get("ma_notifications").sort((a,b) => new Date(b.time) - new Date(a.time));
  const unread = notifs.filter(n => !n.read).length;
  $("#notifBadge").style.display = unread ? "flex" : "none";
  $("#notifBadge").textContent = unread;
  $("#notifList").innerHTML = notifs.length ? notifs.map(n => `
    <div class="notif-item ${n.read ? "" : "unread"}">
      <div>${n.text}</div>
      <div class="time">${new Date(n.time).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" })}</div>
    </div>`).join("") : `<div class="notif-empty">You're all caught up.</div>`;
}

/* ---------- 16. MODALS ---------- */
function closeAllModals() {
  $$(".a-modal-overlay.open").forEach(m => m.classList.remove("open"));
}
function initModals() {
  $$(".a-modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
    $$("[data-close]", overlay).forEach(btn => btn.addEventListener("click", () => overlay.classList.remove("open")));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAllModals(); });
}

/* ---------- 17. BOOT ---------- */
checkAuth();

// ============================================
// SUPABASE CLIENT
// ============================================
// APP.JS BILKUL SHURU MEIN — SIRF YEH
const SUPABASE_URL = "https://vnszinxwsalcsrdufevx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc3ppbnh3c2FsY3NyZHVmZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDI0MTIsImV4cCI6MjA5MDI3ODQxMn0.ig8qXkQuk_-JQTzd12pWezkfY5O3SpdTczv8MBrCEHY";

// SINGLE INSTANCE — GLOBAL
var _sbClient = null;
function getSB() {
  if (!_sbClient) {
    _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sbClient;
}

// ============================================
// AUTH — SIGNUP
// ============================================
async function signup() {
  const name       = document.getElementById("signup-name").value;
  const email      = document.getElementById("signup-email").value;
  const password   = document.getElementById("signup-password").value;
  const plan       = document.getElementById("plan").value;
  const charityPct = document.getElementById("charity-percent").value;
  const msg        = document.getElementById("auth-message");

  if (!name || !email || !password) {
    msg.innerText = "⚠️ Please fill all fields.";
    return;
  }
  if (password.length < 6) {
    msg.innerText = "⚠️ Password must be at least 6 characters.";
    return;
  }

  const { data, error } = await getSB().auth.signUp({ email, password });

  if (error) {
    msg.innerText = "❌ " + error.message;
    return;
  }

  await getSB().from("profiles").insert([{
    id:                  data.user.id,
    name:                name,
    email:               email,
    plan:                plan,
    charity_percent:     parseInt(charityPct),
    subscription_status: "active",
    renewal_date:        getNextMonth()
  }]);

  msg.innerText = "✅ Account created! Please check your email to verify.";
}

// ============================================
// AUTH — LOGIN
// ============================================
async function login() {
  const email    = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const msg      = document.getElementById("auth-message");

  if (!email || !password) {
    msg.innerText = "⚠️ Please enter email and password.";
    return;
  }

  const { error } = await getSB().auth.signInWithPassword({ email, password });

  if (error) {
    msg.innerText = "❌ " + error.message;
    return;
  }

  window.location.href = "dashboard.html";
}

// ============================================
// AUTH — LOGOUT
// ============================================
async function logout() {
  await getSB().auth.signOut();
  window.location.href = "login.html";
}

// ============================================
// DASHBOARD INIT
// ============================================
async function initDashboard() {
  const { data } = await getSB().auth.getUser();

  if (!data.user) {
    window.location.href = "login.html";
    return;
  }

  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.innerText = data.user.email;

  await loadSubscriptionStatus(data.user.id);
  await loadScores();
  await loadCharities();
  await loadWinnings(data.user.id);
  await loadPrizePool();
}

// ============================================
// SUBSCRIPTION STATUS
// ============================================
async function loadSubscriptionStatus(userId) {
  const { data: profile, error } = await getSB()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle(); // .single() ki jagah .maybeSingle()

  if (!profile) {
    // Profile nahi hai toh default dikhao
    const badge = document.getElementById("sub-status");
    if (badge) {
      badge.innerText = "✅ Active";
      badge.className = "status-badge active";
    }
    return;
  }

  const badge = document.getElementById("sub-status");
  if (badge) {
    badge.innerText = profile.subscription_status === "active" ? "✅ Active" : "❌ Inactive";
    badge.className = profile.subscription_status === "active"
      ? "status-badge active" : "status-badge inactive";
  }

  const planEl = document.getElementById("sub-plan");
  if (planEl) planEl.innerText =
    "Plan: " + (profile.plan === "yearly" ? "Yearly 🌟" : "Monthly");

  const renewEl = document.getElementById("sub-renewal");
  if (renewEl) renewEl.innerText =
    "Renews: " + (profile.renewal_date
      ? new Date(profile.renewal_date).toLocaleDateString() : "—");

  const pctEl = document.getElementById("charity-percent-display");
  if (pctEl && profile.charity_percent)
    pctEl.innerText = profile.charity_percent + "%";
}

// ============================================
// ADD SCORE
// ============================================
async function addScore() {
  const scoreVal   = document.getElementById("score").value;
  const dateVal    = document.getElementById("score-date").value;
  const charityVal = document.getElementById("charity").value;

  if (!scoreVal || !dateVal) {
    alert("Please enter score and date.");
    return;
  }

  const scoreNum = parseInt(scoreVal);
  if (scoreNum < 1 || scoreNum > 45) {
    alert("Score must be between 1 and 45 (Stableford format)");
    return;
  }

  const { data } = await getSB().auth.getUser();
  const user = data.user;

  // Rolling 5-score logic — delete oldest if already 5
  const { data: scores } = await getSB()
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (scores && scores.length >= 5) {
    await getSB().from("scores").delete().eq("id", scores[0].id);
  }

  const { error } = await getSB().from("scores").insert([{
    user_id:    user.id,
    score:      scoreNum,
    charity_id: charityVal || null,
    date:       dateVal
  }]);

  if (error) {
    alert("Error: " + error.message);
    return;
  }

  document.getElementById("score").value      = "";
  document.getElementById("score-date").value = "";
  alert("✅ Score added!");
  loadScores();
}

// ============================================
// LOAD SCORES
// ============================================
async function loadScores() {
  const { data } = await getSB().auth.getUser();
  if (!data.user) return;

  const { data: scores } = await getSB()
    .from("scores")
    .select("*")
    .eq("user_id", data.user.id)
    .order("date", { ascending: false });

  const list = document.getElementById("scores");
  if (!list) return;

  list.innerHTML = "";

  if (!scores || scores.length === 0) {
    list.innerHTML = "<li style='opacity:0.7'>No scores yet — add your first!</li>";
    return;
  }

  scores.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${s.score}</strong> pts
      <span style="opacity:0.7; font-size:12px;">
        — ${new Date(s.date).toLocaleDateString()}
      </span>`;
    list.appendChild(li);
  });
}

// ============================================
// LOAD CHARITIES (dashboard dropdown)
// ============================================
async function loadCharities() {
  const { data: charities } = await getSB().from("charities").select("*");

  const dropdown = document.getElementById("charity");
  if (!dropdown || !charities) return;

  dropdown.innerHTML = '<option value="">-- Select Charity --</option>';

  charities.forEach(c => {
    const opt       = document.createElement("option");
    opt.value       = c.id;
    opt.textContent = c.name;
    dropdown.appendChild(opt);
  });
}

// ============================================
// LOAD CHARITIES (charities page)
// ============================================
async function loadCharityPage() {
  const { data: charities } = await getSB().from("charities").select("*");
  window._allCharities = charities || [];
  renderCharityGrid(charities);
}

function renderCharityGrid(charities) {
  const grid = document.getElementById("charity-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!charities || charities.length === 0) {
    grid.innerHTML = "<p style='opacity:0.7'>No charities found.</p>";
    return;
  }

  charities.forEach(c => {
    const card       = document.createElement("div");
    card.className   = "charity-card";
    card.innerHTML   = `
      <h3>❤️ ${c.name}</h3>
      <p>${c.description || "Supporting a great cause."}</p>
      <small>📅 ${c.event || "Upcoming golf day — TBA"}</small>
    `;
    grid.appendChild(card);
  });
}

function filterCharities() {
  const q        = document.getElementById("charity-search").value.toLowerCase();
  const filtered = (window._allCharities || []).filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.description || "").toLowerCase().includes(q)
  );
  renderCharityGrid(filtered);
}

// ============================================
// SIMULATE DRAW
// ============================================
async function simulateDraw() {
  const { data } = await getSB().auth.getUser();
  if (!data.user) return;

  const { data: scores } = await getSB()
    .from("scores")
    .select("*")
    .eq("user_id", data.user.id);

  if (!scores || scores.length === 0) {
    alert("No scores available for draw.");
    return;
  }

  // Generate 5 random numbers
  const drawNums = [];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * scores.length);
    drawNums.push(scores[idx].score);
  }

  // Show draw balls
  const ballsDiv = document.getElementById("draw-numbers");
  if (ballsDiv) {
    ballsDiv.innerHTML = drawNums
      .map(n => `<span class="draw-ball">${n}</span>`)
      .join("");
  }

  // Check match type
  const userScores = scores.map(s => s.score);
  const matches    = drawNums.filter(n => userScores.includes(n)).length;

  let prize    = "";
  let prizeAmt = 0;

  if (matches >= 5) {
    prize    = "🥇 5-Number Match — JACKPOT! (40% of pool)";
    prizeAmt = 40;
  } else if (matches >= 4) {
    prize    = "🥈 4-Number Match (35% of pool)";
    prizeAmt = 35;
  } else if (matches >= 3) {
    prize    = "🥉 3-Number Match (25% of pool)";
    prizeAmt = 25;
  } else {
    prize = "😔 No match this time. Better luck next month!";
  }

  const winnerDiv = document.getElementById("winner");
  if (winnerDiv) {
    winnerDiv.style.display = "block";
    winnerDiv.innerHTML     = `<strong>Draw Result:</strong><br>${prize}`;
  }

  // Save to winners if won
  if (prizeAmt > 0) {
    await getSB().from("winners").insert([{
      user_id:    data.user.id,
      score:      drawNums[0],
      match_type: matches + "-match",
      pool_share: prizeAmt,
      status:     "pending",
      date:       new Date()
    }]);
  }
}

// ============================================
// LOAD WINNINGS
// ============================================
async function loadWinnings(userId) {
  const { data: winners } = await getSB()
    .from("winners")
    .select("*")
    .eq("user_id", userId);

  const list = document.getElementById("winners-list");
  if (!list) return;

  if (!winners || winners.length === 0) {
    list.innerHTML = "<p style='opacity:0.7'>No winnings yet — keep playing!</p>";
    const totalEl = document.getElementById("total-won");
    if (totalEl) totalEl.innerText = "₹0";
    return;
  }

  list.innerHTML = "";
  winners.forEach(w => {
    const div       = document.createElement("div");
    div.className   = "winner-item";
    div.innerHTML   = `
      <span>${w.match_type || "Win"}</span>
      <span class="badge-${w.status}">${w.status}</span>
    `;
    list.appendChild(div);
  });

  const paidCount = winners.filter(w => w.status === "paid").length;
  const totalEl   = document.getElementById("total-won");
  if (totalEl) totalEl.innerText = "₹" + (paidCount * 500);
}

// ============================================
// PRIZE POOL
// ============================================
async function loadPrizePool() {
  const { count } = await getSB()
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active");

  const poolTotal = (count || 0) * 499 * 0.5;
  const el        = document.getElementById("pool-total");
  if (el) el.innerText = `Estimated Pool: ₹${poolTotal.toLocaleString()}`;
}

// ============================================
// HELPER
// ============================================
function getNextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
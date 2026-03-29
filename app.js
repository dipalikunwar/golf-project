const SUPABASE_URL = "https://vnszinxwsalcsrdufevx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc3ppbnh3c2FsY3NyZHVmZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDI0MTIsImV4cCI6MjA5MDI3ODQxMn0.ig8qXkQuk_-JQTzd12pWezkfY5O3SpdTczv8MBrCEHY";

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= SIGNUP =================
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) alert(error.message);
  else alert("Signup successful! Check your email.");
}

// ================= LOGIN =================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

// ================= ADD SCORE =================
async function addScore() {
  const charityValue = document.getElementById("charity").value;
  const score = document.getElementById("score").value;

  if (!score) {
    alert("Enter score");
    return;
  }

  const scoreNum = parseInt(score);
  if (scoreNum < 1 || scoreNum > 45) {
    alert("Score must be between 1 and 45 (Stableford format)");
    return;
  }

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const charity = charityValue === "" ? null : charityValue;

  let { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (scores.length >= 5) {
    await supabase
      .from("scores")
      .delete()
      .eq("id", scores[0].id);
  }

  const { error } = await supabase.from("scores").insert([
    {
      user_id: user.id,
      score: scoreNum,
      charity_id: charity,
      date: new Date()
    }
  ]);

  if (error) {
    console.log(error);
    alert("Error: " + error.message);
    return;
  }

  alert("Score added!");
  document.getElementById("score").value = "";
  loadScores();
}

// ================= LOAD SCORES =================
async function loadScores() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const list = document.getElementById("scores");
  list.innerHTML = "";

  if (!scores || scores.length === 0) {
    list.innerHTML = "<li>No scores yet</li>";
    return;
  }

  scores.forEach(score => {
    const li = document.createElement("li");
    li.innerText = score.score + " (" + new Date(score.date).toLocaleString() + ")";
    list.appendChild(li);
  });
}

// ================= LOAD CHARITIES =================
async function loadCharities() {
  let { data: charities, error } = await supabase
    .from("charities")
    .select("*");

  if (error) {
    console.log("Charities error:", error);
    return;
  }

  const dropdown = document.getElementById("charity");
  dropdown.innerHTML = '<option value="">-- Select Charity --</option>';

  charities.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    dropdown.appendChild(option);
  });
}

// ================= DRAW WINNER =================
async function drawWinner() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id);

  if (!scores || scores.length === 0) {
    alert("No scores available to draw from");
    return;
  }

  const randomIndex = Math.floor(Math.random() * scores.length);
  const winner = scores[randomIndex];

  if (!winner) {
    alert("Error selecting winner");
    return;
  }

  document.getElementById("winner").innerText =
    "🏆 Winner Score: " + winner.score;

  const { error } = await supabase.from("winners").insert([
    {
      user_id: user.id,
      score: winner.score,
      charity_id: winner.charity_id || null,
      date: new Date()
    }
  ]);

  if (error) {
    console.log(error);
    alert("Winner save failed: " + error.message);
  } else {
    console.log("Winner saved!");
  }
}

// ================= LOGOUT =================
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

// ================= AUTH GUARD =================
async function checkUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = "login.html";
  }
}

checkUser();
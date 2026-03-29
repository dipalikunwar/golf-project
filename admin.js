async function checkAdmin() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) { window.location.href = "login.html"; return; }

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", data.user.id).single();

  if (!profile || profile.role !== "admin") {
    alert("Access denied.");
    window.location.href = "dashboard.html";
  }
}

async function loadOverview() {
  const { count: userCount } = await supabase
    .from("profiles").select("*", { count: "exact", head: true });

  const { count: drawCount } = await supabase
    .from("winners").select("*", { count: "exact", head: true });

  document.getElementById("total-users").innerText  = userCount || 0;
  document.getElementById("total-draws").innerText  = drawCount || 0;
  document.getElementById("total-pool").innerText   =
    "₹" + ((userCount || 0) * 499 * 0.5).toLocaleString();
  document.getElementById("total-charity").innerText =
    "₹" + ((userCount || 0) * 499 * 0.1).toLocaleString();
}

async function loadUsersAdmin() {
  const { data: users } = await supabase.from("profiles").select("*");
  const div = document.getElementById("users-table");
  if (!div || !users) return;

  div.innerHTML = `
    <table class="admin-table">
      <tr>
        <th>Name</th><th>Email</th><th>Plan</th>
        <th>Status</th><th>Actions</th>
      </tr>
      ${users.map(u => `
        <tr>
          <td>${u.name || "—"}</td>
          <td>${u.email}</td>
          <td>${u.plan || "monthly"}</td>
          <td>
            <span class="badge-${u.subscription_status}">
              ${u.subscription_status}
            </span>
          </td>
          <td>
            <button onclick="toggleSubscription('${u.id}','${u.subscription_status}')"
              class="small-btn">
              Toggle
            </button>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

async function toggleSubscription(userId, currentStatus) {
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  await supabase.from("profiles")
    .update({ subscription_status: newStatus }).eq("id", userId);
  loadUsersAdmin();
}

async function runSimulation() {
  const type = document.getElementById("draw-type").value;
  const { data: scores } = await supabase.from("scores").select("*");

  if (!scores || scores.length === 0) {
    document.getElementById("simulation-result").innerHTML =
      "<p>No scores in system yet.</p>";
    return;
  }

  let drawNums = [];
  if (type === "algorithmic") {
    // Weighted by frequency
    const freq = {};
    scores.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    drawNums = sorted.slice(0, 5).map(e => parseInt(e[0]));
    while (drawNums.length < 5) drawNums.push(Math.floor(Math.random() * 45) + 1);
  } else {
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * scores.length);
      drawNums.push(scores[idx].score);
    }
  }

  document.getElementById("simulation-result").innerHTML = `
    <div style="margin-top:15px;">
      <strong>Simulated Draw Numbers:</strong><br>
      ${drawNums.map(n => `<span class="draw-ball">${n}</span>`).join(" ")}
      <br><small style="opacity:0.7">Mode: ${type}</small>
    </div>
  `;
}

async function publishDraw() {
  if (!confirm("Publish this draw? This will be visible to all users.")) return;
  alert("✅ Draw published! (Connect to draws table for full implementation)");
}

async function addCharity() {
  const name = document.getElementById("new-charity-name").value;
  const desc = document.getElementById("new-charity-desc").value;
  if (!name) { alert("Enter charity name"); return; }

  const { error } = await supabase.from("charities").insert([{ name, description: desc }]);
  if (error) { alert("Error: " + error.message); return; }

  alert("✅ Charity added!");
  document.getElementById("new-charity-name").value = "";
  document.getElementById("new-charity-desc").value = "";
  loadAdminCharities();
}

async function loadAdminCharities() {
  const { data: charities } = await supabase.from("charities").select("*");
  const div = document.getElementById("admin-charity-list");
  if (!div) return;

  div.innerHTML = (charities || []).map(c => `
    <div class="charity-admin-item">
      <strong>${c.name}</strong> — ${c.description || ""}
      <button onclick="deleteCharity('${c.id}')" class="small-btn danger">Delete</button>
    </div>
  `).join("");
}

async function deleteCharity(id) {
  if (!confirm("Delete this charity?")) return;
  await supabase.from("charities").delete().eq("id", id);
  loadAdminCharities();
}

async function loadWinnersAdmin() {
  const { data: winners } = await supabase.from("winners").select("*");
  const div = document.getElementById("winners-admin-list");
  if (!div) return;

  div.innerHTML = `
    <table class="admin-table">
      <tr><th>User</th><th>Match</th><th>Status</th><th>Action</th></tr>
      ${(winners || []).map(w => `
        <tr>
          <td>${w.user_id.slice(0,8)}...</td>
          <td>${w.match_type || "—"}</td>
          <td><span class="badge-${w.status}">${w.status}</span></td>
          <td>
            ${w.status === "pending"
              ? `<button onclick="markPaid('${w.id}')" class="small-btn">
                   Mark Paid
                 </button>`
              : "✅"}
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

async function markPaid(winnerId) {
  await supabase.from("winners").update({ status: "paid" }).eq("id", winnerId);
  loadWinnersAdmin();
}
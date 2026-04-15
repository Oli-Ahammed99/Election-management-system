const data = {
  voters: [
    { id: "NID1001", name: "Ayesha Rahman", constituency: "Dhaka-10", stationId: "PS-01", booth: "B-2" },
    { id: "NID1002", name: "Tanvir Ahmed", constituency: "Dhaka-10", stationId: "PS-01", booth: "B-1" },
    { id: "NID2001", name: "Sadia Noor", constituency: "Chattogram-5", stationId: "PS-02", booth: "B-4" },
  ],
  stations: [
    { id: "PS-01", location: "Dhaka Govt School", constituency: "Dhaka-10", booths: ["B-1", "B-2", "B-3"] },
    { id: "PS-02", location: "Chattogram College", constituency: "Chattogram-5", booths: ["B-4", "B-5"] },
  ],
  candidates: [
    { id: "C-1", name: "Reza Karim", party: "Unity Party", constituency: "Dhaka-10" },
    { id: "C-2", name: "Mita Sultana", party: "Progressive Front", constituency: "Dhaka-10" },
    { id: "C-3", name: "Javed Hasan", party: "People's Alliance", constituency: "Chattogram-5" },
    { id: "C-4", name: "Nusrat Chowdhury", party: "National Reform", constituency: "Chattogram-5" },
  ],
  stationResults: [],
  aggregated: {},
  published: false,
};

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function switchTab(target) {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === target));
  panels.forEach((p) => p.classList.toggle("active", p.id === target));
}

tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.target)));

function initSelects() {
  const stationSelect = document.getElementById("stationSelect");
  const constituencySelect = document.getElementById("constituencySelect");

  data.stations.forEach((s) => {
    stationSelect.add(new Option(`${s.id} — ${s.location}`, s.id));
  });

  [...new Set(data.stations.map((s) => s.constituency))].forEach((c) => {
    constituencySelect.add(new Option(c, c));
  });

  renderCandidateInputs(stationSelect.value);
}

function renderCandidateInputs(stationId) {
  const station = data.stations.find((s) => s.id === stationId);
  const wrap = document.getElementById("candidate-inputs");
  wrap.innerHTML = "";

  const candidates = data.candidates.filter((c) => c.constituency === station.constituency);
  candidates.forEach((candidate) => {
    const group = document.createElement("div");
    group.innerHTML = `
      <label for="vote-${candidate.id}">${candidate.name} (${candidate.party})</label>
      <input id="vote-${candidate.id}" data-candidate="${candidate.id}" type="number" min="0" value="0" required />`;
    wrap.appendChild(group);
  });
}

document.getElementById("stationSelect").addEventListener("change", (e) => {
  renderCandidateInputs(e.target.value);
});

document.getElementById("voter-search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const value = document.getElementById("voterId").value.trim().toUpperCase();
  const voter = data.voters.find((v) => v.id === value);
  const result = document.getElementById("voter-result");

  if (!voter) {
    result.className = "result-card error";
    result.textContent = "No voter record found. Please check Voter ID / NID.";
    return;
  }

  const station = data.stations.find((s) => s.id === voter.stationId);
  result.className = "result-card";
  result.innerHTML = `
    <strong>${voter.name}</strong><br>
    Voter ID: ${voter.id}<br>
    Constituency: ${voter.constituency}<br>
    Polling Station: ${station.id} — ${station.location}<br>
    Assigned Booth: ${voter.booth}`;
});

document.getElementById("record-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const stationId = document.getElementById("stationSelect").value;
  const issuedBallots = Number(document.getElementById("issuedBallots").value || 0);
  const voteInputs = [...document.querySelectorAll("[data-candidate]")];

  const votes = voteInputs.map((input) => ({
    candidateId: input.dataset.candidate,
    count: Number(input.value || 0),
  }));

  const totalVotes = votes.reduce((sum, item) => sum + item.count, 0);
  const msg = document.getElementById("record-message");

  if (totalVotes > issuedBallots) {
    msg.className = "info error";
    msg.textContent = `Validation failed: total votes (${totalVotes}) exceed issued ballots (${issuedBallots}).`;
    return;
  }

  const existing = data.stationResults.find((r) => r.stationId === stationId);
  const payload = { stationId, issuedBallots, votes, status: "submitted" };
  if (existing) {
    Object.assign(existing, payload);
  } else {
    data.stationResults.push(payload);
  }

  msg.className = "info success";
  msg.textContent = "Station result submitted successfully and moved to verification queue.";
  renderVerificationQueue();
});

function renderVerificationQueue() {
  const container = document.getElementById("verification-list");
  container.innerHTML = "";

  if (!data.stationResults.length) {
    container.innerHTML = '<div class="card">No station results submitted yet.</div>';
    return;
  }

  data.stationResults.forEach((result, idx) => {
    const station = data.stations.find((s) => s.id === result.stationId);
    const card = document.createElement("div");
    card.className = "card";
    const breakdown = result.votes
      .map((v) => {
        const candidate = data.candidates.find((c) => c.id === v.candidateId);
        return `<li>${candidate.name}: ${v.count}</li>`;
      })
      .join("");

    card.innerHTML = `
      <strong>${result.stationId} — ${station.location}</strong><br>
      Status: <em>${result.status}</em><br>
      Issued Ballots: ${result.issuedBallots}
      <ul>${breakdown}</ul>
      <button data-action="approve" data-idx="${idx}">Approve</button>
      <button data-action="reject" data-idx="${idx}">Reject</button>`;

    container.appendChild(card);
  });

  container.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      data.stationResults[idx].status = btn.dataset.action === "approve" ? "verified" : "rejected";
      renderVerificationQueue();
    });
  });
}

document.getElementById("aggregate-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const constituency = document.getElementById("constituencySelect").value;
  const stationsInConstituency = data.stations.filter((s) => s.constituency === constituency).map((s) => s.id);

  const verified = data.stationResults.filter(
    (r) => stationsInConstituency.includes(r.stationId) && r.status === "verified"
  );

  const output = document.getElementById("aggregate-output");
  if (!verified.length) {
    output.className = "result-card error";
    output.textContent = "Aggregation incomplete: no verified polling station results found.";
    return;
  }

  const counts = {};
  verified.forEach((r) => {
    r.votes.forEach((v) => {
      counts[v.candidateId] = (counts[v.candidateId] || 0) + v.count;
    });
  });

  const ranked = Object.entries(counts)
    .map(([candidateId, votes]) => ({ candidate: data.candidates.find((c) => c.id === candidateId), votes }))
    .sort((a, b) => b.votes - a.votes);

  data.aggregated[constituency] = ranked;

  output.className = "result-card";
  output.innerHTML = `
    <strong>${constituency} Consolidated Result</strong>
    <ol>${ranked.map((row) => `<li>${row.candidate.name} (${row.candidate.party}): ${row.votes}</li>`).join("")}</ol>
    <div class="success">Leading Candidate: ${ranked[0].candidate.name}</div>`;
});

document.getElementById("publish-btn").addEventListener("click", () => {
  data.published = true;
  renderPublicResults();
});

function renderPublicResults() {
  const wrap = document.getElementById("public-results");
  wrap.innerHTML = "";

  if (!data.published) {
    wrap.innerHTML = '<div class="card">Results are not published yet.</div>';
    return;
  }

  const constituencies = Object.keys(data.aggregated);
  if (!constituencies.length) {
    wrap.innerHTML = '<div class="card">No aggregated constituency result available for publication.</div>';
    return;
  }

  constituencies.forEach((c) => {
    const rows = data.aggregated[c];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${c}</strong>
      <ol>${rows.map((r) => `<li>${r.candidate.name}: ${r.votes}</li>`).join("")}</ol>
      <div class="success">Winner: ${rows[0].candidate.name}</div>`;
    wrap.appendChild(card);
  });
}

function renderAdminKPIs() {
  document.getElementById("kpi-voters").textContent = data.voters.length;
  document.getElementById("kpi-candidates").textContent = data.candidates.length;
  document.getElementById("kpi-stations").textContent = data.stations.length;
  const boothCount = data.stations.reduce((sum, s) => sum + s.booths.length, 0);
  document.getElementById("kpi-booths").textContent = boothCount;
}

initSelects();
renderVerificationQueue();
renderPublicResults();
renderAdminKPIs();

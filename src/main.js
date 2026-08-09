import "./styles.css";
import { LAYERS, MISCONCEPTIONS, ROUTES, SOURCES, STATIONS, TERMS } from "./curriculum.js";
import { createSimulation } from "./scene.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
        <div><h1>Switchyard</h1><p>Build a telecom SaaS, one call at a time</p></div>
      </div>
      <nav class="top-actions" aria-label="Trainer information">
        <button class="button button-quiet" id="tour-button">Start guided tour</button>
        <button class="button button-quiet" id="glossary-button">Glossary</button>
        <button class="button button-quiet" id="accuracy-button">Accuracy & sources</button>
      </nav>
    </header>

    <section class="statusbar" aria-label="Simulation status">
      <div class="status-cell"><span>SCENARIO</span><strong id="scenario-status">Inbound support call</strong></div>
      <div class="status-cell"><span>STATION</span><strong id="station-status">1 / ${STATIONS.length}</strong></div>
      <div class="status-cell"><span>FLOW</span><strong id="flow-status">RUNNING</strong></div>
      <div class="status-legend">${Object.entries(LAYERS).map(([key, layer]) => `<span><i style="--dot:${layer.color}"></i>${layer.short}</span>`).join("")}</div>
    </section>

    <section class="workspace">
      <div class="map-wrap" id="map-wrap">
        <canvas id="scene" aria-label="Interactive low-poly telecom network map"></canvas>
        <div class="map-labels" id="map-labels"></div>
        <div class="map-hint" id="map-hint"><b>Drag</b> to pan · <b>Scroll</b> to zoom · select any building</div>
        <div class="zoom-controls" aria-label="Map zoom controls">
          <button id="zoom-in" aria-label="Zoom in">＋</button>
          <button id="zoom-out" aria-label="Zoom out">−</button>
          <button id="reset-view" aria-label="Reset map view">⌂</button>
        </div>
        <button class="panel-toggle" id="panel-toggle" aria-expanded="true">Hide lesson</button>
      </div>

      <aside class="lesson-panel" id="lesson-panel" aria-live="polite">
        <div class="lesson-scroll">
          <div class="lesson-eyebrow"><span id="lesson-number">STATION 1</span><span id="lesson-layer">PSTN</span></div>
          <h2 id="lesson-name"></h2>
          <p class="lesson-kicker" id="lesson-kicker"></p>
          <div class="lesson-progress"><span id="lesson-progress"></span></div>
          <section class="lesson-terms">
            <div class="section-heading"><h3>Words to know first</h3><button id="lesson-glossary-button">Open full glossary</button></div>
            <div id="lesson-terms"></div>
          </section>
          <p class="lesson-summary" id="lesson-summary"></p>
          <p class="lesson-body" id="lesson-body"></p>

          <section class="build-card">
            <span>YOUR BUILD TASK</span>
            <p id="lesson-build"></p>
          </section>

          <section class="layer-readout">
            <h3>What is moving here?</h3>
            <dl>
              <div><dt><i style="--dot:${LAYERS.signal.color}"></i>Call setup</dt><dd id="lesson-signal"></dd></div>
              <div><dt><i style="--dot:${LAYERS.media.color}"></i>Live audio</dt><dd id="lesson-media"></dd></div>
              <div><dt><i style="--dot:${LAYERS.control.color}"></i>Product state</dt><dd id="lesson-state"></dd></div>
            </dl>
          </section>

          <div class="risk-grid">
            <div><span>WATCH FOR</span><strong id="lesson-failure"></strong></div>
            <div><span>MEASURE</span><strong id="lesson-metric"></strong></div>
          </div>

          <section class="source-list">
            <h3>Primary references</h3>
            <div id="lesson-sources"></div>
          </section>

          <section class="route-list">
            <div class="section-heading"><h3>The whole route</h3><span>select a stop</span></div>
            <div id="route-stations"></div>
          </section>
        </div>
        <div class="lesson-nav">
          <button class="button button-quiet" id="prev-station">← Previous</button>
          <button class="button button-primary" id="next-station">Next station →</button>
        </div>
      </aside>
    </section>

    <section class="control-deck" aria-label="Simulation controls">
      <div class="transport">
        <button class="transport-button" id="pause-button" aria-label="Pause flow">Ⅱ</button>
        <button class="transport-button" id="step-button" aria-label="Advance one step">→|</button>
        <button class="transport-button" id="restart-button" aria-label="Restart flow">↻</button>
      </div>
      <label class="speed-control"><span>SPEED <b id="speed-label">1×</b></span><input id="speed" type="range" min="0.25" max="2.5" step="0.25" value="1" /></label>
      <label class="scenario-control"><span>SCENARIO</span><select id="scenario">${Object.entries(ROUTES).map(([key, route]) => `<option value="${key}">${route.label}</option>`).join("")}</select></label>
      <div class="toggles">
        <label><input type="checkbox" id="follow" /> Follow flow</label>
        <label><input type="checkbox" id="labels" checked /> Labels</label>
      </div>
      <div class="flow-key"><span><i style="--dot:${LAYERS.signal.color}"></i>CALL SETUP</span><span><i style="--dot:${LAYERS.media.color}"></i>LIVE AUDIO</span><span><i style="--dot:${LAYERS.control.color}"></i>APP EVENT</span></div>
    </section>
  </main>

  <dialog id="accuracy-dialog" class="info-dialog">
    <div class="dialog-head"><div><span>REVIEWED KNOWLEDGE BASE</span><h2>Accuracy, scope & sources</h2></div><button class="icon-button" data-close="accuracy-dialog" aria-label="Close">×</button></div>
    <div class="dialog-content">
      <p class="dialog-lead">This trainer models a multi-tenant, inbound US contact-center path. It is an educational simulation—not a carrier, switch, legal review, or production design.</p>
      <div class="accuracy-callout"><strong>Four boundaries stay separate:</strong> carrier/numbering, SIP signaling, media, and SaaS tenant state. Blurring them is the source of many telecom mistakes.</div>
      <h3>Misconceptions the model corrects</h3>
      <div class="myth-list">${MISCONCEPTIONS.map(([myth, fact]) => `<div><span>${myth}</span><p>${fact}</p></div>`).join("")}</div>
      <h3>Primary and official references</h3>
      <div class="all-sources">${SOURCES.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer"><span>${TERMS[source.org] ? `${source.org}: ${TERMS[source.org].expansion}` : source.org}</span>${source.title}<b>↗</b></a>`).join("")}</div>
      <p class="legal-note">Regulatory material is US-oriented and changes over time. Verify current carrier requirements, jurisdiction, customer use case, and specialist advice before launch.</p>
    </div>
  </dialog>

  <dialog id="glossary-dialog" class="info-dialog glossary-dialog">
    <div class="dialog-head"><div><span>PLAIN-LANGUAGE REFERENCE</span><h2>Telecom glossary</h2></div><button class="icon-button" data-close="glossary-dialog" aria-label="Close glossary">×</button></div>
    <div class="dialog-content">
      <p class="dialog-lead">Every shortened term used in the trainer is translated here. Search by acronym, full name, or what it does.</p>
      <label class="glossary-search"><span>Find a term</span><input id="glossary-search" type="search" placeholder="Try “audio”, “SBC”, or “call record”" autocomplete="off" /></label>
      <div class="glossary-list" id="glossary-list"></div>
      <p class="glossary-empty" id="glossary-empty" hidden>No matching term. Try a broader word.</p>
    </div>
  </dialog>

  <dialog id="tour-dialog" class="tour-dialog">
    <div class="tour-icon" aria-hidden="true">☎</div>
    <span class="tour-label">WELCOME TO SWITCHYARD</span>
    <h2>Follow one support call through your future SaaS.</h2>
    <p>The orange token is call setup messaging. Teal is live audio. Purple is product data. Each lesson defines its technical terms before using them.</p>
    <div class="tour-actions"><button class="button button-quiet" data-close="tour-dialog">Explore myself</button><button class="button button-primary" id="begin-tour">Begin at the number yard</button></div>
  </dialog>
`;

const state = {
  selected: STATIONS[0].id,
  route: "inbound",
  paused: false,
  panelOpen: true,
  lastFlowStation: null,
};

const byId = (id) => document.getElementById(id);
const sourceById = new Map(SOURCES.map((source) => [source.id, source]));
const stationById = new Map(STATIONS.map((station) => [station.id, station]));

function termCard(termId, compact = false) {
  const term = TERMS[termId];
  if (!term) return "";
  return `<article class="term-card${compact ? " is-compact" : ""}">
    <div><abbr title="${term.expansion}">${termId}</abbr><strong>${term.expansion}</strong></div>
    <p>${term.plain}</p>
  </article>`;
}

function renderGlossary(query = "") {
  const normalized = query.trim().toLowerCase();
  const matches = Object.entries(TERMS)
    .filter(([termId, term]) => `${termId} ${term.expansion} ${term.plain}`.toLowerCase().includes(normalized))
    .sort(([left], [right]) => {
      const leftNormalized = left.toLowerCase();
      const rightNormalized = right.toLowerCase();
      const leftRank = leftNormalized === normalized ? 2 : leftNormalized.startsWith(normalized) ? 1 : 0;
      const rightRank = rightNormalized === normalized ? 2 : rightNormalized.startsWith(normalized) ? 1 : 0;
      return rightRank - leftRank || left.localeCompare(right, undefined, { sensitivity: "base" });
    });
  byId("glossary-list").innerHTML = matches.map(([termId]) => termCard(termId)).join("");
  byId("glossary-empty").hidden = matches.length > 0;
}

function openGlossary() {
  const dialog = byId("glossary-dialog");
  renderGlossary(byId("glossary-search").value);
  dialog.showModal();
  setTimeout(() => byId("glossary-search").focus(), 0);
}

function stationIndex(id) {
  return STATIONS.findIndex((station) => station.id === id);
}

function renderStation(id, focus = true) {
  const station = stationById.get(id);
  if (!station) return;
  state.selected = id;
  const layer = LAYERS[station.layer];
  byId("lesson-number").textContent = `STATION ${station.number} OF ${STATIONS.length}`;
  byId("lesson-number").style.background = layer.color;
  byId("lesson-layer").textContent = layer.label;
  byId("lesson-name").textContent = station.name;
  byId("lesson-kicker").textContent = station.kicker;
  byId("lesson-progress").style.width = `${(station.number / STATIONS.length) * 100}%`;
  byId("lesson-progress").style.background = layer.color;
  const primaryTerms = station.terms.slice(0, 3);
  const additionalTerms = station.terms.slice(3);
  byId("lesson-terms").innerHTML = primaryTerms.map((termId) => termCard(termId, true)).join("") + (additionalTerms.length
    ? `<details class="more-terms"><summary>${additionalTerms.length} more terms used in this lesson</summary><div>${additionalTerms.map((termId) => termCard(termId, true)).join("")}</div></details>`
    : "");
  byId("lesson-summary").textContent = station.summary;
  byId("lesson-body").textContent = station.lesson;
  byId("lesson-build").textContent = station.build;
  byId("lesson-signal").textContent = station.signal;
  byId("lesson-media").textContent = station.media;
  byId("lesson-state").textContent = station.state;
  byId("lesson-failure").textContent = station.failure;
  byId("lesson-metric").textContent = station.metric;
  byId("station-status").textContent = `${station.number} / ${STATIONS.length}`;
  byId("lesson-sources").innerHTML = station.sources.map((id) => {
    const source = sourceById.get(id);
    const organization = TERMS[source.org];
    const organizationLabel = organization ? `${source.org}: ${organization.expansion}` : source.org;
    return `<a href="${source.url}" target="_blank" rel="noreferrer"><span title="${organizationLabel}">${organizationLabel}</span>${source.title} ↗</a>`;
  }).join("");
  document.querySelectorAll(".route-chip").forEach((chip) => chip.classList.toggle("is-current", chip.dataset.station === id));
  simulation?.selectStation(id, focus);
}

function renderRoute() {
  const route = ROUTES[state.route];
  byId("scenario-status").textContent = route.label;
  byId("route-stations").innerHTML = route.stations.map((id) => {
    const station = stationById.get(id);
    return `<button class="route-chip" data-station="${id}"><span style="--chip:${LAYERS[station.layer].color}">${station.number}</span>${station.name}</button>`;
  }).join("");
  document.querySelectorAll(".route-chip").forEach((button) => button.addEventListener("click", () => renderStation(button.dataset.station)));
  simulation?.setRoute(route.stations);
  renderStation(state.selected, false);
}

let simulation = createSimulation(byId("scene"), byId("map-labels"), {
  onStation: (id) => {
    renderStation(id);
    if (window.innerWidth < 760) setPanel(true);
  },
  onTick: ({ stationId }) => {
    if (stationId && stationId !== state.lastFlowStation) {
      state.lastFlowStation = stationId;
      const station = stationById.get(stationId);
      byId("map-hint").innerHTML = `<b>LIVE FLOW</b> passing ${station.name}`;
    }
  }
});

function setPaused(paused) {
  state.paused = paused;
  simulation.setPaused(paused);
  byId("pause-button").textContent = paused ? "▶" : "Ⅱ";
  byId("pause-button").setAttribute("aria-label", paused ? "Resume flow" : "Pause flow");
  byId("flow-status").textContent = paused ? "PAUSED" : "RUNNING";
  byId("flow-status").classList.toggle("is-paused", paused);
}

function setPanel(open) {
  state.panelOpen = open;
  byId("lesson-panel").classList.toggle("is-hidden", !open);
  byId("panel-toggle").textContent = open ? "Hide lesson" : "Show lesson";
  byId("panel-toggle").setAttribute("aria-expanded", String(open));
}

function moveStation(direction) {
  const index = stationIndex(state.selected);
  const next = (index + direction + STATIONS.length) % STATIONS.length;
  renderStation(STATIONS[next].id);
}

byId("pause-button").addEventListener("click", () => setPaused(!state.paused));
byId("step-button").addEventListener("click", () => { setPaused(true); simulation.step(); });
byId("restart-button").addEventListener("click", () => { simulation.reset(); setPaused(false); });
byId("zoom-in").addEventListener("click", () => simulation.zoomBy(0.18));
byId("zoom-out").addEventListener("click", () => simulation.zoomBy(-0.18));
byId("reset-view").addEventListener("click", () => simulation.reset());
byId("panel-toggle").addEventListener("click", () => setPanel(!state.panelOpen));
byId("prev-station").addEventListener("click", () => moveStation(-1));
byId("next-station").addEventListener("click", () => moveStation(1));
byId("follow").addEventListener("change", (event) => simulation.setFollow(event.target.checked));
byId("labels").addEventListener("change", (event) => simulation.setLabels(event.target.checked));
byId("speed").addEventListener("input", (event) => {
  const speed = Number(event.target.value);
  simulation.setSpeed(speed);
  byId("speed-label").textContent = `${speed}×`;
});
byId("scenario").addEventListener("change", (event) => {
  state.route = event.target.value;
  state.selected = ROUTES[state.route].stations[0];
  simulation.reset();
  renderRoute();
});

document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => byId(button.dataset.close).close()));
byId("accuracy-button").addEventListener("click", () => byId("accuracy-dialog").showModal());
byId("glossary-button").addEventListener("click", openGlossary);
byId("lesson-glossary-button").addEventListener("click", openGlossary);
byId("glossary-search").addEventListener("input", (event) => renderGlossary(event.target.value));
byId("tour-button").addEventListener("click", () => byId("tour-dialog").showModal());
byId("begin-tour").addEventListener("click", () => {
  byId("tour-dialog").close();
  state.route = "inbound";
  byId("scenario").value = "inbound";
  renderRoute();
  renderStation(STATIONS[0].id);
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !event.target.matches("input, select, button")) {
    event.preventDefault();
    setPaused(!state.paused);
  }
  if (event.key === "ArrowRight") moveStation(1);
  if (event.key === "ArrowLeft") moveStation(-1);
});

renderRoute();
renderStation(STATIONS[0].id, false);

if (!sessionStorage.getItem("switchyard-visited")) {
  sessionStorage.setItem("switchyard-visited", "1");
  setTimeout(() => byId("tour-dialog").showModal(), 450);
}

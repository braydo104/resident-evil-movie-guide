import { MOVIES, KIND_LABELS } from "./data.js";

const els = {
  q: document.getElementById("q"),
  list: document.getElementById("list"),
  detail: document.getElementById("detail"),
  count: document.getElementById("count"),
  chips: Array.from(document.querySelectorAll(".chip")),
  spoilerToggle: document.getElementById("toggleSpoilers")
};

const state = {
  kind: "all",
  query: "",
  selectedId: null,
  spoilerMode: false
};

function normalize(text) {
  return (text ?? "").toString().toLowerCase();
}

function matches(movie, query) {
  if (!query) return true;
  const haystack = [
    movie.title,
    movie.year,
    KIND_LABELS[movie.kind] ?? movie.kind,
    movie.continuity,
    movie.director,
    ...(movie.keyCharacters ?? [])
  ]
    .filter(Boolean)
    .join(" | ");

  return normalize(haystack).includes(normalize(query));
}

function filteredMovies() {
  const sorted = [...MOVIES].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
  return sorted.filter((m) => {
    const kindOk = state.kind === "all" ? true : m.kind === state.kind;
    const qOk = matches(m, state.query);
    return kindOk && qOk;
  });
}

function badgeHtml(movie) {
  const kindLabel = KIND_LABELS[movie.kind] ?? movie.kind;
  const kindClass = movie.kind === "live" ? "badge--accent" : movie.kind === "cgie" ? "badge--orange" : "";
  const runtime = movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "—";
  return `
    <div class="badges" aria-label="Badges">
      <span class="badge ${kindClass}">${escapeHtml(kindLabel)}</span>
      <span class="badge">${escapeHtml(movie.continuity ?? "")}</span>
      <span class="badge">${escapeHtml(runtime)}</span>
    </div>
  `;
}

function renderList() {
  const movies = filteredMovies();
  els.count.textContent = `${movies.length} title${movies.length === 1 ? "" : "s"}`;

  if (movies.length === 0) {
    els.list.innerHTML = `
      <div class="detail__empty">
        <div class="detail__emptyTitle">No matches</div>
        <div class="detail__emptyText">Try clearing the search or switching filters.</div>
      </div>
    `;
    state.selectedId = null;
    renderDetail(null);
    return;
  }

  if (!state.selectedId || !movies.some((m) => m.id === state.selectedId)) {
    state.selectedId = movies[0].id;
  }

  els.list.innerHTML = movies
    .map((m) => {
      const selected = m.id === state.selectedId ? "is-selected" : "";
      const cover = m.coverImage
        ? `<div class="thumb" aria-hidden="true"><img src="${escapeAttr(m.coverImage)}" alt="" loading="lazy" /></div>`
        : "";
      return `
        <article class="card ${selected}" role="listitem" tabindex="0" data-id="${escapeAttr(m.id)}" aria-label="${escapeAttr(m.title)}">
          <div class="card__row">
            ${cover}
            <div class="card__content">
              <div class="card__top">
                <div class="card__title">${escapeHtml(m.title)}</div>
                <div class="card__year">${escapeHtml(m.year)}</div>
              </div>
              ${badgeHtml(m)}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  // Click + keyboard selection
  els.list.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => selectById(card.dataset.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectById(card.dataset.id);
      }
    });
  });

  renderDetail(MOVIES.find((m) => m.id === state.selectedId) ?? null);
}

function renderDetail(movie) {
  if (!movie) {
    els.detail.innerHTML = `
      <div class="detail__empty">
        <div class="detail__emptyTitle">Pick a movie</div>
        <div class="detail__emptyText">Select a card to see description, continuity, and key info.</div>
      </div>
    `;
    return;
  }

  const kindLabel = KIND_LABELS[movie.kind] ?? movie.kind;
  const runtime = movie.runtimeMinutes ? `${movie.runtimeMinutes} minutes` : "—";
  const director = movie.director ?? "—";
  const characters = (movie.keyCharacters ?? []).length ? movie.keyCharacters : ["—"];
  const cover = movie.coverImage
    ? `
      <div class="cover">
        <img src="${escapeAttr(movie.coverImage)}" alt="${escapeAttr(movie.title)} cover art" loading="eager" />
      </div>
    `
    : "";

  const antagonists = (movie.antagonists ?? []).length
    ? movie.antagonists
    : [];

  const antagonistBlock = antagonists.length
    ? `
      <div class="sectionTitle">Killers / antagonists</div>
      <ul class="clean">
        ${antagonists
          .map(
            (a) =>
              `<li><strong>${escapeHtml(a.name ?? "Unknown")}</strong>${a.background ? ` — ${escapeHtml(a.background)}` : ""}</li>`
          )
          .join("")}
      </ul>
    `
    : "";

  const spoilerBlock = state.spoilerMode
    ? `
      <div class="sectionTitle">Spoiler notes</div>
      <p class="p">${escapeHtml(movie.spoilerNotes ?? "No spoiler notes for this entry.")}</p>
    `
    : "";

  els.detail.innerHTML = `
    <div class="hero">
      ${cover}
      <div class="hero__text">
        <h2 class="h1">${escapeHtml(movie.title)}</h2>
        <p class="sub">${escapeHtml(movie.year)} • ${escapeHtml(kindLabel)} • ${escapeHtml(movie.continuity ?? "")}</p>
      </div>
    </div>

    <div class="grid" aria-label="Key facts">
      <div class="kv"><div class="kv__k">Runtime</div><div class="kv__v">${escapeHtml(runtime)}</div></div>
      <div class="kv"><div class="kv__k">Director</div><div class="kv__v">${escapeHtml(director)}</div></div>
      <div class="kv"><div class="kv__k">Continuity</div><div class="kv__v">${escapeHtml(movie.continuity ?? "—")}</div></div>
      <div class="kv"><div class="kv__k">Type</div><div class="kv__v">${escapeHtml(kindLabel)}</div></div>
    </div>

    <div class="sectionTitle">Description</div>
    <p class="p">${escapeHtml(movie.description ?? "—")}</p>

    <div class="sectionTitle">Key characters</div>
    <ul class="clean">
      ${characters.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}
    </ul>

    ${antagonistBlock}

    ${spoilerBlock}
  `;
}

function selectById(id) {
  if (!id) return;
  state.selectedId = id;
  renderList();

  // Keep focus on selected card (helpful for keyboard users)
  const selected = els.list.querySelector(`.card[data-id="${cssEscape(id)}"]`);
  selected?.focus?.();
}

function setKind(kind) {
  state.kind = kind;
  els.chips.forEach((c) => c.classList.toggle("is-active", c.dataset.kind === kind));
  renderList();
}

function setQuery(q) {
  state.query = q;
  renderList();
}

function setSpoilerMode(on) {
  state.spoilerMode = Boolean(on);
  els.spoilerToggle.setAttribute("aria-pressed", state.spoilerMode ? "true" : "false");
  els.spoilerToggle.textContent = `Spoiler mode: ${state.spoilerMode ? "On" : "Off"}`;
  renderDetail(MOVIES.find((m) => m.id === state.selectedId) ?? null);
}

// Minimal escaping helpers for safe innerHTML rendering
function escapeHtml(value) {
  return (value ?? "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function cssEscape(value) {
  // basic CSS.escape replacement for ids we control
  return (value ?? "").toString().replaceAll('"', "\\\"");
}

// Wire up events
els.q.addEventListener("input", (e) => setQuery(e.target.value));

els.chips.forEach((chip) => {
  chip.addEventListener("click", () => setKind(chip.dataset.kind));
});

els.spoilerToggle.addEventListener("click", () => setSpoilerMode(!state.spoilerMode));

// Initial render
setSpoilerMode(false);
renderList();

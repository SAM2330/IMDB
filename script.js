const TMDB_KEY = "4f232ac1c3f1cf94a52c682491f7fa6e";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

const STREAMING_SERVERS = {
  vidsrc: {
    label: "VidSrc",
    movie: id => `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&autoplay=1`,
    tv: (id, s, e) => `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1`
  },
  vixsrc: {
    label: "VixSrc",
    movie: id => `https://vixsrc.to/movie/${id}`,
    tv: (id, s, e) => `https://vixsrc.to/tv/${id}/${s}/${e}`
  },
  vidlink: {
    label: "VidLink",
    movie: id => `https://vidlink.pro/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoPlay=true`
  },
  vidfast: {
    label: "VidFast",
    movie: id => `https://vidfast.pro/movie/${id}?autoPlay=true`,
    tv: (id, s, e) => `https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true`
  },
  vidsrcpm: {
    label: "VidSrc.pm",
    movie: id => `https://vidsrc.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
  },
  twembed: {
    label: "2Embed",
    movie: id => `https://www.2embed.skin/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}`
  },
  autoembed: {
    label: "AutoEmbed",
    movie: id => `https://autoembed.co/movie/tmdb/${id}`,
    tv: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`
  },
  moviesapi: {
    label: "MoviesAPI",
    movie: id => `https://moviesapi.to/movie/${id}`,
    tv: (id, s, e) => `https://moviesapi.to/tv/${id}-${s}-${e}`
  },
  vidrock: {
    label: "VidRock",
    movie: id => `https://vidrock.net/movie/${id}?autoplay=true`,
    tv: (id, s, e) => `https://vidrock.net/tv/${id}/${s}/${e}?autoplay=true`
  },
  videasy: {
    label: "Videasy",
    movie: id => `https://player.videasy.net/movie/${id}?overlay=true`,
    tv: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}?overlay=true`
  },
  godrive: {
    label: "GoDrive",
    movie: id => `https://godriveplayer.com/player.php?type=movie&tmdb=${id}`,
    tv: (id, s, e) => `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${s}&episode=${e}`
  },
  smashystream: {
    label: "SmashyStream",
    movie: id => `https://player.smashystream.com/playere.php?tmdb=${id}`,
    tv: (id, s, e) => `https://player.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  }
};

let watchState = {
  id: null,
  type: "movie",
  item: null,
  server: "vidsrc",
  season: 1,
  episode: 1,
  episodes: [],
  seasons: []
};

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getMediaType(item) {
  return item.media_type || (item.title ? "movie" : "tv");
}

function getTitle(item) {
  return item.title || item.name || "Unknown";
}

function buildEmbedUrl(server, type, id, season, episode) {
  const srv = STREAMING_SERVERS[server] || STREAMING_SERVERS.vidsrc;
  return type === "movie"
    ? srv.movie(id)
    : srv.tv(id, season, episode);
}

function createMovieCard(item) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const poster = item.poster_path
    ? `${IMG_BASE}${item.poster_path}`
    : "https://via.placeholder.com/300x450?text=No+Image";

  card.innerHTML = `
    <img src="${poster}" alt="${getTitle(item)}">
    <h3>${getTitle(item)}</h3>
  `;

  card.onclick = () => {
    const type = getMediaType(item);
    window.location.href = `movie.html?id=${item.id}&type=${type}`;
  };

  return card;
}

function setupHeaderScroll() {
  const header = document.querySelector("header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });
}

setupHeaderScroll();

// ===== HOME: HERO BANNER =====
async function loadHeroBanner() {
  const heroBg = document.getElementById("heroBg");
  const heroTitle = document.getElementById("heroTitle");
  const heroOverview = document.getElementById("heroOverview");
  const heroPlayBtn = document.getElementById("heroPlayBtn");
  const heroInfoBtn = document.getElementById("heroInfoBtn");
  if (!heroBg) return;

  const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}`);
  const data = await res.json();
  const featured = data.results.find(r => r.backdrop_path) || data.results[0];
  if (!featured) return;

  const type = getMediaType(featured);
  const backdrop = featured.backdrop_path
    ? `${BACKDROP_BASE}${featured.backdrop_path}`
    : "";

  heroBg.style.backgroundImage = `url(${backdrop})`;
  heroTitle.textContent = getTitle(featured);
  heroOverview.textContent = featured.overview || "";

  heroPlayBtn.onclick = () => {
    window.location.href = `watch.html?id=${featured.id}&type=${type}`;
  };

  heroInfoBtn.onclick = () => {
    window.location.href = `movie.html?id=${featured.id}&type=${type}`;
  };
}

loadHeroBanner();

// ===== HOME: TOP 10 =====
async function loadTop10() {
  const top3Container = document.getElementById("top3");
  const restContainer = document.getElementById("top10rest");
  if (!top3Container || !restContainer) return;

  const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}`);
  const data = await res.json();
  const top10 = data.results.slice(0, 10);

  top10.forEach((item, index) => {
    if (index < 3) {
      const card = document.createElement("div");
      card.className = "top3-card";
      const poster = item.poster_path
        ? `${IMG_BASE}${item.poster_path}`
        : "https://via.placeholder.com/300x450";

      card.innerHTML = `
        <img src="${poster}" alt="${getTitle(item)}">
        <div class="top3-info">
          <h3>#${index + 1} ${getTitle(item)}</h3>
          <p>${item.overview || ""}</p>
        </div>
      `;

      card.onclick = () => {
        window.location.href = `movie.html?id=${item.id}&type=${getMediaType(item)}`;
      };

      top3Container.appendChild(card);
    } else {
      const card = createMovieCard(item);
      const rank = document.createElement("div");
      rank.className = "rank-badge";
      rank.textContent = index + 1;
      card.appendChild(rank);
      restContainer.appendChild(card);
    }
  });
}

loadTop10();

async function loadTopPicks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const res = await fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&sort_by=popularity.desc`);
  const data = await res.json();
  data.results.slice(0, 30).forEach(item => container.appendChild(createMovieCard(item)));
}

loadTopPicks("topPicks");

// ===== SEARCH =====
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.onsubmit = e => {
    e.preventDefault();
    const q = document.getElementById("searchInput").value.trim();
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  };
}

async function loadSearchResults() {
  const query = getParam("q");
  const container = document.getElementById("searchResults");
  if (!query || !container) return;

  const res = await fetch(
    `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  container.innerHTML = "";

  data.results.forEach(item => {
    if (item.media_type !== "person") {
      container.appendChild(createMovieCard(item));
    }
  });
}

loadSearchResults();

// ===== MOVIE DETAILS =====
async function loadMovieDetails() {
  const id = getParam("id");
  const type = getParam("type") || "movie";
  if (!id || !document.getElementById("movieTitle")) return;

  const res = await fetch(
    `${TMDB_BASE}/${type}/${id}?api_key=${TMDB_KEY}&append_to_response=videos,credits`
  );
  if (!res.ok) return;

  const item = await res.json();

  const backdrop = document.getElementById("detailBackdrop");
  if (backdrop && item.backdrop_path) {
    backdrop.style.backgroundImage = `url(${BACKDROP_BASE}${item.backdrop_path})`;
  }

  document.getElementById("moviePoster").src = item.poster_path
    ? `${IMG_BASE}${item.poster_path}`
    : "https://via.placeholder.com/300x450";

  document.getElementById("movieTitle").textContent = getTitle(item);

  document.getElementById("movieYear").textContent =
    item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "N/A";

  document.getElementById("movieRating").textContent = item.vote_average?.toFixed(1) ?? "N/A";

  const runtimeEl = document.getElementById("movieRuntime");
  if (runtimeEl) {
    if (type === "movie" && item.runtime) {
      runtimeEl.textContent = `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`;
    } else if (type === "tv") {
      runtimeEl.textContent = `${item.number_of_seasons} Season${item.number_of_seasons !== 1 ? "s" : ""}`;
    }
  }

  const genresEl = document.getElementById("movieGenres");
  if (genresEl && item.genres) {
    genresEl.innerHTML = item.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join("");
  }

  const cast = item.credits?.cast?.slice(0, 5).map(c => c.name).join(", ");
  document.getElementById("movieActors").textContent = cast || "Not available";

  document.getElementById("moviePlot").textContent = item.overview || "No description available.";

  document.getElementById("addWatchlistBtn").onclick = () => addToWatchlist(item, type);

  const watchBtn = document.getElementById("watchNowBtn");
  if (watchBtn) {
    watchBtn.textContent = type === "tv" ? "▶ Watch Series" : "▶ Watch Now";
    watchBtn.onclick = () => {
      window.location.href = `watch.html?id=${id}&type=${type}`;
    };
  }

  setupTrailer(item);
}

loadMovieDetails();

// ===== WATCH PAGE =====
async function loadWatchPage() {
  const watchTitle = document.getElementById("watchTitle");
  if (!watchTitle) return;

  const id = getParam("id");
  const type = getParam("type") || "movie";
  if (!id) return;

  watchState.id = id;
  watchState.type = type;
  watchState.server = getParam("server") || "vidsrc";
  watchState.season = parseInt(getParam("season")) || 1;
  watchState.episode = parseInt(getParam("episode")) || 1;

  const res = await fetch(
    `${TMDB_BASE}/${type}/${id}?api_key=${TMDB_KEY}&append_to_response=videos`
  );
  if (!res.ok) return;

  const item = await res.json();
  watchState.item = item;

  document.getElementById("watchPoster").src = item.poster_path
    ? `${IMG_BASE}${item.poster_path}`
    : "https://via.placeholder.com/300x450";

  document.getElementById("watchTitle").textContent = getTitle(item);

  const year = item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "";
  const meta = type === "tv"
    ? `${year} · ${item.number_of_seasons} Seasons · ★ ${item.vote_average?.toFixed(1)}`
    : `${year} · ${item.runtime ? item.runtime + " min" : ""} · ★ ${item.vote_average?.toFixed(1)}`;
  document.getElementById("watchMeta").textContent = meta;

  initServerSelect("serverSelect", () => {
    if (document.getElementById("playerPopup").classList.contains("active")) {
      loadPlayer();
    }
  });
  initServerSelect("popupServerSelect", () => loadPlayer());
  syncServerDropdowns(watchState.server);

  if (type === "tv") {
    document.getElementById("tvSection").style.display = "block";
    document.getElementById("movieSection").style.display = "none";
    await loadSeasons(id);
    await loadEpisodes(id, watchState.season);

    if (getParam("episode")) {
      openPlayer();
    }
  } else {
    document.getElementById("tvSection").style.display = "none";
    document.getElementById("movieSection").style.display = "block";

    document.getElementById("playMovieBtn").onclick = openPlayer;

    if (getParam("play")) {
      openPlayer();
    }
  }

  setupPlayerPopup();
}

async function loadSeasons(tvId) {
  const res = await fetch(`${TMDB_BASE}/tv/${tvId}?api_key=${TMDB_KEY}`);
  const show = await res.json();
  watchState.seasons = show.seasons.filter(s => s.season_number > 0);

  const container = document.getElementById("seasonTabs");
  container.innerHTML = "";

  watchState.seasons.forEach(s => {
    const tab = document.createElement("button");
    tab.className = `season-tab${s.season_number === watchState.season ? " active" : ""}`;
    tab.textContent = s.name || `Season ${s.season_number}`;
    tab.onclick = async () => {
      watchState.season = s.season_number;
      watchState.episode = 1;
      document.querySelectorAll(".season-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      await loadEpisodes(tvId, s.season_number);
    };
    container.appendChild(tab);
  });
}

async function loadEpisodes(tvId, season) {
  const res = await fetch(`${TMDB_BASE}/tv/${tvId}/season/${season}?api_key=${TMDB_KEY}`);
  const data = await res.json();
  watchState.episodes = data.episodes || [];

  const container = document.getElementById("episodeGrid");
  container.innerHTML = "";

  watchState.episodes.forEach(ep => {
    const card = document.createElement("div");
    card.className = `episode-card${ep.episode_number === watchState.episode ? " active" : ""}`;
    card.innerHTML = `
      <div class="episode-number">${ep.episode_number}</div>
      <div class="episode-info">
        <h4>${ep.name || `Episode ${ep.episode_number}`}</h4>
        <p>${ep.overview || "No description."}</p>
        ${ep.runtime ? `<div class="episode-runtime">${ep.runtime} min</div>` : ""}
      </div>
    `;

    card.onclick = () => {
      watchState.episode = ep.episode_number;
      document.querySelectorAll(".episode-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      openPlayer();
    };

    container.appendChild(card);
  });
}

function initServerSelect(selectId, onSelect) {
  const select = document.getElementById(selectId);
  if (!select || select.dataset.initialized) return;

  Object.entries(STREAMING_SERVERS).forEach(([key, srv]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = srv.label;
    select.appendChild(opt);
  });

  select.onchange = () => {
    watchState.server = select.value;
    syncServerDropdowns(select.value);
    onSelect(select.value);
  };

  select.dataset.initialized = "true";
}

function syncServerDropdowns(server) {
  document.querySelectorAll(".server-select").forEach(el => {
    if (el.value !== server) el.value = server;
  });
}

function openPlayer() {
  const popup = document.getElementById("playerPopup");
  popup.classList.add("active");
  document.body.style.overflow = "hidden";

  const title = getTitle(watchState.item);
  document.getElementById("popupTitle").textContent = title;

  if (watchState.type === "tv") {
    const ep = watchState.episodes.find(e => e.episode_number === watchState.episode);
    document.getElementById("popupMeta").textContent =
      `Season ${watchState.season} · Episode ${watchState.episode}${ep?.name ? " — " + ep.name : ""}`;
    document.getElementById("prevEpisodeBtn").style.display = "inline-block";
    document.getElementById("nextEpisodeBtn").style.display = "inline-block";
    updateEpisodeNav();
  } else {
    document.getElementById("popupMeta").textContent = "Movie";
    document.getElementById("prevEpisodeBtn").style.display = "none";
    document.getElementById("nextEpisodeBtn").style.display = "none";
  }

  syncServerDropdowns(watchState.server);
  loadPlayer();
}

function loadPlayer() {
  const iframe = document.getElementById("playerIframe");
  iframe.src = buildEmbedUrl(
    watchState.server,
    watchState.type,
    watchState.id,
    watchState.season,
    watchState.episode
  );
}

function closePlayer() {
  const popup = document.getElementById("playerPopup");
  popup.classList.remove("active");
  document.body.style.overflow = "";
  document.getElementById("playerIframe").src = "";
}

function updateEpisodeNav() {
  const prevBtn = document.getElementById("prevEpisodeBtn");
  const nextBtn = document.getElementById("nextEpisodeBtn");
  const currentIdx = watchState.episodes.findIndex(e => e.episode_number === watchState.episode);

  prevBtn.disabled = currentIdx <= 0;
  nextBtn.disabled = currentIdx >= watchState.episodes.length - 1;
}

function setupPlayerPopup() {
  document.getElementById("closePlayerBtn").onclick = closePlayer;

  document.getElementById("prevEpisodeBtn").onclick = () => {
    const idx = watchState.episodes.findIndex(e => e.episode_number === watchState.episode);
    if (idx > 0) {
      watchState.episode = watchState.episodes[idx - 1].episode_number;
      document.querySelectorAll(".episode-card").forEach(c => c.classList.remove("active"));
      document.querySelectorAll(".episode-card")[idx - 1]?.classList.add("active");
      openPlayer();
    }
  };

  document.getElementById("nextEpisodeBtn").onclick = () => {
    const idx = watchState.episodes.findIndex(e => e.episode_number === watchState.episode);
    if (idx < watchState.episodes.length - 1) {
      watchState.episode = watchState.episodes[idx + 1].episode_number;
      document.querySelectorAll(".episode-card").forEach(c => c.classList.remove("active"));
      document.querySelectorAll(".episode-card")[idx + 1]?.classList.add("active");
      openPlayer();
    }
  };

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePlayer();
  });
}

loadWatchPage();

// ===== TRAILER =====
function setupTrailer(item) {
  if (!item.videos?.results) return;

  const trailer = item.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");
  if (!trailer) return;

  const trailerBtn = document.getElementById("watchTrailerBtn");
  const trailerSection = document.getElementById("trailerSection");
  const iframe = document.getElementById("trailerIframe");
  if (!trailerBtn || !trailerSection || !iframe) return;

  trailerBtn.onclick = () => {
    trailerSection.style.display = "block";
    iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
    trailerSection.scrollIntoView({ behavior: "smooth" });
  };
}

// ===== WATCHLIST =====
function addToWatchlist(movie, type = "movie") {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (list.some(item => item.id === movie.id)) {
    alert("Already in your list!");
    return;
  }
  list.push({ ...movie, media_type: type });
  localStorage.setItem("watchlist", JSON.stringify(list));
  alert("Added to My List!");
}

function loadWatchlist() {
  const container = document.getElementById("watchlistContainer");
  if (!container) return;

  container.innerHTML = "";
  const list = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (list.length === 0) {
    container.innerHTML = `<p style="padding:20px;color:#b3b3b3;">Your list is empty. Browse and add movies & shows!</p>`;
    return;
  }

  list.forEach((movie, index) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const poster = movie.poster_path
      ? `${IMG_BASE}${movie.poster_path}`
      : "https://via.placeholder.com/300x450";

    card.innerHTML = `
      <img src="${poster}" alt="${getTitle(movie)}">
      <h3>${getTitle(movie)}</h3>
      <button class="remove-btn">Remove</button>
    `;

    const navigate = () => {
      window.location.href = `movie.html?id=${movie.id}&type=${movie.media_type}`;
    };

    card.querySelector("img").onclick = navigate;
    card.querySelector("h3").onclick = navigate;
    card.querySelector(".remove-btn").onclick = e => {
      e.stopPropagation();
      removeFromWatchlist(index);
    };

    container.appendChild(card);
  });
}

function removeFromWatchlist(index) {
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  list.splice(index, 1);
  localStorage.setItem("watchlist", JSON.stringify(list));
  loadWatchlist();
}

loadWatchlist();

// ===== CAROUSELS =====
function autoScroll(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  setInterval(() => {
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  }, 6000);
}

async function loadFanFavorites(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}`);
  const data = await res.json();

  data.results
    .filter(item => item.vote_count > 500)
    .slice(0, 20)
    .forEach(item => container.appendChild(createMovieCard(item)));
}

loadFanFavorites("fanFavorites");

async function loadMoviesByGenre(genreId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const res = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
  );
  const data = await res.json();
  data.results.slice(0, 20).forEach(movie => {
    movie.media_type = "movie";
    container.appendChild(createMovieCard(movie));
  });
}

async function loadTVByGenre(genreId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const res = await fetch(
    `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
  );
  const data = await res.json();
  data.results.slice(0, 20).forEach(show => {
    show.media_type = "tv";
    container.appendChild(createMovieCard(show));
  });
}

loadMoviesByGenre(28, "actionMovies");
loadMoviesByGenre(35, "comedyMovies");
loadMoviesByGenre(27, "horrorMovies");
loadMoviesByGenre(53, "thrillerMovies");
loadMoviesByGenre(878, "scifiMovies");
loadTVByGenre(18, "dramaTV");
loadTVByGenre(80, "crimeTV");
loadTVByGenre(10765, "scifiTV");
loadTVByGenre(9648, "mysteryTV");

["topPicks", "fanFavorites", "actionMovies", "dramaTV", "comedyMovies",
 "thrillerMovies", "scifiTV", "crimeTV", "mysteryTV", "classics"].forEach(autoScroll);

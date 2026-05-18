document.getElementById("year").textContent = new Date().getFullYear();

// Configure sua chave da YouTube Data API v3 para habilitar deteccao "AO VIVO".
const YOUTUBE_API_KEY = "";

async function updateLiveBadges() {
  if (!YOUTUBE_API_KEY) return;

  const liveItems = Array.from(document.querySelectorAll(".live-item[data-video-id]"));
  if (!liveItems.length) return;

  const ids = liveItems.map((item) => item.getAttribute("data-video-id")).join(",");
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${ids}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return;

    const data = await response.json();
    const statusById = new Map();

    for (const item of data.items || []) {
      const details = item.liveStreamingDetails || {};
      const isLive = Boolean(details.actualStartTime) && !details.actualEndTime;
      statusById.set(item.id, isLive);
    }

    for (const card of liveItems) {
      const id = card.getAttribute("data-video-id");
      const badge = card.querySelector(".live-badge");
      if (!badge) continue;
      badge.hidden = !statusById.get(id);
    }
  } catch (_) {
    // Silencioso para nao impactar renderizacao da pagina.
  }
}

updateLiveBadges();

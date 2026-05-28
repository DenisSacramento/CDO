const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll("[data-copy-pix]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy-pix");
    if (!value) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }

      const originalText = button.textContent;
      button.textContent = "Pix copiado";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1800);
    } catch (_) {
      button.textContent = "Copie a chave Pix";
    }
  });
});

// Configure sua chave da YouTube Data API v3 para habilitar detecção "AO VIVO".
const YOUTUBE_API_KEY = "";

function runWhenIdle(callback) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 2500 });
    return;
  }

  window.setTimeout(callback, 900);
}

function setupRandomMosaic() {
  const mosaic = document.getElementById("randomMosaicBg");
  const band = mosaic?.closest(".mosaic-band");
  if (!mosaic || !band) return;

  const imagePool = [
    "assets/media-mosaic-01.jpg",
    "assets/media-mosaic-02.jpg",
    "assets/media-mosaic-03.jpg",
    "assets/media-mosaic-04.jpg",
    "assets/media-mosaic-05.jpg",
    "assets/media-mosaic-06.jpg",
    "assets/media-mosaic-07.jpg",
    "assets/media-mosaic-08.jpg",
    "assets/media-mosaic-09.jpg",
    "assets/media-mosaic-10.jpg",
    "assets/media-mosaic-11.jpg",
    "assets/media-mosaic-12.jpg",
    "assets/media-mosaic-13.jpg",
    "assets/media-mosaic-14.jpg",
    "assets/media-mosaic-15.jpg",
    "assets/media-mosaic-16.jpg",
    "assets/media-mosaic-17.jpg",
    "assets/media-mosaic-18.jpg",
    "assets/media-mosaic-19.jpg",
    "assets/media-mosaic-20.jpg",
    "assets/instagram-pentecost-day-2026.png",
    "assets/instagram-profetizando-2026.png",
    "assets/instagram-ceia-2026.png",
    "assets/cdo-frente-opt.jpg",
    "assets/banner-enhanced-opt.jpg",
    "assets/yt_banner.jpg",
    "assets/contact-bg-nosso-maior.png",
    "assets/contact-bg-chamado.png",
    "assets/contact-bg-amor.png"
  ];

  function getColumnCount() {
    const width = window.innerWidth;
    if (width <= 520) return 4;
    if (width <= 900) return 6;
    if (width <= 1240) return 8;
    return 10;
  }

  function getRandomSource() {
    const index = Math.floor(Math.random() * imagePool.length);
    return imagePool[index];
  }

  function buildMosaic() {
    const columns = getColumnCount();
    const tileSize = Math.max(86, Math.floor(window.innerWidth / columns));
    const rows = Math.ceil((band.offsetHeight + tileSize) / tileSize) + 2;
    const totalTiles = rows * columns;
    const picks = new Array(totalTiles);
    const fragment = document.createDocumentFragment();

    mosaic.style.setProperty("--mosaic-cols", String(columns));

    for (let i = 0; i < totalTiles; i += 1) {
      let choice = getRandomSource();
      let guard = 0;

      while (
        guard < 48
        && (
          (i % columns !== 0 && picks[i - 1] === choice)
          || (i >= columns && picks[i - columns] === choice)
        )
      ) {
        choice = getRandomSource();
        guard += 1;
      }

      picks[i] = choice;

      const image = document.createElement("img");
      image.src = choice;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      fragment.appendChild(image);
    }

    mosaic.replaceChildren(fragment);
  }

  let frame = 0;
  const scheduleBuild = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      buildMosaic();
    });
  };

  runWhenIdle(scheduleBuild);
  window.addEventListener("resize", scheduleBuild, { passive: true });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleBuild);
    observer.observe(band);
  }
}

async function updateLiveBadges() {
  if (!YOUTUBE_API_KEY) return;

  const liveItems = Array.from(document.querySelectorAll(".live-item[data-video-id]"));
  if (!liveItems.length) return;

  const ids = liveItems.map((item) => item.dataset.videoId).filter(Boolean).join(",");
  if (!ids) return;

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
      const badge = card.querySelector(".live-badge");
      if (badge) badge.hidden = !statusById.get(card.dataset.videoId);
    }
  } catch (_) {
    // Falhas da API não devem bloquear a experiência principal.
  }
}

function setupMinistryCarousel() {
  const track = document.getElementById("ministryCarousel");
  if (!track) return;

  const modal = document.getElementById("ministryModal");
  const modalClose = document.getElementById("ministryModalClose");
  const modalBackdrop = document.getElementById("ministryModalBackdrop");
  const modalKicker = document.getElementById("ministryModalKicker");
  const modalTitle = document.getElementById("ministryModalTitle");
  const modalText = document.getElementById("ministryModalText");
  const modalMeta = document.getElementById("ministryModalMeta");
  const cards = Array.from(track.querySelectorAll(".ministry-card"));

  if (!cards.length) return;

  const detailsByKey = {
    cultos: {
      kicker: "Agenda de Cultos",
      title: "Cultos",
      text: "Nossos cultos acontecem com louvor, palavra e comunhão. Esta é uma área de exemplo para você substituir com as informações oficiais da igreja.",
      meta: "Quinta-feira: 20h | Domingo: 09h e 18h"
    },
    homens: {
      kicker: "Ministério",
      title: "Rede de Homens",
      text: "Encontros mensais para crescimento espiritual, discipulado e fortalecimento de liderança familiar.",
      meta: "Liderança: Pr. Exemplo | Reunião: 1x por mês"
    },
    mulheres: {
      kicker: "Ministério",
      title: "Rede de Mulheres",
      text: "Tempo de comunhão, apoio e ensino bíblico para desenvolvimento da vida com Deus e da família.",
      meta: "Liderança: Pra. Exemplo | Reunião quinzenal"
    },
    conect: {
      kicker: "Conexão",
      title: "Conect",
      text: "Pequenos grupos em casas para oração, palavra e relacionamento cristão durante a semana.",
      meta: "Inscrições abertas | Vagas por região"
    },
    achados: {
      kicker: "Ministério",
      title: "Achados",
      text: "Espaço para avisos internos, itens encontrados e orientações importantes para os membros.",
      meta: "Atualização semanal após os cultos"
    },
    ted: {
      kicker: "Formação",
      title: "TED Escola Bíblica",
      text: "Trilha de estudos bíblicos com módulos práticos para discipulado, doutrina e serviço no Reino.",
      meta: "Turmas noturnas | Certificado interno"
    },
    kids: {
      kicker: "Infantil",
      title: "Kids",
      text: "Ensino bíblico para crianças com linguagem adequada, atividades educativas e acompanhamento.",
      meta: "Domingos nos horários de culto"
    },
    evangelismo: {
      kicker: "Missão",
      title: "Evangelismo",
      text: "Ação evangelística com abordagens, visitas e apoio em ações sociais para anunciar o evangelho de Cristo.",
      meta: "Saídas quinzenais | Ponto de encontro no templo"
    },
    "cafe-novos": {
      kicker: "Integração",
      title: "Café de Novos Membros",
      text: "Momento de recepção e apresentação da visão da igreja para quem está chegando e deseja se integrar.",
      meta: "Todo primeiro domingo do mês após o culto"
    }
  };

  function getOriginalCard(key) {
    return cards.find((card) => card.dataset.key === key);
  }

  function markActive(key) {
    for (const card of track.querySelectorAll(".ministry-card")) {
      card.classList.toggle("is-active", card.dataset.key === key);
    }
  }

  function openModalByKey(key) {
    if (!modal || !modalTitle || !modalText || !modalMeta || !modalKicker) return;

    const content = detailsByKey[key];
    if (!content) return;

    modalKicker.textContent = content.kicker;
    modalTitle.textContent = content.title;
    modalText.textContent = content.text;
    modalMeta.textContent = content.meta;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalClose?.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function clearHash() {
    closeModal();
    if (window.location.hash) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }

  function activateKey(key, updateHash = true) {
    if (!detailsByKey[key]) return;

    markActive(key);
    if (updateHash && window.location.hash !== `#${key}`) {
      window.location.hash = key;
      return;
    }

    openModalByKey(key);
  }

  const clones = cards.map((card) => {
    const clone = card.cloneNode(true);
    clone.classList.remove("is-active");
    clone.setAttribute("aria-hidden", "true");
    clone.tabIndex = -1;
    return clone;
  });

  track.append(...clones);
  track.classList.add("is-ready");

  track.addEventListener("click", (event) => {
    const card = event.target.closest(".ministry-card");
    if (!card) return;

    activateKey(card.dataset.key);
  });

  const pause = () => track.classList.add("is-paused");
  const resume = () => track.classList.remove("is-paused");

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else resume();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) resume();
      else pause();
    }, { threshold: 0.08 });

    observer.observe(track);
  }

  modalClose?.addEventListener("click", clearHash);
  modalBackdrop?.addEventListener("click", clearHash);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) clearHash();
  });

  window.addEventListener("hashchange", () => {
    const key = window.location.hash.replace("#", "");

    if (!key) {
      closeModal();
      return;
    }

    if (getOriginalCard(key)) activateKey(key, false);
  });

  const initialKey = window.location.hash.replace("#", "");
  if (initialKey && getOriginalCard(initialKey)) activateKey(initialKey, false);
}

runWhenIdle(updateLiveBadges);
setupMinistryCarousel();
setupRandomMosaic();

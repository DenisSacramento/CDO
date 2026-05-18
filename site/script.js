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

  let offsetX = 0;
  const pxPerSecond = 48;
  let rafId = null;
  let lastTs = 0;

  const cardWidth = () => {
    const first = cards[0];
    const gap = 4;
    return first.getBoundingClientRect().width + gap;
  };

  const detailsByKey = {
    cultos: {
      kicker: "Agenda de Cultos",
      title: "Cultos",
      text: "Nossos cultos acontecem com louvor, palavra e comunhao. Esta e uma area de exemplo para voce substituir com as informacoes oficiais da igreja.",
      meta: "Quinta-feira: 20h | Domingo: 09h e 18h"
    },
    homens: {
      kicker: "Ministerio",
      title: "Rede de Homens",
      text: "Encontros mensais para crescimento espiritual, discipulado e fortalecimento de lideranca familiar.",
      meta: "Lideranca: Pr. Exemplo | Reuniao: 1x por mes"
    },
    mulheres: {
      kicker: "Ministerio",
      title: "Rede de Mulheres",
      text: "Tempo de comunhao, apoio e ensino biblico para desenvolvimento da vida com Deus e da familia.",
      meta: "Lideranca: Pra. Exemplo | Reuniao quinzenal"
    },
    conect: {
      kicker: "Conexao",
      title: "Conect",
      text: "Pequenos grupos em casas para oracao, palavra e relacionamento cristao durante a semana.",
      meta: "Inscricoes abertas | Vagas por regiao"
    },
    achados: {
      kicker: "Ministerio",
      title: "Achados",
      text: "Espaco para avisos internos, itens encontrados e orientacoes importantes para os membros.",
      meta: "Atualizacao semanal apos os cultos"
    },
    ted: {
      kicker: "Formacao",
      title: "TED Escola Biblica",
      text: "Trilha de estudos biblicos com modulos praticos para discipulado, doutrina e servico no Reino.",
      meta: "Turmas noturnas | Certificado interno"
    },
    kids: {
      kicker: "Infantil",
      title: "Kids",
      text: "Ensino biblico para criancas com linguagem adequada, atividades educativas e acompanhamento.",
      meta: "Domingos nos horarios de culto"
    },
    evangelismo: {
      kicker: "Missao",
      title: "Evangelismo",
      text: "Acao evangelistica com abordagens, visitas e apoio em acoes sociais para anunciar o evangelho de Cristo.",
      meta: "Saidas quinzenais | Ponto de encontro no templo"
    },
    "cafe-novos": {
      kicker: "Integracao",
      title: "Cafe de Novos Membros",
      text: "Momento de recepcao e apresentacao da visao da igreja para quem esta chegando e deseja se integrar.",
      meta: "Todo primeiro domingo do mes apos o culto"
    }
  };

  function openModalByKey(key) {
    if (!modal || !modalTitle || !modalText || !modalMeta || !modalKicker) return;
    const content = detailsByKey[key];
    if (!content) return;
    modalKicker.textContent = content.kicker;
    modalTitle.textContent = content.title;
    modalText.textContent = content.text;
    modalMeta.textContent = content.meta;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function setHashKey(key) {
    if (!key) return;
    if (window.location.hash === `#${key}`) {
      openModalByKey(key);
      return;
    }
    window.location.hash = key;
  }

  function activateCard(card) {
    cards.forEach((c) => c.classList.remove("is-active"));
    card.classList.add("is-active");
    const key = card.getAttribute("data-key");
    if (key) setHashKey(key);
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => activateCard(card));
  });

  const clones = cards.map((card) => card.cloneNode(true));
  for (const clone of clones) {
    clone.classList.remove("is-active");
    clone.addEventListener("click", () => {
      const key = clone.getAttribute("data-key");
      const original = cards.find((c) => c.getAttribute("data-key") === key);
      if (original) activateCard(original);
    });
    track.appendChild(clone);
  }

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    offsetX += pxPerSecond * dt;
    const resetPoint = cardWidth() * cards.length;
    if (offsetX >= resetPoint) offsetX -= resetPoint;

    track.style.transform = `translateX(-${offsetX}px)`;
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId) return;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  track.addEventListener("mouseenter", stop);
  track.addEventListener("mouseleave", start);
  window.addEventListener("blur", stop);
  window.addEventListener("focus", start);

  if (modalClose) modalClose.addEventListener("click", () => history.back());
  if (modalBackdrop) modalBackdrop.addEventListener("click", () => history.back());
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) history.back();
  });

  window.addEventListener("hashchange", () => {
    const key = window.location.hash.replace("#", "");
    if (!key) {
      closeModal();
      return;
    }
    const related = cards.find((c) => c.getAttribute("data-key") === key);
    if (related) {
      cards.forEach((c) => c.classList.remove("is-active"));
      related.classList.add("is-active");
      openModalByKey(key);
    }
  });

  const initialKey = window.location.hash.replace("#", "");
  if (initialKey) openModalByKey(initialKey);
  start();
}

setupMinistryCarousel();

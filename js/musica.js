/*
  Arquivo: js/musica.js
  Descricao: trilha de suspense em loop. O navegador bloqueia som automatico,
  entao a musica comeca no primeiro clique/toque e lembra a escolha entre as paginas.
*/
const RAIZ_MUSICA = new URL("../", document.currentScript.src);
const musica = new Audio(new URL("audio/suspense.wav", RAIZ_MUSICA).href);
musica.loop = true;
musica.volume = 0.35;

const botaoMusica = document.createElement("button");
botaoMusica.type = "button";
botaoMusica.className = "musica-botao";
document.body.appendChild(botaoMusica);

function guardar(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (erro) {  }
}

function ler(chave) {
  try { return localStorage.getItem(chave); } catch (erro) { return null; }
}

let desejada = ler("pz-musica") !== "desligada";

function atualizarBotao() {
  const tocando = desejada && !musica.paused;
  botaoMusica.textContent = tocando ? "♪ Música: ligada" : "♪ Música: desligada";
  botaoMusica.setAttribute("aria-pressed", String(tocando));
  botaoMusica.classList.toggle("ligada", tocando);
}

function lerPosicao() {
  try {
    const dados = JSON.parse(sessionStorage.getItem("pz-musica-pos"));
    if (dados && typeof dados.t === "number") { return dados; }
  } catch (erro) {  }
  return null;
}

function guardarPosicao() {
  if (musica.readyState < 1 || musica.currentTime === 0) { return; }
  try {
    sessionStorage.setItem("pz-musica-pos", JSON.stringify({
      t: musica.currentTime,
      quando: Date.now(),
      tocando: !musica.paused
    }));
  } catch (erro) {  }
}

function posicionar() {
  return new Promise(function (resolver) {
    const dados = lerPosicao();
    if (!dados) { resolver(); return; }
    function aplicar() {
      let t = dados.t;
      const passou = (Date.now() - dados.quando) / 1000;
      if (dados.tocando && passou >= 0 && passou < 10) { t += passou; }
      if (musica.duration) { t = t % musica.duration; }
      try { musica.currentTime = t; } catch (erro) {  }
      resolver();
    }
    if (musica.readyState >= 1) { aplicar(); }
    else { musica.addEventListener("loadedmetadata", aplicar, { once: true }); musica.load(); }
  });
}

let posicionada = false;

function tocar() {
  const pronto = posicionada ? Promise.resolve() : posicionar().then(function () { posicionada = true; });
  return pronto.then(function () {
    if (!desejada) { atualizarBotao(); return; }
    return musica.play().then(atualizarBotao).catch(function () {
      atualizarBotao();
    });
  });
}

function aoInteragir() {
  if (desejada && musica.paused) { tocar(); }
  if (!musica.paused) {
    ["click", "keydown", "touchstart"].forEach(function (nome) {
      document.removeEventListener(nome, aoInteragir);
    });
  }
}

botaoMusica.addEventListener("click", function (evento) {
  evento.stopPropagation();
  if (musica.paused) {
    desejada = true;
    guardar("pz-musica", "ligada");
    tocar();
  } else {
    desejada = false;
    guardar("pz-musica", "desligada");
    musica.pause();
    atualizarBotao();
  }
});

["click", "keydown", "touchstart"].forEach(function (nome) {
  document.addEventListener(nome, aoInteragir);
});

const playerPagina = document.querySelector("audio");
if (playerPagina) {
  playerPagina.addEventListener("play", function () {
    desejada = false;
    musica.pause();
    atualizarBotao();
  });
}

musica.addEventListener("timeupdate", guardarPosicao);
window.addEventListener("pagehide", guardarPosicao);
window.addEventListener("beforeunload", guardarPosicao);
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") { guardarPosicao(); }
});

atualizarBotao();
if (desejada) { tocar(); }

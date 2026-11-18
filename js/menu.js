/*
  Arquivo: js/menu.js
  Descricao: abre e fecha o menu no smartphone e destaca a pagina atual
*/
const botaoMenu = document.getElementById("menu-botao");
const listaMenu = document.getElementById("menu");

if (!botaoMenu.hasAttribute("data-bs-toggle")) {
  botaoMenu.addEventListener("click", function () {
    const aberto = listaMenu.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });
}

let paginaAtual = location.pathname.split("/").pop() || "index.html";
if (paginaAtual.indexOf("cidade-") === 0) { paginaAtual = "mapa.html"; }
const links = listaMenu.querySelectorAll("a");

for (let i = 0; i < links.length; i++) {
  if (links[i].getAttribute("href").split("/").pop() === paginaAtual) {
    links[i].setAttribute("aria-current", "page");
  }
}

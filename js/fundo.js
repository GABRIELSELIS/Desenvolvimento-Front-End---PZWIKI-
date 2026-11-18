/*
  Arquivo: js/fundo.js
  Descricao: monta o fundo do site com as fotos da galeria rolando como wallpaper
*/
const RAIZ_FUNDO = new URL("../", document.currentScript.src);
const fotosFundo = [
  { arquivo: "img/capturas/horda-gigante.jpg" },
  { arquivo: "img/capturas/sobrevivente-predio.jpg" },
  { arquivo: "img/capturas/horda-carro.jpg" },
  { arquivo: "img/capturas/horda-barricada.jpg" },
  { arquivo: "img/capturas/besta-porta.jpg" },
  { arquivo: "img/capturas/curral-vacas.jpg" },
  { arquivo: "img/capturas/cozinha-dupla.jpg" },
  { arquivo: "img/capturas/reforma-casa.jpg" },
  { arquivo: "img/capturas/bairro-nevado.jpg" }
];

const fundo = document.createElement("div");
fundo.className = "fundo";
fundo.setAttribute("aria-hidden", "true");

const faixa = document.createElement("div");
faixa.className = "fundo-faixa";

for (let copia = 0; copia < 2; copia++) {
  for (let i = 0; i < fotosFundo.length; i++) {
    const imagem = document.createElement("img");
    imagem.src = new URL(fotosFundo[i].arquivo, RAIZ_FUNDO).href;
    imagem.alt = "";
    imagem.decoding = "async";
    faixa.appendChild(imagem);
  }
}

fundo.appendChild(faixa);
document.body.prepend(fundo);

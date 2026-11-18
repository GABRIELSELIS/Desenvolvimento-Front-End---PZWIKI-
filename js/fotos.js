/*
  Arquivo: js/fotos.js
  Descricao: visualizador em tela cheia da galeria e envio de fotos pelos usuarios com conta
*/
const CHAVE_FOTOS = "pzwiki_fotos_usuarios";
const LIMITE_ARQUIVO = 8 * 1024 * 1024;
const LADO_MAXIMO = 1200;

const visualizador = document.getElementById("visualizador");
const imagemGrande = document.getElementById("visualizador-img");
const legendaGrande = document.getElementById("visualizador-legenda");
const posicao = document.getElementById("visualizador-posicao");
const avisoLogin = document.getElementById("aviso-login");
const formFoto = document.getElementById("form-foto");
const mensagem = document.getElementById("mensagem");
const galeriaUsuarios = document.getElementById("galeria-usuarios");
const vazioComunidade = document.getElementById("vazio-comunidade");
const contagemComunidade = document.getElementById("contagem-comunidade");
const usuario = Auth.usuarioAtual();
let indice = 0;

function listaMiniaturas() {
  return document.querySelectorAll(".foto-link");
}

function mostrar(novoIndice) {
  const miniaturas = listaMiniaturas();
  indice = (novoIndice + miniaturas.length) % miniaturas.length;
  const link = miniaturas[indice];
  const miniatura = link.querySelector("img");
  const legenda = link.parentElement.querySelector("figcaption");

  let descricao = "";
  legenda.childNodes.forEach(function (no) {
    if (no.nodeType === Node.TEXT_NODE) { descricao += no.textContent; }
  });

  imagemGrande.src = link.dataset.grande || link.getAttribute("href");
  imagemGrande.alt = miniatura.alt;
  legendaGrande.textContent = legenda.querySelector("strong").textContent + (descricao.trim() ? ". " + descricao.trim() : "");
  posicao.textContent = (indice + 1) + " / " + miniaturas.length;
}

document.addEventListener("click", function (evento) {
  const link = evento.target.closest(".foto-link");
  if (!link) { return; }
  evento.preventDefault();
  mostrar(Array.prototype.indexOf.call(listaMiniaturas(), link));
  visualizador.showModal();
});

document.getElementById("visualizador-anterior").addEventListener("click", function () {
  mostrar(indice - 1);
});

document.getElementById("visualizador-proximo").addEventListener("click", function () {
  mostrar(indice + 1);
});

document.getElementById("visualizador-fechar").addEventListener("click", function () {
  visualizador.close();
});

visualizador.addEventListener("click", function (evento) {
  if (evento.target === visualizador) {
    visualizador.close();
  }
});

visualizador.addEventListener("keydown", function (evento) {
  if (evento.key === "ArrowLeft") {
    mostrar(indice - 1);
  } else if (evento.key === "ArrowRight") {
    mostrar(indice + 1);
  }
});

function carregarFotos() {
  try {
    const bruto = localStorage.getItem(CHAVE_FOTOS);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    return [];
  }
}

function salvarFotos(lista) {
  try {
    localStorage.setItem(CHAVE_FOTOS, JSON.stringify(lista));
    return true;
  } catch (erro) {
    return false;
  }
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem alert " + (tipo === "erro" ? "alert-danger" : "alert-success");
}

function reduzirImagem(arquivo) {
  return new Promise(function (resolve, reject) {
    const leitor = new FileReader();
    leitor.onerror = function () { reject(new Error("leitura")); };
    leitor.onload = function () {
      const imagem = new Image();
      imagem.onerror = function () { reject(new Error("imagem")); };
      imagem.onload = function () {
        const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
        const tela = document.createElement("canvas");
        tela.width = Math.round(imagem.width * escala);
        tela.height = Math.round(imagem.height * escala);
        tela.getContext("2d").drawImage(imagem, 0, 0, tela.width, tela.height);
        resolve(tela.toDataURL("image/jpeg", 0.8));
      };
      imagem.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function criarFigura(foto) {
  const figura = document.createElement("figure");
  figura.className = "foto";

  const link = document.createElement("a");
  link.className = "foto-link";
  link.href = foto.dados;
  const imagem = document.createElement("img");
  imagem.src = foto.dados;
  imagem.alt = foto.titulo + (foto.descricao ? ". " + foto.descricao : "");
  imagem.loading = "lazy";
  link.appendChild(imagem);

  const legenda = document.createElement("figcaption");
  const titulo = document.createElement("strong");
  titulo.textContent = foto.titulo;
  legenda.appendChild(titulo);
  legenda.appendChild(document.createTextNode(foto.descricao || ""));

  const autor = document.createElement("span");
  autor.className = "foto-autor";
  autor.textContent = "Enviada por " + foto.autorNome;
  legenda.appendChild(autor);

  if (usuario && usuario.email === foto.autorEmail) {
    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "btn btn-danger btn-sm foto-remover";
    remover.textContent = "Remover";
    remover.dataset.id = foto.id;
    legenda.appendChild(remover);
  }

  figura.appendChild(link);
  figura.appendChild(legenda);
  return figura;
}

function renderizarFotos() {
  const lista = carregarFotos();
  galeriaUsuarios.innerHTML = "";
  lista.forEach(function (foto) {
    galeriaUsuarios.appendChild(criarFigura(foto));
  });
  vazioComunidade.hidden = lista.length > 0;
  contagemComunidade.textContent = lista.length === 1 ? "1 foto" : lista.length + " fotos";
}

formFoto.hidden = !usuario;
avisoLogin.hidden = !!usuario;

formFoto.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (!usuario) {
    mostrarMensagem("Entre na sua conta para enviar uma foto.", "erro");
    return;
  }

  const arquivo = document.getElementById("arquivo").files[0];

  if (!formFoto.checkValidity() || !arquivo) {
    mostrarMensagem("Escolha uma imagem e informe um título de 3 a 40 caracteres.", "erro");
    return;
  }

  if (arquivo.type.indexOf("image/") !== 0) {
    mostrarMensagem("O arquivo escolhido não é uma imagem.", "erro");
    return;
  }

  if (arquivo.size > LIMITE_ARQUIVO) {
    mostrarMensagem("A imagem passa de 8 MB. Escolha uma menor.", "erro");
    return;
  }

  let dados;
  try {
    dados = await reduzirImagem(arquivo);
  } catch (erro) {
    mostrarMensagem("Não foi possível ler essa imagem.", "erro");
    return;
  }

  const campos = new FormData(formFoto);
  const lista = carregarFotos();
  lista.unshift({
    id: Date.now(),
    titulo: campos.get("titulo").trim(),
    descricao: campos.get("descricao").trim(),
    dados: dados,
    autorEmail: usuario.email,
    autorNome: usuario.nome
  });

  if (!salvarFotos(lista)) {
    mostrarMensagem("O espaço do navegador acabou. Remova alguma foto e tente de novo.", "erro");
    return;
  }

  renderizarFotos();
  formFoto.reset();
  mostrarMensagem("Foto publicada na galeria da comunidade.", "ok");
});

galeriaUsuarios.addEventListener("click", function (evento) {
  const alvo = evento.target;
  if (!alvo.dataset.id || !usuario) { return; }

  const restantes = carregarFotos().filter(function (foto) {
    return String(foto.id) !== alvo.dataset.id || foto.autorEmail !== usuario.email;
  });
  salvarFotos(restantes);
  renderizarFotos();
  mostrarMensagem("Foto removida.", "ok");
});

renderizarFotos();

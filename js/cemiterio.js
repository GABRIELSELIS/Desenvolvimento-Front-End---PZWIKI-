/*
  Arquivo: js/cemiterio.js
  Descricao: cadastro de mortes dos sobreviventes com localStorage e exibicao em tabela
*/
const CHAVE = "pzwiki_cemiterio";

const formulario = document.getElementById("form-morte");
const corpoTabela = document.getElementById("corpo-tabela");
const mensagem = document.getElementById("mensagem");
const contador = document.getElementById("contador");
const botaoLimpar = document.getElementById("limpar-tudo");
const avisoLogin = document.getElementById("aviso-login");
const usuario = Auth.usuarioAtual();

const registrosIniciais = [
  { id: 1, nome: "Doug Walker", causa: "Mordida de zumbi", dias: 3, data: "01/11/2026", historia: "Entrei em Muldraugh sem arma e fui cercado em frente ao mercado." },
  { id: 2, nome: "Mary Ann", causa: "Fome", dias: 21, data: "02/11/2026", historia: "Esqueci de procurar comida e o estoque acabou durante a chuva." },
  { id: 3, nome: "Jack Rosewood", causa: "Acidente de carro", dias: 9, data: "03/11/2026", historia: "Roubei um carro em Rosewood, acelerei demais e bati em uma barreira." },
  { id: 4, nome: "Lia Louisville", causa: "Hemorragia", dias: 14, data: "04/11/2026", historia: "Sem bandagens limpas, o ferimento nunca estancou." }
];

function configurarAcesso() {
  formulario.hidden = !usuario;
  avisoLogin.hidden = !!usuario;
  botaoLimpar.hidden = !usuario;
}

function podeRemover(registro) {
  return !!usuario && (!registro.autorEmail || registro.autorEmail === usuario.email);
}

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    return [];
  }
}

function salvar(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem alert " + (tipo === "erro" ? "alert-danger" : "alert-success");
}

function renderizar() {
  const lista = carregar();
  corpoTabela.innerHTML = "";

  if (lista.length === 0) {
    const linhaVazia = document.createElement("tr");
    const celulaVazia = criarCelula("Nenhum sobrevivente registrado ainda.");
    celulaVazia.colSpan = 7;
    celulaVazia.className = "vazio";
    linhaVazia.appendChild(celulaVazia);
    corpoTabela.appendChild(linhaVazia);
  }

  for (let i = 0; i < lista.length; i++) {
    const registro = lista[i];
    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(registro.nome));
    linha.appendChild(criarCelula(registro.causa));
    linha.appendChild(criarCelula(registro.dias));
    linha.appendChild(criarCelula(registro.data));
    linha.appendChild(criarCelula(registro.historia));
    linha.appendChild(criarCelula(registro.autorNome || "Wiki PZ"));

    const celulaAcao = document.createElement("td");
    if (podeRemover(registro)) {
      const botaoRemover = document.createElement("button");
      botaoRemover.type = "button";
      botaoRemover.className = "btn btn-danger btn-sm";
      botaoRemover.textContent = "Remover";
      botaoRemover.dataset.id = registro.id;
      celulaAcao.appendChild(botaoRemover);
    }
    linha.appendChild(celulaAcao);

    corpoTabela.appendChild(linha);
  }

  contador.textContent = lista.length === 1 ? "1 sobrevivente registrado" : lista.length + " sobreviventes registrados";
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (!usuario) {
    mostrarMensagem("Entre na sua conta para registrar uma morte.", "erro");
    return;
  }

  if (!formulario.checkValidity()) {
    mostrarMensagem("Corrija os campos destacados antes de enviar.", "erro");
    formulario.reportValidity();
    return;
  }

  const dados = new FormData(formulario);
  const registro = {
    id: Date.now(),
    nome: dados.get("nome").trim(),
    causa: dados.get("causa"),
    dias: Number(dados.get("dias")),
    data: new Date().toLocaleDateString("pt-BR"),
    historia: dados.get("historia").trim(),
    autorEmail: usuario.email,
    autorNome: usuario.nome
  };

  const lista = carregar();
  lista.unshift(registro);
  salvar(lista);
  renderizar();
  formulario.reset();
  mostrarMensagem("Registro salvo. " + registro.nome + " agora descansa no cemitério.", "ok");
});

corpoTabela.addEventListener("click", function (evento) {
  const alvo = evento.target;

  if (alvo.dataset.id && usuario) {
    const restantes = carregar().filter(function (item) {
      return String(item.id) !== alvo.dataset.id || !podeRemover(item);
    });
    salvar(restantes);
    renderizar();
    mostrarMensagem("Registro removido.", "ok");
  }
});

botaoLimpar.addEventListener("click", function () {
  if (usuario && confirm("Apagar todos os registros feitos por você?")) {
    salvar(carregar().filter(function (item) {
      return !podeRemover(item) || !item.autorEmail;
    }));
    renderizar();
    mostrarMensagem("Seus registros foram apagados.", "ok");
  }
});

if (localStorage.getItem(CHAVE) === null) {
  salvar(registrosIniciais);
}

configurarAcesso();
renderizar();

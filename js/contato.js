/*
  Arquivo: js/contato.js
  Descricao: validacao e envio do formulario de contato, com as mensagens salvas no localStorage
*/
const CHAVE_CONTATOS = "pzwiki_contatos";
const LIMITE_CONTATOS = 50;

const formContato = document.getElementById("form-contato");
const campoTexto = document.getElementById("texto");
const contadorTexto = document.getElementById("contador-texto");
const mensagemContato = document.getElementById("mensagem");

function mostrarAlerta(texto, tipo) {
  mensagemContato.textContent = texto;
  mensagemContato.className = "mensagem alert " + (tipo === "erro" ? "alert-danger" : "alert-success");
}

function carregarContatos() {
  try {
    const bruto = localStorage.getItem(CHAVE_CONTATOS);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    return [];
  }
}

function salvarContatos(lista) {
  try {
    localStorage.setItem(CHAVE_CONTATOS, JSON.stringify(lista));
    return true;
  } catch (erro) {
    return false;
  }
}

function atualizarContador() {
  contadorTexto.textContent = campoTexto.value.length + " / " + campoTexto.maxLength;
}

const usuario = Auth.usuarioAtual();
if (usuario) {
  document.getElementById("nome").value = usuario.nome;
  document.getElementById("email").value = usuario.email;
}

campoTexto.addEventListener("input", atualizarContador);

formContato.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (!formContato.checkValidity()) {
    mostrarAlerta("Corrija os campos destacados antes de enviar.", "erro");
    formContato.reportValidity();
    return;
  }

  const dados = new FormData(formContato);
  const lista = carregarContatos();
  lista.unshift({
    id: Date.now(),
    nome: dados.get("nome").trim(),
    email: dados.get("email").trim().toLowerCase(),
    assunto: dados.get("assunto"),
    mensagem: dados.get("mensagem").trim(),
    data: new Date().toLocaleDateString("pt-BR")
  });

  while (lista.length > LIMITE_CONTATOS) {
    lista.pop();
  }

  if (!salvarContatos(lista)) {
    mostrarAlerta("Não foi possível salvar a mensagem neste navegador.", "erro");
    return;
  }

  mostrarAlerta("Mensagem enviada, " + lista[0].nome + ". Obrigado pelo contato!", "ok");
  formContato.reset();
  atualizarContador();
});

atualizarContador();

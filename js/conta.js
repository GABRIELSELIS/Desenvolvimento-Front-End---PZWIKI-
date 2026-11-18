/*
  Arquivo: js/conta.js
  Descricao: validacao e envio dos formularios de login e de cadastro
*/
const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const mensagemConta = document.getElementById("mensagem");

function avisar(texto, tipo) {
  mensagemConta.textContent = texto;
  mensagemConta.className = "mensagem alert " + (tipo === "erro" ? "alert-danger" : "alert-success");
}

if (Auth.usuarioAtual()) {
  location.replace(paginaDestino());
}

if (formLogin) {
  formLogin.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (!formLogin.checkValidity()) {
      avisar("Preencha e-mail e senha corretamente.", "erro");
      formLogin.reportValidity();
      return;
    }
    const dados = new FormData(formLogin);
    const resposta = await Auth.entrar(dados.get("email"), dados.get("senha"));
    if (!resposta.ok) {
      avisar(resposta.erro, "erro");
      return;
    }
    avisar("Login feito. Redirecionando...", "ok");
    location.href = paginaDestino();
  });
}

if (formCadastro) {
  const campoConfirmar = document.getElementById("confirmar");
  const campoSenha = document.getElementById("senha");

  function conferirSenhas() {
    campoConfirmar.setCustomValidity(campoConfirmar.value === campoSenha.value ? "" : "As senhas não são iguais.");
  }

  campoSenha.addEventListener("input", conferirSenhas);
  campoConfirmar.addEventListener("input", conferirSenhas);

  formCadastro.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    conferirSenhas();
    if (!formCadastro.checkValidity()) {
      avisar("Corrija os campos destacados antes de enviar.", "erro");
      formCadastro.reportValidity();
      return;
    }
    const dados = new FormData(formCadastro);
    const resposta = await Auth.cadastrar(dados.get("nome"), dados.get("email"), dados.get("senha"));
    if (!resposta.ok) {
      avisar(resposta.erro, "erro");
      return;
    }
    avisar("Conta criada. Redirecionando...", "ok");
    location.href = paginaDestino();
  });
}

const linkCadastro = document.getElementById("link-cadastro");
const linkLogin = document.getElementById("link-login");
if (linkCadastro) { linkCadastro.href = "cadastro.html" + location.search; }
if (linkLogin) { linkLogin.href = "login.html" + location.search; }

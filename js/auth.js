/*
  Arquivo: js/auth.js
  Descricao: contas de usuario (cadastro, login e sessao) com localStorage e botoes de conta no cabecalho
*/
const CHAVE_USUARIOS = "pzwiki_usuarios";
const CHAVE_SESSAO = "pzwiki_sessao";

function lerArmazenado(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (erro) {
    return padrao;
  }
}

function gravarArmazenado(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    return false;
  }
}

async function gerarHash(texto) {
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(texto);
    const resumo = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(resumo)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }
  let h = 5381;
  for (let i = 0; i < texto.length; i++) {
    h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  }
  return "s" + h.toString(16);
}

const Auth = {
  usuarios: function () {
    return lerArmazenado(CHAVE_USUARIOS, []);
  },

  usuarioAtual: function () {
    const email = lerArmazenado(CHAVE_SESSAO, null);
    if (!email) { return null; }
    const achado = this.usuarios().find(function (u) { return u.email === email; });
    return achado ? { nome: achado.nome, email: achado.email } : null;
  },

  cadastrar: async function (nome, email, senha) {
    const emailLimpo = email.trim().toLowerCase();
    const lista = this.usuarios();
    if (lista.some(function (u) { return u.email === emailLimpo; })) {
      return { ok: false, erro: "Já existe uma conta com esse e-mail." };
    }
    const sal = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const hash = await gerarHash(sal + senha);
    lista.push({ nome: nome.trim(), email: emailLimpo, sal: sal, hash: hash });
    if (!gravarArmazenado(CHAVE_USUARIOS, lista)) {
      return { ok: false, erro: "Não foi possível salvar a conta neste navegador." };
    }
    gravarArmazenado(CHAVE_SESSAO, emailLimpo);
    return { ok: true };
  },

  entrar: async function (email, senha) {
    const emailLimpo = email.trim().toLowerCase();
    const achado = this.usuarios().find(function (u) { return u.email === emailLimpo; });
    if (!achado) { return { ok: false, erro: "E-mail ou senha incorretos." }; }
    const hash = await gerarHash(achado.sal + senha);
    if (hash !== achado.hash) { return { ok: false, erro: "E-mail ou senha incorretos." }; }
    gravarArmazenado(CHAVE_SESSAO, emailLimpo);
    return { ok: true };
  },

  sair: function () {
    try { localStorage.removeItem(CHAVE_SESSAO); } catch (erro) { return; }
  }
};

const RAIZ_AUTH = new URL("../", document.currentScript.src);

function paginaDestino() {
  const alvo = new URLSearchParams(location.search).get("voltar");
  return alvo && /^[a-z0-9-]+(\/[a-z0-9-]+)*\.html$/i.test(alvo) ? new URL(alvo, RAIZ_AUTH).href : new URL("index.html", RAIZ_AUTH).href;
}

function montarContaCabecalho() {
  const barra = document.querySelector(".topo-barra");
  if (!barra) { return; }

  const conta = document.createElement("div");
  conta.className = "conta";
  const atual = location.pathname.slice(RAIZ_AUTH.pathname.length) || "index.html";
  const voltar = "?voltar=" + encodeURIComponent(atual);
  const usuario = Auth.usuarioAtual();

  if (usuario) {
    const saudacao = document.createElement("span");
    saudacao.className = "conta-nome";
    saudacao.textContent = "Olá, " + usuario.nome;

    const botaoSair = document.createElement("button");
    botaoSair.type = "button";
    botaoSair.className = "conta-botao";
    botaoSair.textContent = "Sair";
    botaoSair.addEventListener("click", function () {
      Auth.sair();
      location.reload();
    });

    conta.appendChild(saudacao);
    conta.appendChild(botaoSair);
  } else {
    const entrar = document.createElement("a");
    entrar.className = "conta-botao";
    entrar.href = new URL("login.html", RAIZ_AUTH).href + voltar;
    entrar.textContent = "Entrar";

    const criar = document.createElement("a");
    criar.className = "conta-botao conta-destaque";
    criar.href = new URL("cadastro.html", RAIZ_AUTH).href + voltar;
    criar.textContent = "Criar conta";

    conta.appendChild(entrar);
    conta.appendChild(criar);
  }

  const botaoMenu = document.getElementById("menu-botao");
  barra.insertBefore(conta, botaoMenu);
}

montarContaCabecalho();

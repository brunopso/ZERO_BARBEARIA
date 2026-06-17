// 1) Cole aqui a URL do Web App do Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxDaSukjGDZZ30lZBQoepHeSEAcWY9c4xGUnnnK9ZWw80l_gt3U4nKTvqIw-89mnIbejg/exec";

// 2) Coloque aqui o WhatsApp da barbearia com DDD, somente números
const WHATSAPP_BARBEARIA = "44991469073";

// 3) Serviços baseados no link informado
const servicos = [
  { nome: "CORTE DE CABELO", preco: "R$ 35,00", duracao: "30min" },
  { nome: "CORTE DE BARBA", preco: "R$ 30,00", duracao: "30min" },
  { nome: "CORTE DE CABELO + BARBA", preco: "R$ 60,00", duracao: "60min" },
  { nome: "CORTE DE CABELO + SOBRANCELHA", preco: "R$ 45,00", duracao: "30min" },
  { nome: "RELAXAMENTO", preco: "R$ 35,00", duracao: "30min" },
  { nome: "LIMPEZA DE PELE", preco: "R$ 25,00", duracao: "30min" }
];

// Ajuste os horários conforme funcionamento da barbearia
const horarios = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00",
  "17:30", "18:00"
];

const servicosDiv = document.getElementById("servicos");
const servicoSelect = document.getElementById("servico");
const horarioSelect = document.getElementById("horario");
const form = document.getElementById("formAgendamento");
const statusMsg = document.getElementById("status");

function carregarServicos() {
  servicos.forEach((s, index) => {
    const card = document.createElement("div");
    card.className = "servico-card";
    card.innerHTML = `
      <h3>${s.nome}</h3>
      <p class="preco">${s.preco}</p>
      <p>Duração: ${s.duracao}</p>
    `;
    servicosDiv.appendChild(card);

    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${s.nome} - ${s.preco} - ${s.duracao}`;
    servicoSelect.appendChild(option);
  });
}

function carregarHorarios() {
  horarios.forEach(h => {
    const option = document.createElement("option");
    option.value = h;
    option.textContent = h;
    horarioSelect.appendChild(option);
  });
}

function configurarDataMinima() {
  const dataInput = document.getElementById("data");
  const hoje = new Date().toISOString().split("T")[0];
  dataInput.min = hoje;
}

async function salvarNaPlanilha(dados) {
  if (!WEB_APP_URL || WEB_APP_URL.includes("COLE_AQUI")) {
    return { ok: false, motivo: "URL do Apps Script não configurada." };
  }

  const resposta = await fetch(WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  return { ok: true };
}

function abrirWhatsApp(dados) {
  const texto = `Olá! Novo agendamento:%0A%0A` +
    `Nome: ${dados.nome}%0A` +
    `Telefone: ${dados.telefone}%0A` +
    `Barbeiro: ${dados.barbeiro}%0A` +
    `Serviço: ${dados.servico}%0A` +
    `Valor: ${dados.preco}%0A` +
    `Duração: ${dados.duracao}%0A` +
    `Data: ${dados.data}%0A` +
    `Horário: ${dados.horario}%0A` +
    `Observação: ${dados.observacao || "Nenhuma"}%0A%0A` +
    `Pagamento: Pix disponível ou cartão presencial.`;

  window.open(`https://wa.me/55${WHATSAPP_BARBEARIA}?text=${texto}`, "_blank");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const servicoEscolhido = servicos[servicoSelect.value];

  const dados = {
    nome: document.getElementById("nome").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    barbeiro: document.getElementById("barbeiro").value,
    servico: servicoEscolhido.nome,
    preco: servicoEscolhido.preco,
    duracao: servicoEscolhido.duracao,
    data: document.getElementById("data").value,
    horario: document.getElementById("horario").value,
    observacao: document.getElementById("observacao").value.trim(),
    criadoEm: new Date().toLocaleString("pt-BR")
  };

  statusMsg.textContent = "Registrando agendamento...";

  try {
    await salvarNaPlanilha(dados);
    statusMsg.textContent = "Agendamento registrado! Abrindo WhatsApp para confirmação.";
    abrirWhatsApp(dados);
    form.reset();
    configurarDataMinima();
  } catch (erro) {
    statusMsg.textContent = "Não foi possível salvar na planilha, mas o WhatsApp será aberto.";
    abrirWhatsApp(dados);
  }
});

carregarServicos();
carregarHorarios();
configurarDataMinima();

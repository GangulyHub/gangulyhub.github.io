const numeroWhatsApp = '5521977801823';
const hospedagemEstatica = window.location.hostname.endsWith('.github.io');
const apiAgendamentos = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api/agendamentos'
    : '/api/agendamentos';

if (hospedagemEstatica) {
    document.getElementById('clientes').hidden = true;
    const linkClientes = document.querySelector('nav a[href="#clientes"]');
    if (linkClientes) linkClientes.closest('li').hidden = true;
    document.querySelector('.aviso-whatsapp').textContent =
        'Seu pedido será enviado pelo WhatsApp. Os agendamentos não ficam salvos no site.';
}

function abrirWhatsAppComMensagem(mensagem) {
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
    return urlWhatsApp;
}

function criarMensagemAgendamento({ nome, telefone, servico, data, horario }) {
    const dataFormatada = data.split('-').reverse().join('/');
    return `Olá! 👋\n\nGostaria de agendar um serviço de estética:\n\n📋 *Dados do Agendamento:*\n👤 Nome: ${nome}\n📱 Telefone: ${telefone}\n💆 Serviço: ${servico}\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horario}\n\nPor favor, confirme a disponibilidade.`;
}

function adicionarAgendamentoNaTabela(agendamento) {
    const tabela = document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();
    const dataFormatada = agendamento.data.split('-').reverse().join('/');

    [agendamento.nome, agendamento.telefone, agendamento.servico, dataFormatada, agendamento.horario]
        .forEach(function(valor) {
            novaLinha.insertCell().textContent = valor;
        });
}

function atualizarTabela(agendamentos) {
    const tabela = document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    agendamentos.forEach(adicionarAgendamentoNaTabela);
    document.getElementById('total-clientes').textContent = agendamentos.length;
}

async function carregarAgendamentos() {
    const resposta = await fetch(apiAgendamentos);
    if (!resposta.ok) throw new Error('Não foi possível carregar os agendamentos.');
    atualizarTabela(await resposta.json());
}

document.getElementById('form-agendamento').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const servicoSelect = document.getElementById('servico');
    const servico = servicoSelect.options[servicoSelect.selectedIndex].text;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    const dados = { nome, telefone, servico, data, horario };

    if (hospedagemEstatica) {
        abrirWhatsAppComMensagem(criarMensagemAgendamento(dados));
        document.getElementById('form-agendamento').reset();
        return;
    }

    try {
        const resposta = await fetch(apiAgendamentos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || 'Não foi possível salvar o agendamento.');
        }

        adicionarAgendamentoNaTabela(await resposta.json());
        document.getElementById('total-clientes').textContent =
            document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0].rows.length;
    } catch (erro) {
        alert(erro.message);
        return;
    }

    abrirWhatsAppComMensagem(criarMensagemAgendamento(dados));

    // Limpar formulário
    document.getElementById('form-agendamento').reset();
});

if (!hospedagemEstatica) {
    carregarAgendamentos().catch(function(erro) {
        console.error(erro);
    });
}

const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatClose = document.getElementById('chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBody = document.getElementById('chat-body');

function appendMessage(message, type) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.textContent = message;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function extrairDadosDoTexto(texto) {
    const resultado = {
        servico: '',
        data: '',
        horario: ''
    };

    if (texto.includes('massagem')) resultado.servico = 'Massagem Relaxante';
    if (texto.includes('limpeza')) resultado.servico = 'Limpeza de Pele';
    if (texto.includes('depilacao') || texto.includes('depilação')) resultado.servico = 'Depilação Íntima';

    const matchData = texto.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/);
    if (matchData) {
        resultado.data = matchData[0].replace('/', '/');
    }

    const matchHorario = texto.match(/(\d{1,2}:\d{2})/);
    if (matchHorario) {
        resultado.horario = matchHorario[1];
    }

    return resultado;
}

function responderIA(mensagem) {
    const texto = mensagem.toLowerCase();

    if (texto.includes('agendar') || texto.includes('horario') || texto.includes('horário')) {
        const dados = extrairDadosDoTexto(mensagem);
        let mensagemAgendamento = 'Olá! Gostaria de agendar um serviço de estética.\n\n📋 Dados do cliente:\n';

        if (dados.servico) {
            mensagemAgendamento += `💆 Serviço: ${dados.servico}\n`;
        }

        if (dados.data) {
            mensagemAgendamento += `📅 Data: ${dados.data}\n`;
        }

        if (dados.horario) {
            mensagemAgendamento += `⏰ Horário: ${dados.horario}\n`;
        }

        mensagemAgendamento += `\nMensagem do cliente: ${mensagem}`;
        abrirWhatsAppComMensagem(mensagemAgendamento);
        return 'Perfeito! Vou encaminhar seu agendamento para o WhatsApp da profissional.';
    }

    if (texto.includes('serviço') || texto.includes('servico') || texto.includes('tratamento')) {
        return 'Oferecemos massagem relaxante, limpeza de pele e depilação íntima. Qual deles você deseja saber mais?';
    }

    if (texto.includes('preço') || texto.includes('valor') || texto.includes('quanto')) {
        return 'Os valores podem variar conforme o tratamento escolhido. Para saber o valor exato, fale com a equipe pelo WhatsApp.';
    }

    if (texto.includes('local') || texto.includes('endereço') || texto.includes('onde')) {
        return 'Estamos localizados em Rua Trancredo d\'Neve, Inhaúma, Casa 17. Posso te ajudar com mais detalhes.';
    }

    if (texto.includes('massagem')) {
        return 'A massagem relaxante é ideal para aliviar tensão, melhorar o bem-estar e reduzir o stress do dia a dia.';
    }

    if (texto.includes('pele') || texto.includes('limpeza')) {
        return 'A limpeza de pele ajuda a renovar a aparência, remover impurezas e melhorar o aspecto da sua pele.';
    }

    if (texto.includes('depilação') || texto.includes('depilacao')) {
        return 'A depilação íntima é feita com cuidado, profissionalismo e total atenção à sua privacidade.';
    }

    if (texto.includes('oi') || texto.includes('olá') || texto.includes('ola')) {
        return 'Olá! Como posso ajudar você hoje?';
    }

    if (texto.includes('obrigado') || texto.includes('valeu')) {
        return 'Foi um prazer ajudar! Se quiser, posso orientar sobre serviços ou agendamento.';
    }

    return 'Posso te ajudar com agendamento, serviços, horários e localização. Me diga o que você precisa.';
}

chatToggle.addEventListener('click', function() {
    chatWidget.classList.toggle('open');
    if (chatWidget.classList.contains('open')) {
        chatInput.focus();
    }
});

chatClose.addEventListener('click', function() {
    chatWidget.classList.remove('open');
});

chatForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const mensagem = chatInput.value.trim();
    if (!mensagem) return;

    appendMessage(mensagem, 'user');
    chatInput.value = '';

    setTimeout(function() {
        const resposta = responderIA(mensagem);
        appendMessage(resposta, 'bot');
    }, 500);
});
document.getElementById('form-agendamento').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const servicoSelect = document.getElementById('servico');
    const servico = servicoSelect.options[servicoSelect.selectedIndex].text;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    // Converter data para formato brasileiro
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Adicionar à tabela (banco de dados local)
    const tabela = document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();

    const celulaNome = novaLinha.insertCell(0);
    const celulaTelefone = novaLinha.insertCell(1);
    const celulaServico = novaLinha.insertCell(2);
    const celulaData = novaLinha.insertCell(3);
    const celulaHorario = novaLinha.insertCell(4);

    celulaNome.textContent = nome;
    celulaTelefone.textContent = telefone;
    celulaServico.textContent = servico;
    celulaData.textContent = dataFormatada;
    celulaHorario.textContent = horario;

    // Atualizar contador
    const totalClientes = document.getElementById('total-clientes');
    totalClientes.textContent = parseInt(totalClientes.textContent) + 1;

    // Enviar para WhatsApp
    const mensagem = `Olá! 👋\n\nGostaria de agendar um serviço de estética:\n\n📋 *Dados do Agendamento:*\n👤 Nome: ${nome}\n📱 Telefone: ${telefone}\n💆 Serviço: ${servico}\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horario}\n\nPor favor, confirme a disponibilidade.`;
    
    const urlWhatsApp = `https://wa.me/21977801823?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp automaticamente
    window.open(urlWhatsApp, '_blank');

    // Limpar formulário
    document.getElementById('form-agendamento').reset();
});
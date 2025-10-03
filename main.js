// IP fixo da origem (não muda)
const ipOrigem = "192.168.1.10";

// Função: converte um IP (decimal) para binário (32 bits)
function ipParaBinario(ip) {
  // Separa o IP em octetos, converte cada parte para binário (8 bits) e junta tudo
  return ip.split('.').map(oct => (+oct).toString(2).padStart(8, '0')).join('');
}

// Função: converte um IP em binário (32 bits) para o formato decimal (xxx.xxx.xxx.xxx)
function binarioParaIp(bin) {
  return bin.match(/.{8}/g).map(b => parseInt(b, 2)).join('.');
}

// Função: gera a máscara em binário a partir da quantidade de bits (CIDR)
// Exemplo: /24 -> 11111111.11111111.11111111.00000000
function gerarMascara(bits) {
  return '1'.repeat(bits).padEnd(32, '0');
}

// Função: formata um binário de 32 bits em grupos de 8 separados por ponto
// Exemplo: 11111111111111111111111100000000 -> 11111111.11111111.11111111.00000000
function formatarBinarioEmOctetos(bin) {
  return bin.match(/.{8}/g).join('.');
}

// Função: valida se o IP digitado pelo usuário é válido
function validarIP(ip) {
  const octetos = ip.split('.');
  if (octetos.length !== 4) return false; // precisa ter 4 partes
  return octetos.every(oct => {
    const num = parseInt(oct);
    return !isNaN(num) && num >= 0 && num <= 255; // cada parte deve ser 0–255
  });
}

// Função principal que será chamada quando o usuário clicar em "Verificar"
function verificar() {
  // Lê os valores digitados no formulário
  const bitsInput = document.getElementById('bits').value.trim();   // quantidade de bits da máscara
  const ipDestino = document.getElementById('ipDestino').value.trim(); // IP destino digitado
  const resultado = document.getElementById('resultado'); // área onde o resultado será mostrado
  resultado.className = ''; // limpa estilos antigos

  // Valida se os bits da máscara são válidos
  const bits = parseInt(bitsInput);
  if (!bitsInput || isNaN(bits) || bits < 1 || bits > 32) {
    resultado.innerText = "⚠️ Máscara inválida! Digite um número entre 1 e 32.";
    resultado.classList.add('error');
    return;
  }

  // Valida se o IP destino é válido
  if (!ipDestino || !validarIP(ipDestino)) {
    resultado.innerText = "⚠️ IP de destino inválido! Use o formato XXX.XXX.XXX.XXX (0-255).";
    resultado.classList.add('error');
    return;
  }

  // Gera a máscara em binário e converte para decimal
  const maskBin = gerarMascara(bits);
  const maskDecimal = binarioParaIp(maskBin);
  const maskBinFormatada = formatarBinarioEmOctetos(maskBin);

  // Converte os IPs origem e destino para binário
  const origemBin = ipParaBinario(ipOrigem);
  const destinoBin = ipParaBinario(ipDestino);

  // Calcula o endereço da rede (AND bit a bit entre IP e máscara)
  const redeOrigemBin = origemBin.split('').map((b, i) => b & maskBin[i]).join('');
  const redeDestinoBin = destinoBin.split('').map((b, i) => b & maskBin[i]).join('');

  // Converte os endereços de rede de volta para decimal
  const redeOrigemDecimal = binarioParaIp(redeOrigemBin);
  const redeDestinoDecimal = binarioParaIp(redeDestinoBin);

  // Compara as redes de origem e destino
  if (redeOrigemBin === redeDestinoBin) {
    // Se forem iguais, estão na mesma rede
    resultado.classList.add('success');
    resultado.innerHTML = `
      <b>Máscara:</b><br>
      Decimal: ${maskDecimal} <br>
      Binário: <code>${maskBinFormatada}</code><br><br>
      <b>Redes calculadas:</b><br>
      Origem: ${redeOrigemDecimal}<br>
      Destino: ${redeDestinoDecimal}<br><br>
      ✅ O IP está na <b>mesma rede</b>.
    `;
  } else {
    // Se forem diferentes, não estão na mesma rede
    resultado.classList.add('error');
    resultado.innerHTML = `
      <b>Máscara:</b><br>
      Decimal: ${maskDecimal} <br>
      Binário: <code>${maskBinFormatada}</code><br><br>
      <b>Redes calculadas:</b><br>
      Origem: ${redeOrigemDecimal}<br>
      Destino: ${redeDestinoDecimal}<br><br>
      ❌ O IP <b>NÃO</b> está na mesma rede.
    `;
  }
}

// LOS CHAVALESS

// Fotitos de los chavales
let fotos = ['img/ares.png', 'img/same.png', 'img/lafu.png', 'img/cr.png', 'img/machi.png',
  'img/pedro.png', 'img/varo.png', 'img/cou.png', 'img/mategui.png', 'img/marieco.png',
  'img/gbro.png', 'img/rome.png', 'img/eloy.png', 'img/cosmo.png', 'img/clubdelectura.png'];

// estado de la partida
let jugador = '';
let score = 0;
let segundos = 60;
let cuentaAtras = null;
let primera = null;
let bloqueado = false;
let parejas = 0;
let enPartida = false;

// TOP 5
function anadirAviso(lista, texto) {
  let aviso = document.createElement('li');
  aviso.className = 'aviso';
  aviso.textContent = texto;
  lista.appendChild(aviso);
}

function mostrarTop5() {
  let lista = document.getElementById('lista-top5');
  lista.innerHTML = '';
  anadirAviso(lista, 'Cargando...');

  fetch('/api/top5')
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (jugadores) {
      lista.innerHTML = '';
      if (jugadores.length == 0) {
        anadirAviso(lista, 'Aun no ha jugado nadie');
        return;
      }
      for (let i = 0; i < jugadores.length; i++) {
        let fila = document.createElement('li');

        let puesto = document.createElement('span');
        puesto.className = 'puesto';
        puesto.textContent = i + 1;

        let quien = document.createElement('span');
        quien.className = 'quien';
        quien.textContent = jugadores[i].jugador;

        let total = document.createElement('span');
        total.className = 'total';
        total.textContent = jugadores[i].score + ' pts';

        fila.appendChild(puesto);
        fila.appendChild(quien);
        fila.appendChild(total);
        lista.appendChild(fila);
      }
    })
    .catch(function () {
      lista.innerHTML = '';
      anadirAviso(lista, 'No se pudo cargar el top 5');
    });
}

// CAMBIOS DE PANTALLA Y VENTANAS
function volverAlInicio() {
  clearInterval(cuentaAtras);
  enPartida = false;
  document.getElementById('modal-final').classList.add('escondido');
  document.getElementById('pantalla-tablero').classList.remove('visible');
  document.getElementById('pantalla-menu').classList.add('visible');
  mostrarTop5();
}

function abrirVentanaNombre() {
  document.getElementById('modal-nombre').classList.remove('escondido');
  document.getElementById('campo-nombre').value = jugador;
  document.getElementById('campo-nombre').focus();
}

function cerrarVentanaNombre() {
  document.getElementById('modal-nombre').classList.add('escondido');
}

function enviarNombre(evento) {
  evento.preventDefault();
  let escrito = document.getElementById('campo-nombre').value.trim();
  if (escrito == '') {
    return;
  }
  jugador = escrito;
  cerrarVentanaNombre();
  nuevaPartida();
}

// TABLERO
function mezclar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    let azar = Math.floor(Math.random() * (i + 1));
    let temporal = lista[i];
    lista[i] = lista[azar];
    lista[azar] = temporal;
  }
  return lista;
}

function montarTablero() {
  // aquí meto las fotos dos veces para formar las parejas
  let numeros = [];
  for (let i = 0; i < fotos.length; i++) {
    numeros.push(i);
    numeros.push(i);
  }
  mezclar(numeros);

  let tablero = document.getElementById('tablero');
  tablero.innerHTML = '';

  for (let k = 0; k < numeros.length; k++) {
    let carta = document.createElement('button');
    carta.className = 'carta';
    carta.dataset.foto = numeros[k];

    let dorso = document.createElement('div');
    dorso.className = 'dorso';

    let imagen = document.createElement('img');
    imagen.className = 'foto';
    imagen.src = fotos[numeros[k]];
    imagen.draggable = false;

    carta.appendChild(dorso);
    carta.appendChild(imagen);

    carta.onclick = function () {
      clickEnCarta(carta);
    };
    tablero.appendChild(carta);
  }
}

function actualizarMarcador() {
  document.getElementById('dato-jugador').textContent = jugador;
  document.getElementById('dato-tiempo').textContent = segundos;
  document.getElementById('dato-score').textContent = score;
}

// PARTIDITA
function nuevaPartida() {
  clearInterval(cuentaAtras);
  cuentaAtras = null;
  score = 0;
  segundos = 60;
  primera = null;
  bloqueado = false;
  parejas = 0;
  enPartida = true;

  document.getElementById('pantalla-menu').classList.remove('visible');
  document.getElementById('pantalla-tablero').classList.add('visible');
  document.getElementById('modal-final').classList.add('escondido');

  montarTablero();
  actualizarMarcador();
}

// aquí hago que el tiempo comience a bajar sólo cuando se da el primer click
function iniciarCuentaAtras() {
  cuentaAtras = setInterval(function () {
    segundos--;
    actualizarMarcador();
    if (segundos <= 0) {
      terminarPartida(false);
    }
  }, 1000);
}

function clickEnCarta(carta) {
  if (!enPartida || bloqueado) {
    return;
  }
  if (carta.classList.contains('volteada') || carta.classList.contains('resuelta')) {
    return;
  }

  if (cuentaAtras == null) {
    iniciarCuentaAtras();
  }

  carta.classList.add('volteada');

  if (primera == null) {
    primera = carta;
    return;
  }

  let segunda = carta;

  if (primera.dataset.foto == segunda.dataset.foto) {
    // acierto
    primera.classList.add('resuelta');
    segunda.classList.add('resuelta');
    score += 20;
    parejas++;
    primera = null;
    actualizarMarcador();
    if (parejas == fotos.length) {
      terminarPartida(true);
    }
  } else {
    // fallo
    score -= 10;
    actualizarMarcador();
    bloqueado = true;
    primera.classList.add('error');
    segunda.classList.add('error');

    let anterior = primera;
    setTimeout(function () {
      anterior.classList.remove('volteada', 'error');
      segunda.classList.remove('volteada', 'error');
      primera = null;
      bloqueado = false;
    }, 800);
  }
}

function terminarPartida(completado) {
  if (!enPartida) {
    return;
  }
  enPartida = false;
  clearInterval(cuentaAtras);

  let mensaje = document.getElementById('mensaje-final');
  if (completado && segundos > 0) {
    score += 40;
    mensaje.textContent = '¡Tablero completo! Te sobraron ' + segundos + ' segundos (+40 puntos)';
  } else {
    mensaje.textContent = 'Se acabó el tiempo';
  }

  actualizarMarcador();
  document.getElementById('score-final').textContent = score;
  document.getElementById('modal-final').classList.remove('escondido');

  // guardo puntuación bbdd
  fetch('/api/puntuacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jugador: jugador, score: score })
  });
}

// BOTONES
document.getElementById('btn-jugar').onclick = abrirVentanaNombre;
document.getElementById('btn-cancelar').onclick = cerrarVentanaNombre;
document.getElementById('form-nombre').onsubmit = enviarNombre;
document.getElementById('btn-repetir').onclick = nuevaPartida;
document.getElementById('btn-salir').onclick = volverAlInicio;

// cargo página y se ve top 5
volverAlInicio();

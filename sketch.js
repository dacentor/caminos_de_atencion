// Caminos de Atención - p5.js
// Versión final:
// - Máquina de estados (escenas) + historial con “Atrás” (deshace puntuación)
// - Fade entre escenas
// - Animaciones ambientales por escena (ondas, chispas, pájaros)
// - Interacción (mariposas) en escenas puntuales
// - Audio por capas: bosque/agua/calma + one-shot de entrada al claro

let escena = "1";
let calmaScore = 0;
let impulsoScore = 0;
let botones = [];

// Historial de decisiones (stack)
let historialDecisiones = []; // { from, to, dCalma, dImpulso }

// ----------------------
// Fade entre escenas
// ----------------------
let fadeAlpha = 0;
let estadoFade = "idle"; // "idle" | "fadeOut" | "fadeIn"
let escenaPendiente = null;

// ----------------------
// Layout fijo
// ----------------------
const LAYOUT = {
  canvasW: 900,
  canvasH: 600,

  marginX: 60,

  titleY: 24,
  textY: 78,

  imgTop: 140,
  imgH: 330,
  get imgCenterY() {
    return this.imgTop + this.imgH / 2;
  },

  questionY: 480,
  btnY: 505,

  btnW: 260,
  btnH: 56,
  btnGap: 18,

  singleBtnW: 220,
  singleBtnH: 48
};

// ----------------------
// Imágenes
// ----------------------
let img1_inicio;
let img1A_mariposas;
let img1B_camino;
let img2_rio;
let img2A_mika;
let img2B_puente;
let img3_claro;
let img3A_florTocar;
let img3B_florObservar;
let img4_epilogo;

// ----------------------
// Efectos visuales
// ----------------------
let mostrarMariposas = false;
let mariposas = [];

let ondas = [];
let chispas = [];

let bandada = []; // pájaros

// ----------------------
// Audio (p5.sound)
// ----------------------
let sndBosque = null;        // loop
let sndAgua = null;          // loop
let sndCalma = null;         // loop (escenas del claro)
let sndClaroEntrada = null;  // one-shot (entrada al claro)

let audioIniciado = false;      // el navegador exige interacción
let yaSonoEntradaClaro = false;  // evita repetir one-shot al volver atrás

function preload() {
  // Imágenes
  img1_inicio        = loadImage("assets/portada.png");
  img1A_mariposas    = loadImage("assets/escena1A.png");
  img1B_camino       = loadImage("assets/escena1B.png");
  img2_rio           = loadImage("assets/rio.png");
  img2A_mika         = loadImage("assets/rioA.png");
  img2B_puente       = loadImage("assets/rioB.png");
  img3_claro         = loadImage("assets/claro.png");
  img3A_florTocar    = loadImage("assets/florA.png");
  img3B_florObservar = loadImage("assets/FlorB.png"); // respeta mayúsculas/minúsculas
  img4_epilogo       = loadImage("assets/epilogo.png");

  // Audio
  // Si un archivo no está, p5 mostrará error en consola.
  // En ese caso, el sketch seguirá funcionando; simplemente esa pista quedará en null.
  try {
    sndBosque = loadSound("assets/audio/bosque.mp3");
    sndAgua = loadSound("assets/audio/agua.mp3");
    sndCalma = loadSound("assets/audio/calma.mp3");
    sndClaroEntrada = loadSound("assets/audio/claro_entrada.mp3");
  } catch (e) {
    // En entornos donde loadSound falle por configuración, no bloqueamos el sketch.
    sndBosque = sndAgua = sndCalma = sndClaroEntrada = null;
  }
}

function setup() {
  createCanvas(LAYOUT.canvasW, LAYOUT.canvasH);
  textFont("Lexend Deca");

  // Mariposas base
  for (let i = 0; i < 8; i++) mariposas.push(nuevaMariposa());

  // Ondas del río
  for (let i = 0; i < 12; i++) {
    ondas.push(nuevaOnda(
      random(LAYOUT.marginX, width - LAYOUT.marginX),
      random(LAYOUT.imgTop + LAYOUT.imgH * 0.55, LAYOUT.imgTop + LAYOUT.imgH * 0.92)
    ));
  }

  // Chispas del claro
  for (let i = 0; i < 45; i++) chispas.push(nuevaChispa());

  // Bandada de pájaros (más pájaros para reforzar presencia en escenas de vuelo)
  crearBandada(8);

  // Preparar pistas de loop (no reproducir aún)
  prepararLoop(sndBosque);
  prepararLoop(sndAgua);
  prepararLoop(sndCalma);
}

function draw() {
  background(245);
  botones = [];

  // Efectos desactivados por defecto; cada escena activa lo suyo
  mostrarMariposas = false;

  // Render escena
  switch (escena) {
    case "1":  escena1(); break;
    case "1A": escena1A(); break;
    case "1B": escena1B(); break;

    case "2":  escena2(); break;
    case "2A": escena2A(); break;
    case "2B": escena2B(); break;

    case "3":  escena3(); break;
    case "3A": escena3A(); break;
    case "3B": escena3B(); break;

    case "4":  escena4(); break;
  }

  // Efectos por escena
  dibujarEfectosDeEscena();
  dibujarMariposas();

  // Audio por escena (si ya fue iniciado por interacción)
  actualizarAudioPorEscena();

  // Fade al final
  drawFade();
}

// ======================================================
// Cambio de escena + Fade
// ======================================================

function cambiarEscena(nuevaEscena) {
  if (estadoFade !== "idle") return;

  // Bonus: one-shot al entrar al claro (escena 3) por primera vez
  // Se dispara en el momento de solicitar el cambio, no en draw, para evitar repetición.
  if (nuevaEscena === "3") {
    dispararEntradaClaroSiProcede();
  }

  escenaPendiente = nuevaEscena;
  estadoFade = "fadeOut";
}

function drawFade() {
  if (estadoFade === "fadeOut") {
    fadeAlpha += 15;
    if (fadeAlpha >= 255) {
      fadeAlpha = 255;
      escena = escenaPendiente;
      escenaPendiente = null;
      estadoFade = "fadeIn";
    }
  } else if (estadoFade === "fadeIn") {
    fadeAlpha -= 15;
    if (fadeAlpha <= 0) {
      fadeAlpha = 0;
      estadoFade = "idle";
    }
  }

  if (fadeAlpha > 0) {
    noStroke();
    fill(0, fadeAlpha);
    rect(0, 0, width, height);
  }
}

// ======================================================
// Historial / Deshacer
// ======================================================

function aplicarDecision(dCalma, dImpulso, escenaSiguiente) {
  historialDecisiones.push({
    from: escena,
    to: escenaSiguiente,
    dCalma,
    dImpulso
  });

  calmaScore += dCalma;
  impulsoScore += dImpulso;

  cambiarEscena(escenaSiguiente);
}

function deshacerUltimaDecision() {
  const ultima = historialDecisiones.pop();
  if (!ultima) return;

  calmaScore -= ultima.dCalma;
  impulsoScore -= ultima.dImpulso;

  calmaScore = Math.max(0, calmaScore);
  impulsoScore = Math.max(0, impulsoScore);

  // Volver atrás instantáneo (sensación de deshacer)
  escena = ultima.from;

  // Cancelar cualquier transición
  fadeAlpha = 0;
  estadoFade = "idle";
  escenaPendiente = null;
}

// ======================================================
// Audio
// ======================================================

function prepararLoop(snd) {
  if (!snd) return;
  snd.setLoop(true);
  snd.setVolume(0);
}

function iniciarAudioSiHaceFalta() {
  if (audioIniciado) return;

  // Requerimiento habitual del navegador (especialmente móvil)
  if (typeof userStartAudio === "function") userStartAudio();

  // Arrancar loops (silenciosos). Después, solo controlamos volumen.
  if (sndBosque && !sndBosque.isPlaying()) sndBosque.play();
  if (sndAgua && !sndAgua.isPlaying()) sndAgua.play();
  if (sndCalma && !sndCalma.isPlaying()) sndCalma.play();

  audioIniciado = true;
}

function dispararEntradaClaroSiProcede() {
  // El one-shot requiere audio iniciado (si no, se ignora hasta primer click)
  // Estrategia: si aún no está iniciado, lo dejaremos sonar en el primer click que inicie audio.
  if (yaSonoEntradaClaro) return;

  if (audioIniciado && sndClaroEntrada) {
    // Asegurar no-loop (one-shot)
    sndClaroEntrada.setLoop(false);
    sndClaroEntrada.play();
    yaSonoEntradaClaro = true;
  } else {
    // Se marca para disparar en el primer click si el usuario entra al claro antes de iniciar audio
    // y luego hace click: lo resolvemos en mousePressed.
    yaSonoEntradaClaro = "pendiente";
  }
}

function resolverEntradaClaroPendiente() {
  if (yaSonoEntradaClaro !== "pendiente") return;
  if (!audioIniciado) return;

  if (sndClaroEntrada) {
    sndClaroEntrada.setLoop(false);
    sndClaroEntrada.play();
  }
  yaSonoEntradaClaro = true;
}

/**
 * Mezcla por escena:
 * - Base: bosque
 * - Río: sube agua
 * - Claro: sube calma, baja un poco bosque
 * - Epílogo: baja todo
 */
function actualizarAudioPorEscena() {
  if (!audioIniciado) return;

  let vBosque = 0.18;
  let vAgua = 0.00;
  let vCalma = 0.00;

  if (escena === "2" || escena === "2A" || escena === "2B") {
    vBosque = 0.12;
    vAgua = 0.22;
    vCalma = 0.00;
  } else if (escena === "3" || escena === "3A" || escena === "3B") {
    vBosque = 0.12;
    vAgua = 0.02;
    vCalma = 0.18;
  } else if (escena === "4") {
    vBosque = 0.10;
    vAgua = 0.00;
    vCalma = 0.00;
  }

  // Modulación muy sutil por calma
  const total = calmaScore + impulsoScore;
  const calmaRatio = total > 0 ? (calmaScore / total) : 0.5;
  vCalma *= lerp(0.90, 1.10, calmaRatio);

  if (sndBosque) sndBosque.setVolume(vBosque, 0.8);
  if (sndAgua)   sndAgua.setVolume(vAgua, 0.8);
  if (sndCalma)  sndCalma.setVolume(vCalma, 0.8);
}

// ======================================================
// Efectos ambientales por escena
// ======================================================

function dibujarEfectosDeEscena() {
  if (escena === "2" || escena === "2A" || escena === "2B") {
    dibujarOndasRio();
  }

  if (escena === "3" || escena === "3A" || escena === "3B") {
    dibujarChispasCalma();
  }

  if (escena === "1B" || escena === "2" || escena === "2A" || escena === "3") {
    dibujarBandada();
  }
}

// ----------------------
// Ondas del río
// ----------------------

function nuevaOnda(x, y) {
  return { x, y, r: random(6, 20), vr: random(0.35, 0.85), a: random(30, 90) };
}

function dibujarOndasRio() {
  const top = LAYOUT.imgTop + LAYOUT.imgH * 0.55;
  const bottom = LAYOUT.imgTop + LAYOUT.imgH * 0.92;

  noFill();
  strokeWeight(2);

  for (let o of ondas) {
    o.r += o.vr;
    o.a -= 0.45;

    stroke(255, 255, 255, o.a);
    ellipse(o.x, o.y, o.r * 2, o.r * 1.2);

    if (o.a <= 5 || o.r > 65) {
      o.x = random(LAYOUT.marginX, width - LAYOUT.marginX);
      o.y = random(top, bottom);
      o.r = random(6, 18);
      o.vr = random(0.35, 0.85);
      o.a = random(30, 90);
    }
  }

  noStroke();
}

// ----------------------
// Chispas de calma
// ----------------------

function nuevaChispa() {
  return {
    x: random(width * 0.35, width * 0.65),
    y: random(LAYOUT.imgTop + 40, LAYOUT.imgTop + LAYOUT.imgH - 40),
    r: random(1.4, 3.2),
    vy: random(0.2, 0.6),
    a: random(35, 115),
    fase: random(TWO_PI)
  };
}

function dibujarChispasCalma() {
  const total = calmaScore + impulsoScore;
  const calmaRatio = total > 0 ? (calmaScore / total) : 0.5;

  const auraAlpha = lerp(10, 26, calmaRatio);
  noStroke();
  fill(255, 255, 255, auraAlpha);
  ellipse(width / 2, LAYOUT.imgCenterY, width * 0.55, LAYOUT.imgH * 0.75);

  const alphaBoost = lerp(0, 25, calmaRatio);
  const sway = lerp(0.25, 0.45, calmaRatio);

  for (let c of chispas) {
    c.y -= c.vy;
    c.x += sin(frameCount * 0.02 + c.fase) * sway;

    fill(255, 255, 255, Math.min(160, c.a + alphaBoost));
    ellipse(c.x, c.y, c.r * 2, c.r * 2);

    if (c.y < LAYOUT.imgTop + 20) {
      c.x = random(width * 0.35, width * 0.65);
      c.y = LAYOUT.imgTop + LAYOUT.imgH - 20;
      c.r = random(1.4, 3.2);
      c.vy = random(0.2, 0.6);
      c.a = random(35, 115);
      c.fase = random(TWO_PI);
    }
  }
}

// ----------------------
// Pájaros (bandada)
// ----------------------

function crearBandada(n) {
  bandada = [];
  for (let i = 0; i < n; i++) bandada.push(nuevoPajaro(i === 0));
}

function nuevoPajaro(principal) {
  return {
    x: random(LAYOUT.marginX - 140, LAYOUT.marginX - 20),
    baseY: random(LAYOUT.imgTop + 35, LAYOUT.imgTop + 110),
    vx: principal ? random(1.15, 1.55) : random(0.95, 1.45),
    fase: random(TWO_PI),
    size: principal ? 1.25 : random(0.85, 1.15),
    offsetX: random(0, 300)
  };
}

function dibujarBandada() {
  const total = calmaScore + impulsoScore;
  const calmaRatio = total > 0 ? (calmaScore / total) : 0.5;
  const flapAmp = lerp(4.6, 3.0, calmaRatio);

  stroke(30, 30, 30, 155);
  strokeWeight(3);
  noFill();

  for (let p of bandada) {
    p.x += p.vx;

    const x = p.x - p.offsetX;
    const y = p.baseY + sin(frameCount * 0.02 + p.fase) * 14;

    if (x > width - LAYOUT.marginX + 40) {
      p.x = LAYOUT.marginX - 60 + p.offsetX;
      p.baseY = random(LAYOUT.imgTop + 35, LAYOUT.imgTop + 110);
      p.vx = random(0.95, 1.55);
      p.fase = random(TWO_PI);
      p.offsetX = random(0, 300);
    }

    const flap = sin(frameCount * 0.25 + p.fase) * flapAmp;
    const s = 10 * p.size;

    beginShape();
    vertex(x - s, y);
    vertex(x, y + flap);
    vertex(x + s, y);
    endShape();
  }

  noStroke();
}

// ======================================================
// Mariposas (interacción en 1A y 2A)
// ======================================================

function nuevaMariposa() {
  return {
    x: random(LAYOUT.marginX, width - LAYOUT.marginX),
    y: random(LAYOUT.imgTop, LAYOUT.imgTop + LAYOUT.imgH),
    offset: random(TWO_PI),
    seed: random(1000),
    k: random(0.010, 0.020)
  };
}

function dibujarMariposas() {
  if (!mostrarMariposas) return;

  const left = LAYOUT.marginX;
  const right = width - LAYOUT.marginX;
  const top = LAYOUT.imgTop;
  const bottom = LAYOUT.imgTop + LAYOUT.imgH;

  const total = calmaScore + impulsoScore;
  const impulsoRatio = total > 0 ? (impulsoScore / total) : 0.5;

  const speedBoost = lerp(1.0, 1.6, impulsoRatio);
  const extraCount = Math.floor(lerp(0, 4, impulsoRatio));

  while (mariposas.length < 8 + extraCount) mariposas.push(nuevaMariposa());

  const drawCount = 8 + extraCount;

  for (let i = 0; i < drawCount; i++) {
    const m = mariposas[i];

    const dx = mouseX - m.x;
    const dy = mouseY - m.y;

    const driftX = (noise(m.seed, frameCount * 0.01) - 0.5) * 0.9;
    const driftY = (noise(m.seed + 50, frameCount * 0.01) - 0.5) * 0.9;

    m.x += dx * m.k * speedBoost + driftX;
    m.y += dy * m.k * speedBoost + driftY;

    const aleteo = sin(frameCount * 0.3 + m.offset) * 6;

    m.x = constrain(m.x, left, right);
    m.y = constrain(m.y, top, bottom);

    push();
    translate(m.x, m.y);
    noStroke();
    fill(255, 170, 220, 200);
    ellipse(-6, 0, 12 + aleteo, 16);
    ellipse(6, 0, 12 + aleteo, 16);
    pop();
  }
}

// ======================================================
// Escenas (texto original intacto)
// ======================================================

function escena1() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna inicia su camino con Kiro y Mika hacia el Bosque de las Mil Distracciones.\n" +
    "Todo es color, movimiento y estímulos alrededor."
  );

  dibujarImagen(img1_inicio);
  pregunta("¿Qué hace Luna?");

  const { xA, xB } = posicionesBotonesAB();

  crearBoton(
    xA, LAYOUT.btnY, LAYOUT.btnW, LAYOUT.btnH,
    "A. Se distrae con las mariposas",
    () => aplicarDecision(0, 1, "1A")
  );

  crearBoton(
    xB, LAYOUT.btnY, LAYOUT.btnW, LAYOUT.btnH,
    "B. Respira y sigue el camino",
    () => aplicarDecision(1, 0, "1B")
  );
}

function escena1A() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna se deja llevar por las mariposas junto a Mika.\n" +
    "Kiro la espera en el camino, paciente."
  );

  dibujarImagen(img1A_mariposas);

  mostrarMariposas = true;

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Seguir adelante",
    () => cambiarEscena("2")
  );

  botonAtras();
}

function escena1B() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna respira hondo y decide seguir el camino con Kiro.\n" +
    "Mika los acompaña desde el aire."
  );

  dibujarImagen(img1B_camino);

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Seguir adelante",
    () => cambiarEscena("2")
  );

  botonAtras();
}

function escena2() {
  titulo("El puente de ramas");
  textoCentrado(
    "Llegan a un río que corta el paso.\n" +
    "Kiro empieza a construir un puente. Mika llama a Luna hacia algo brillante."
  );

  dibujarImagen(img2_rio);
  pregunta("¿Qué hace Luna?");

  const { xA, xB } = posicionesBotonesAB();

  crearBoton(
    xA, LAYOUT.btnY, LAYOUT.btnW, LAYOUT.btnH,
    "A. Sigue a Mika",
    () => aplicarDecision(0, 1, "2A")
  );

  crearBoton(
    xB, LAYOUT.btnY, LAYOUT.btnW, LAYOUT.btnH,
    "B. Ayuda a Kiro con el puente",
    () => aplicarDecision(1, 0, "2B")
  );

  botonAtras();
}

function escena2A() {
  titulo("El puente de ramas");
  textoCentrado(
    "Luna sigue a Mika un momento, descubre la belleza del bosque\n" +
    "y regresa para cruzar el puente."
  );

  dibujarImagen(img2A_mika);

  mostrarMariposas = true;

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Continuar al claro",
    () => cambiarEscena("3")
  );

  botonAtras();
}

function escena2B() {
  titulo("El puente de ramas");
  textoCentrado(
    "Luna ayuda a Kiro. Juntos terminan el puente\n" +
    "y cruzan con calma al otro lado."
  );

  dibujarImagen(img2B_puente);

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Continuar al claro",
    () => cambiarEscena("3")
  );

  botonAtras();
}

function escena3() {
  titulo("El claro de la calma");
  textoCentrado(
    "En el claro aparece la Flor de la Calma,\n" +
    "brillando suavemente frente a Luna, Kiro y Mika."
  );

  dibujarImagen(img3_claro);
  pregunta("¿Qué hace Luna?");

  const { xA, xB } = posicionesBotonesAB();

  crearBoton(
    xA, LAYOUT.btnY, LAYOUT.btnW, LAYOUT.btnH,
    "A. Abrazar la flor",
    () => aplicarDecision(1, 0, "3A")
  );

  crearBoton(
    xB, LAYOUT.btnY, LAYOUT.btnW, LAYOUT.btnH,
    "B. Sentarse y observarla",
    () => aplicarDecision(1, 0, "3B")
  );

  botonAtras();
}

function escena3A() {
  titulo("El claro de la calma");
  textoCentrado(
    "Luna abraza la flor luminosa.\n" +
    "Siente la calma muy cerca, como un calor suave en el pecho."
  );

  dibujarImagen(img3A_florTocar);

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Epílogo",
    () => cambiarEscena("4")
  );

  botonAtras();
}

function escena3B() {
  titulo("El claro de la calma");
  textoCentrado(
    "Luna se sienta junto a Kiro y Mika.\n" +
    "Observan la flor brillar en silencio."
  );

  dibujarImagen(img3B_florObservar);

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Epílogo",
    () => cambiarEscena("4")
  );

  botonAtras();
}

function escena4() {
  const total = calmaScore + impulsoScore;
  const calmaRatio = total > 0 ? calmaScore / total : 0.5;

  titulo("Epílogo: El rastro del bosque");

  fill(40);
  textAlign(CENTER, TOP);
  textSize(16);
  textLeading(22);

  const base =
    "Luna regresa con Kiro y Mika.\n" +
    "El bosque guarda el recuerdo de sus elecciones.";
  text(base, width / 2, 88);

  textSize(14);
  textLeading(20);

  if (calmaRatio > 0.6) {
    text(
      "Hoy ha encontrado muchas formas de estar tranquila.\n" +
      "Sabe que puede elegir la calma cuando lo necesita.",
      width / 2, 150
    );
  } else if (calmaRatio < 0.4) {
    text(
      "Su viaje ha tenido muchas distracciones y descubrimientos.\n" +
      "Ha aprendido que también puede parar y escucharse.",
      width / 2, 150
    );
  } else {
    text(
      "Ha mezclado vuelo y calma.\n" +
      "Entiende que cada elección le enseña algo sobre sí misma.",
      width / 2, 150
    );
  }

  dibujarImagen(img4_epilogo);

  crearBoton(
    width / 2 - LAYOUT.singleBtnW / 2, LAYOUT.btnY,
    LAYOUT.singleBtnW, LAYOUT.singleBtnH,
    "Volver a empezar",
    () => resetJuego()
  );
}

// ======================================================
// UI / Utilidades
// ======================================================

function resetJuego() {
  escena = "1";
  calmaScore = 0;
  impulsoScore = 0;
  historialDecisiones = [];

  fadeAlpha = 0;
  estadoFade = "idle";
  escenaPendiente = null;

  // Permitir que el one-shot vuelva a sonar en una nueva partida
  yaSonoEntradaClaro = false;

  // Opcional: regenerar bandada para variar el vuelo
  crearBandada(8);
}

function titulo(t) {
  fill(20);
  textAlign(CENTER, TOP);
  textSize(28);
  text(t, width / 2, LAYOUT.titleY);
}

function textoCentrado(t) {
  fill(55);
  textAlign(CENTER, TOP);
  textSize(16);
  textLeading(22);
  text(t, width / 2, LAYOUT.textY);
}

function pregunta(t) {
  fill(40);
  textAlign(CENTER, TOP);
  textSize(16);
  text(t, width / 2, LAYOUT.questionY);
}

function dibujarImagen(img) {
  if (!img) return;

  const w = width - LAYOUT.marginX * 2;
  const h = LAYOUT.imgH;

  imageMode(CENTER);
  const escala = Math.min(w / img.width, h / img.height);
  const drawW = img.width * escala;
  const drawH = img.height * escala;

  // Respiración sutil (no altera brillo)
  const respiracion = sin(frameCount * 0.01) * 4;

  image(img, width / 2, LAYOUT.imgCenterY + respiracion, drawW, drawH);
}

function posicionesBotonesAB() {
  const totalW = LAYOUT.btnW * 2 + LAYOUT.btnGap;
  const startX = width / 2 - totalW / 2;
  return { xA: startX, xB: startX + LAYOUT.btnW + LAYOUT.btnGap };
}

function botonAtras() {
  if (historialDecisiones.length === 0) return;

  crearBoton(20, 20, 104, 36, "Atrás", () => deshacerUltimaDecision());
}

function crearBoton(x, y, w, h, label, accion) {
  const dentro =
    mouseX > x && mouseX < x + w &&
    mouseY > y && mouseY < y + h;

  const pulso = dentro ? sin(frameCount * 0.2) * 2 : 0;

  rectMode(CORNER);
  noStroke();
  fill(dentro ? color(55, 135, 215) : color(75, 159, 227));
  rect(x - pulso, y - pulso, w + pulso * 2, h + pulso * 2, 16);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(label, x + w / 2, y + h / 2);

  // Hit-test con caja original (sin pulso)
  botones.push({ x, y, w, h, accion });
}

function mousePressed() {
  // Iniciar audio al primer click del usuario
  iniciarAudioSiHaceFalta();

  // Si la entrada al claro quedó pendiente por no haber audio iniciado, resolverla aquí
  resolverEntradaClaroPendiente();

  // Evitar clicks durante transición
  if (estadoFade !== "idle") return;

  for (const b of botones) {
    if (
      mouseX > b.x && mouseX < b.x + b.w &&
      mouseY > b.y && mouseY < b.y + b.h
    ) {
      b.accion();
      break;
    }
  }
}
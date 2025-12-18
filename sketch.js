// Caminos de Atención - p5.js
// Layout consistente + Lexend Deca
// + Historial "Atrás" automático
// + Atmósfera visual (fade, respiración, calma visible)

let escena = "1";
let calmaScore = 0;
let impulsoScore = 0;
let botones = [];

// ----------------------
// Fade entre escenas
// ----------------------
let fadeAlpha = 0;
let estadoFade = "idle"; // "fadeOut", "fadeIn"
let escenaPendiente = null;

// ----------------------
// Historial de decisiones
// ----------------------
let historialDecisiones = [];

// ----------------------
// Layout
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

function preload() {
  img1_inicio        = loadImage("assets/portada.png");
  img1A_mariposas    = loadImage("assets/escena1A.png");
  img1B_camino       = loadImage("assets/escena1B.png");
  img2_rio           = loadImage("assets/rio.png");
  img2A_mika         = loadImage("assets/rioA.png");
  img2B_puente       = loadImage("assets/rioB.png");
  img3_claro         = loadImage("assets/claro.png");
  img3A_florTocar    = loadImage("assets/florA.png");
  img3B_florObservar = loadImage("assets/FlorB.png");
  img4_epilogo       = loadImage("assets/epilogo.png");
}

function setup() {
  createCanvas(LAYOUT.canvasW, LAYOUT.canvasH);
  textFont("Lexend Deca");
}

function draw() {
  background(245);
  botones = [];

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

  drawFade();
}

// ======================================================
// FADE
// ======================================================
function cambiarEscena(nuevaEscena) {
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
  }

  if (estadoFade === "fadeIn") {
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
// HISTORIAL
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
  escena = ultima.from;
}

// ======================================================
// ESCENA 1
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

// ======================================================
// ESCENA 2
// ======================================================
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

// ======================================================
// ESCENA 3
// ======================================================
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

// ======================================================
// EPÍLOGO
// ======================================================
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
    resetJuego
  );
}

// ======================================================
// UI
// ======================================================
function resetJuego() {
  escena = "1";
  calmaScore = 0;
  impulsoScore = 0;
  historialDecisiones = [];
  fadeAlpha = 0;
  estadoFade = "idle";
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

  const total = calmaScore + impulsoScore;
  const calmaRatio = total > 0 ? calmaScore / total : 0.5;
  const brillo = lerp(180, 255, calmaRatio);
  tint(brillo);

  const respiracion = sin(frameCount * 0.01) * 4;

  image(img, width / 2, LAYOUT.imgCenterY + respiracion, drawW, drawH);
  noTint();
}

function posicionesBotonesAB() {
  const totalW = LAYOUT.btnW * 2 + LAYOUT.btnGap;
  const startX = width / 2 - totalW / 2;
  return {
    xA: startX,
    xB: startX + LAYOUT.btnW + LAYOUT.btnGap
  };
}

function botonAtras() {
  if (historialDecisiones.length === 0) return;
  crearBoton(20, 20, 104, 36, "Atrás", deshacerUltimaDecision);
}

function crearBoton(x, y, w, h, label, accion) {
  const dentro =
    mouseX > x && mouseX < x + w &&
    mouseY > y && mouseY < y + h;

  const pulso = dentro ? sin(frameCount * 0.2) * 2 : 0;

  noStroke();
  fill(dentro ? color(55, 135, 215) : color(75, 159, 227));
  rect(
    x - pulso,
    y - pulso,
    w + pulso * 2,
    h + pulso * 2,
    18
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(label, x + w / 2, y + h / 2);

  botones.push({ x, y, w, h, accion });
}

function mousePressed() {
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
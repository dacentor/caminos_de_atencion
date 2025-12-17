// "Caminos de Atención" - Versión Luna, Kiro, Mika
// p5.js

let escena = "1"; // 1, 1A, 1B, 2, 2A, 2B, 3, 3A, 3B, 4
let calmaScore = 0;
let impulsoScore = 0;
let botones = [];

// Historial para deshacer decisiones (Opción 2)
let historialDecisiones = []; // { from, to, dCalma, dImpulso }

// Imágenes
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
  img3B_florObservar = loadImage("assets/FlorB.png"); // IMPORTANTE: F mayúscula
  img4_epilogo       = loadImage("assets/epilogo.png");
}

function setup() {
  createCanvas(900, 600);
  textFont("sans-serif");
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

  // Debug opcional:
  // fill(120); textSize(10); textAlign(LEFT, BOTTOM);
  // text(`Escena: ${escena}  Calma: ${calmaScore}  Impulso: ${impulsoScore}  Hist: ${historialDecisiones.length}`, 10, height - 10);
}

// ======================================================
// HISTORIAL / DESHACER
// ======================================================

function aplicarDecision(dCalma, dImpulso, escenaSiguiente) {
  // Guarda la decisión ANTES de cambiar de escena
  historialDecisiones.push({
    from: escena,
    to: escenaSiguiente,
    dCalma,
    dImpulso
  });

  calmaScore += dCalma;
  impulsoScore += dImpulso;
  escena = escenaSiguiente;
}

function deshacerUltimaDecision(escenaAnterior) {
  const ultima = historialDecisiones.pop();
  if (ultima) {
    calmaScore -= ultima.dCalma;
    impulsoScore -= ultima.dImpulso;

    // Seguridad ante desajustes
    calmaScore = Math.max(0, calmaScore);
    impulsoScore = Math.max(0, impulsoScore);
  }
  escena = escenaAnterior;
}

// ============= ESCENA 1: DECISIÓN =============

function escena1() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna inicia su camino con Kiro y Mika hacia el Bosque de las Mil Distracciones.\n" +
    "Todo es color, movimiento y estímulos alrededor."
  );

  dibujarImagen(img1_inicio);

  textSize(16);
  fill(40);
  textAlign(CENTER, TOP);
  text("¿Qué hace Luna?", width / 2, 330);

  crearBoton(
    width/2 - 230, 370, 220, 55,
    "A. Se distrae con las mariposas",
    () => aplicarDecision(0, 1, "1A")
  );

  crearBoton(
    width/2 + 10, 370, 220, 55,
    "B. Respira y sigue el camino",
    () => aplicarDecision(1, 0, "1B"),
    "secundario"
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
    width/2 - 80, 500, 160, 45,
    "Seguir adelante",
    () => { escena = "2"; }
  );
}

function escena1B() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna respira hondo y decide seguir el camino con Kiro.\n" +
    "Mika los acompaña desde el aire."
  );

  dibujarImagen(img1B_camino);

  crearBoton(
    width/2 - 80, 500, 160, 45,
    "Seguir adelante",
    () => { escena = "2"; }
  );
}

// ============= ESCENA 2: RÍO =============

function escena2() {
  titulo("El puente de ramas");
  textoCentrado(
    "Llegan a un río que corta el paso.\n" +
    "Kiro empieza a construir un puente. Mika llama a Luna hacia algo brillante."
  );

  dibujarImagen(img2_rio);

  textSize(16);
  fill(40);
  textAlign(CENTER, TOP);
  text("¿Qué hace Luna?", width / 2, 330);

  crearBoton(
    width/2 - 230, 370, 220, 55,
    "A. Sigue a Mika",
    () => aplicarDecision(0, 1, "2A")
  );

  crearBoton(
    width/2 + 10, 370, 220, 55,
    "B. Ayuda a Kiro con el puente",
    () => aplicarDecision(1, 0, "2B"),
    "secundario"
  );

  botonBackDesde2();
}

function escena2A() {
  titulo("El puente de ramas");
  textoCentrado(
    "Luna sigue a Mika un momento, descubre la belleza del bosque\n" +
    "y regresa para cruzar el puente."
  );

  dibujarImagen(img2A_mika);

  crearBoton(
    width/2 - 80, 500, 160, 45,
    "Continuar al claro",
    () => { escena = "3"; }
  );
}

function escena2B() {
  titulo("El puente de ramas");
  textoCentrado(
    "Luna ayuda a Kiro. Juntos terminan el puente\n" +
    "y cruzan con calma al otro lado."
  );

  dibujarImagen(img2B_puente);

  crearBoton(
    width/2 - 80, 500, 160, 45,
    "Continuar al claro",
    () => { escena = "3"; }
  );
}

// ============= ESCENA 3: FLOR =============

function escena3() {
  titulo("El claro de la calma");
  textoCentrado(
    "En el claro aparece la Flor de la Calma,\n" +
    "brillando suavemente frente a Luna, Kiro y Mika."
  );

  dibujarImagen(img3_claro);

  textSize(16);
  fill(40);
  textAlign(CENTER, TOP);
  text("¿Qué hace Luna?", width / 2, 330);

  crearBoton(
    width/2 - 230, 370, 220, 55,
    "A. Abrazar la flor",
    () => aplicarDecision(1, 0, "3A")
  );

  crearBoton(
    width/2 + 10, 370, 220, 55,
    "B. Sentarse y observarla",
    () => aplicarDecision(1, 0, "3B"),
    "secundario"
  );

  botonBackDesde3();
}

function escena3A() {
  titulo("El claro de la calma");
  textoCentrado(
    "Luna abraza la flor luminosa.\n" +
    "Siente la calma muy cerca, como un calor suave en el pecho."
  );

  dibujarImagen(img3A_florTocar);

  crearBoton(
    width/2 - 80, 500, 160, 45,
    "Epílogo",
    () => { escena = "4"; }
  );
}

function escena3B() {
  titulo("El claro de la calma");
  textoCentrado(
    "Luna se sienta junto a Kiro y Mika.\n" +
    "Observan la flor brillar en silencio."
  );

  dibujarImagen(img3B_florObservar);

  crearBoton(
    width/2 - 80, 500, 160, 45,
    "Epílogo",
    () => { escena = "4"; }
  );
}

// ============= ESCENA 4: EPÍLOGO =============

function escena4() {
  const total = calmaScore + impulsoScore;
  const calmaRatio = total > 0 ? calmaScore / total : 0.5;

  background(245);
  titulo("Epílogo: El rastro del bosque");

  fill(40);
  textAlign(CENTER, TOP);
  textSize(16);

  const base =
    "Luna regresa con Kiro y Mika.\n" +
    "El bosque guarda el recuerdo de sus elecciones.";
  text(base, width / 2, 90);

  textSize(14);
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
    width/2 - 90, 500, 180, 45,
    "Volver a empezar",
    () => {
      escena = "1";
      calmaScore = 0;
      impulsoScore = 0;
      historialDecisiones = [];
    }
  );
}

// ============= UTILIDADES =============

function titulo(t) {
  fill(20);
  textAlign(CENTER, TOP);
  textSize(26);
  text(t, width / 2, 30);
}

function textoCentrado(t) {
  fill(40);
  textAlign(CENTER, TOP);
  textSize(16);
  text(t, width / 2, 80);
}

function dibujarImagen(img) {
  if (!img) return;
  const margenX = 60;
  const w = width - margenX * 2;
  const h = 260;

  imageMode(CENTER);
  const escala = Math.min(w / img.width, h / img.height);
  const drawW = img.width * escala;
  const drawH = img.height * escala;
  image(img, width / 2, 260, drawW, drawH);
}

function crearBoton(x, y, w, h, label, accion, estilo) {
  const dentro =
    mouseX > x && mouseX < x + w &&
    mouseY > y && mouseY < y + h;

  if (estilo === "secundario") {
    fill(dentro ? 220 : 235);
    stroke(210);
  } else {
    noStroke();
    fill(dentro ? color(60, 140, 220) : color(75, 159, 227));
  }

  rectMode(CORNER);
  rect(x, y, w, h, 22);

  fill(estilo === "secundario" ? 40 : 255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(label, x + w / 2, y + h / 2);

  botones.push({ x, y, w, h, accion });
}

function botonBackDesde2() {
  crearBoton(
    20, 20, 90, 32,
    "Atrás",
    () => deshacerUltimaDecision("1"),
    "secundario"
  );
}

function botonBackDesde3() {
  crearBoton(
    20, 20, 90, 32,
    "Atrás",
    () => deshacerUltimaDecision("2"),
    "secundario"
  );
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
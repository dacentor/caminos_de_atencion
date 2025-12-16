// "Caminos de Atención" - Luna, Kiro, Mika
// p5.js

let escena = "1";
let botones = [];
let calmaScore = 0;
let impulsoScore = 0;

// Imágenes escena 1
let img_portada, img_escena1A, img_escena1B;
// Epílogo (aún simple)
let img_epilogo;

function preload() {
  img_portada = loadImage("assets/portada.png");
  img_escena1A = loadImage("assets/escena1A.png");
  img_escena1B = loadImage("assets/escena1B.png");
  img_epilogo = loadImage("assets/epilogo.png");
}

function setup() {
  createCanvas(900, 600);
  textFont("sans-serif");
}

function draw() {
  background(245);
  botones = [];

  switch (escena) {
    case "1": escena1(); break;
    case "1A": escena1A(); break;
    case "1B": escena1B(); break;
    case "4": escena4(); break;
  }
}

function mousePressed() {
  for (let b of botones) {
    if (
      mouseX > b.x && mouseX < b.x + b.w &&
      mouseY > b.y && mouseY < b.y + b.h
    ) {
      b.accion();
      break;
    }
  }
}

// ---- Helpers UI ----
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
  image(img, width / 2, 260, img.width * escala, img.height * escala);
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

// ---- Escenas 1 ----
function escena1() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna inicia su camino con Kiro y Mika.\n" +
    "Todo es color, movimiento y estímulos alrededor."
  );
  dibujarImagen(img_portada);

  fill(40);
  textAlign(CENTER, TOP);
  textSize(16);
  text("¿Qué hace Luna?", width / 2, 330);

  crearBoton(
    width/2 - 230, 370, 220, 55,
    "A. Se distrae con las mariposas",
    () => { impulsoScore++; escena = "1A"; }
  );

  crearBoton(
    width/2 + 10, 370, 220, 55,
    "B. Respira y sigue el camino",
    () => { calmaScore++; escena = "1B"; },
    "secundario"
  );
}

function escena1A() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna se deja llevar por las mariposas junto a Mika.\n" +
    "Kiro la espera en el camino, paciente."
  );
  dibujarImagen(img_escena1A);

  crearBoton(width/2 - 80, 500, 160, 45, "Ir al epílogo", () => {
    escena = "4";
  });
}

function escena1B() {
  titulo("El comienzo del viaje");
  textoCentrado(
    "Luna respira hondo y decide seguir el camino con Kiro.\n" +
    "Mika los acompaña desde el aire."
  );
  dibujarImagen(img_escena1B);

  crearBoton(width/2 - 80, 500, 160, 45, "Ir al epílogo", () => {
    escena = "4";
  });
}

// ---- Epílogo (temporal) ----
function escena4() {
  titulo("Epílogo");
  textoCentrado(
    `Calma: ${calmaScore}  Impulso: ${impulsoScore}\n` +
    "En el siguiente commit lo convertimos en final narrativo."
  );
  dibujarImagen(img_epilogo);

  crearBoton(width/2 - 90, 500, 180, 45, "Volver a empezar", () => {
    escena = "1";
    calmaScore = 0;
    impulsoScore = 0;
  });
}
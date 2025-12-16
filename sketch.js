// "Caminos de Atención" - Luna, Kiro, Mika
// p5.js

let escena = "1"; // 1 y 4 por ahora 
let botones = [];

// Imágenes (por ahora solo portada y epílogo)
let img_portada;
let img_epilogo;

function preload() {
  img_portada = loadImage("assets/portada.png");
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
    case "1":
      escena1();
      break;
    case "4":
      escena4();
      break;
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

// ---- Escenas ----
function escena1() {
  titulo("El comienzo del viaje");
  textoCentrado("Ahora ya cargamos imágenes.");
  dibujarImagen(img_portada);

  crearBoton(width / 2 - 90, 500, 180, 45, "Ir al epílogo", () => {
    escena = "4";
  });
}

function escena4() {
  titulo("Epílogo");
  textoCentrado("Imagen final cargada.");
  dibujarImagen(img_epilogo);

  crearBoton(width / 2 - 90, 500, 180, 45, "Volver", () => {
    escena = "1";
  }, "secundario");
}
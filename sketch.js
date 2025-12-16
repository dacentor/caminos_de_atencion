// "Caminos de Atención" - Luna, Kiro, Mika
// p5.js

let escena = "1"; // "1" y "4" por ahora

function setup() {
  createCanvas(900, 600);
  textFont("sans-serif");
}

function draw() {
  background(245);

  switch (escena) {
    case "1":
      escena1();
      break;
    case "4":
      escena4();
      break;
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

// ---- Escenas ----
function escena1() {
  titulo("El comienzo del viaje");
  textoCentrado("Aquí inicia la historia.\n(Aún sin imágenes ni botones)");
}

function escena4() {
  titulo("Epílogo");
  textoCentrado("Fin provisional.\n(Aún sin lógica de puntuación)");
}
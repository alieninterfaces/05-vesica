const showControls = false;
const showHelpers = false;

const lights = [
  {
    type: "directional",
    color: 0xffffff,
    intensity: 0.5,
    distance: 1000,
    position: { x: 4, y: 4, z: 5 },
    target: { x: 3, y: 2, z: 5 },
  },
  {
    type: "directional",
    color: 0xffffff,
    intensity: 3,
    distance: 1000,
    position: { x: 0, y: 2, z: 0 },
    target: { x: 0, y: -4, z: 5 },
  },
];

const circles = [
  {
    speed: 0.021,
    radius: 0.8,
    color: 0xff6622,
    position: { x: 4, y: 2, z: 9 },
  },
  {
    speed: 0.015,
    radius: 0.5,
    color: 0xff9900,
    position: { x: 4, y: 2, z: 10.5 },
  },
  {
    speed: 0.022,
    radius: 0.7,
    color: 0xff7700,
    position: { x: 2, y: -1, z: 3.5 },
  },
  {
    speed: 0.02,
    radius: 0.8,
    color: 0xee5522,
    position: { x: 2, y: 4, z: 4 },
  },
  {
    speed: 0.005,
    radius: 2.5,
    color: 0x33eeff,
    position: { x: -2, y: 2, z: 9 },
  },
  {
    speed: 0.01,
    radius: 0.8,
    color: 0x5a00ff,
    position: { x: 5, y: -1, z: 9 },
  },
];

const gui = new dat.GUI({
  autoPlace: false,
  name: "Controls",
});

if (!showControls) {
  gui.hide();
}

gui.domElement.id = "gui";
document.body.appendChild(gui.domElement);

//add a lights folder
const lightsFolder = gui.addFolder("Lights");

for (let i = 0; i < lights.length; i++) {
  addLight(i);
}

function addLight(i) {
  const folder = lightsFolder.addFolder(`Light ${i}`);
  folder.addColor(lights[i], "color").name("Color");
  folder.add(lights[i], "intensity", 0, 2).name("Intensity");
  folder.add(lights[i], "distance", 0, 100).name("Distance");
  folder.add(lights[i].position, "x", -10, 10).name("X");
  folder.add(lights[i].position, "y", -10, 10).name("Y");
  folder.add(lights[i].position, "z", -10, 10).name("Z");
  folder.add(lights[i].target, "x", -10, 10).name("TX");
  folder.add(lights[i].target, "y", -10, 10).name("TY");
  folder.add(lights[i].target, "z", -10, 10).name("TZ");
}

//add sphere folder
const sphereFolder = gui.addFolder("Sphere");

for (let i = 0; i < circles.length; i++) {
  addSphere(i);
}

function addSphere(i) {
  const folder = sphereFolder.addFolder(`Sphere ${i}`);
  folder.add(circles[i], "speed", 0, 0.1).name("Speed");
  folder.add(circles[i], "radius", 0, 10).name("Radius");
  folder.addColor(circles[i], "color").name("Color");
  folder.add(circles[i].position, "x", -10, 10).name("X");
  folder.add(circles[i].position, "y", -10, 10).name("Y");
  folder.add(circles[i].position, "z", -10, 10).name("Z");
}

const button = {
  addSphere: function () {
    circles.push({
      speed: 0.01,
      radius: 0.8,
      color: 0x00ff00,
      position: { x: 0, y: 0, z: 0 },
    });
    addSphere(circles.length - 1);
  },

  addLight: function () {
    lights.push({
      type: "directional",
      color: 0xffffff,
      intensity: 1,
      distance: 0,
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
    });
    addLight(lights.length - 1);
  },
};

gui.add(button, "addSphere").name("Add Sphere");
gui.add(button, "addLight").name("Add Light");

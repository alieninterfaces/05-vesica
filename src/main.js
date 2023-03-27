import * as THREE from "three";

const width = 300;
const height = 500;
const canvasScale = window.devicePixelRatio;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x142641, 10, 30);

const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
camera.position.x = 22;
camera.position.z = -5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width * canvasScale, height * canvasScale);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMapSoft = true;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

//LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const skyLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
skyLight.position.set(0, -1, 4);
scene.add(skyLight);

const skyLight2 = new THREE.HemisphereLight(0xffffff, 0xff0000, 1.2);
skyLight2.position.set(0, -1, 4);
scene.add(skyLight2);

//WAVY THING
const shape = new THREE.Shape();
let r = 1;
let num = 100;
for (let i = 0; i < num; i++) {
  r = i % 2 === 0 ? 1 : 0.5;
  const angle = (i * 2 * Math.PI) / num;
  const x = r * Math.cos(angle) * r;
  const y = r * Math.sin(angle) * r;
  if (i === 0) {
    shape.moveTo(x, y);
  } else {
    shape.lineTo(x, y);
  }
}

const extrudeSettings = {
  steps: 160,
  depth: 20,
  bevelEnabled: false,
  bevelThickness: 1,
  bevelSize: 1,
  bevelSegments: 1,
  extrudePath: new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 5),
    new THREE.Vector3(0, -1, 7),
    new THREE.Vector3(0, 0, 15),
    new THREE.Vector3(0, 0, 20),
  ]),
};

const texture = new THREE.TextureLoader().load("textures/texture.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(0.1, 0.1);

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: -2,
  roughness: 0,
  clearcoat: 0,
  shininess: 0,
  reflectivity: 0,
  map: texture,
  side: THREE.SingleSide,
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;

scene.add(cube);

const target = cube.position.clone();
target.z += 10;
camera.lookAt(target);
camera.rotation.z = 135 * (Math.PI / 180);

//MOD
const mstack = new MOD3.ModifierStack(MOD3.LibraryThree, cube);
const taper = new MOD3.Taper(-1, 3, MOD3.Vector3.Z(false), MOD3.Vector3.Z());
const taper2 = new MOD3.Taper(1, 0.1, MOD3.Vector3.Z(false), MOD3.Vector3.Z());
const twist = new MOD3.Twist(120 * (Math.PI / 180), MOD3.Vector3.Z());
const noise = new MOD3.CPerlin(0.4, generate_noise2d(100, 100), true);

mstack.addModifier(taper);
mstack.addModifier(taper2);
mstack.addModifier(twist);
mstack.addModifier(noise);
mstack.apply();

function updateLights() {
  for (let i = 0; i < lights.length; i++) {
    let light;
    if (!lights[i].light) {
      if (lights[i].type === "directional") {
        light = new THREE.DirectionalLight(
          lights[i].color,
          lights[i].intensity
        );
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        lights[i].light = light;
        scene.add(light);

        let target = new THREE.Object3D();
        target.position.set(
          lights[i].target.x,
          lights[i].target.y,
          lights[i].target.z
        );
        scene.add(target);
        light.target = target;
      } else {
        light = new THREE.PointLight(lights[i].color, 1, 100);
        lights[i].light = light;
        scene.add(light);
      }

      if (showHelpers) {
        let lightHelper;

        if (lights[i].type === "directional") {
          lightHelper = new THREE.DirectionalLightHelper(light, 1);
        } else {
          lightHelper = new THREE.PointLightHelper(light, 1);
        }

        scene.add(lightHelper);
        lights[i].lightHelper = lightHelper;
      }
    } else {
      light = lights[i].light;
    }

    light.intensity = lights[i].intensity;
    light.color.set(lights[i].color);

    light.position.set(
      lights[i].position.x,
      lights[i].position.y,
      lights[i].position.z
    );

    if (light.target) {
      light.target.position.set(
        lights[i].target.x,
        lights[i].target.y,
        lights[i].target.z
      );
    }
  }
}

function updateCircles() {
  for (let i = 0; i < circles.length; i++) {
    let mesh;
    if (!circles[i].mesh) {
      const circle = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: circles[i].color,
        roughness: 1,
        metalness: 0,
      });
      mesh = new THREE.Mesh(circle, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      circles[i].mesh = mesh;
      scene.add(mesh);
      circles[i].delta = Math.random() * 10;
    } else {
      mesh = circles[i].mesh;
    }

    circles[i].delta += circles[i].speed;
    mesh.material.color = new THREE.Color(circles[i].color);
    mesh.scale.set(circles[i].radius, circles[i].radius, circles[i].radius);
    mesh.position.set(
      circles[i].position.x + Math.sin(circles[i].delta) * 0.3,
      circles[i].position.y + Math.cos(circles[i].delta) * 0.3,
      circles[i].position.z + Math.cos(circles[i].delta) * 0.3
    );
  }
}

let delta = 0.3;
function animate() {
  delta += 0.001;

  texture.offset.set(delta, delta / 2);
  mstack.apply();

  updateCircles();
  updateLights();

  if (showHelpers) {
    for (let i = 0; i < lights.length; i++) {
      if (lights[i].lightHelper) {
        lights[i].lightHelper.update();
      }
    }
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

function generate_noise2d(width, height) {
  const noise = [];
  for (let i = 0; i < width; i++) {
    noise[i] = [];
    for (let j = 0; j < height; j++) {
      noise[i][j] = Math.random();
    }
  }
  return noise;
}

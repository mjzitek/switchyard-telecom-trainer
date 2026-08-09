import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LAYERS, STATIONS } from "./curriculum.js";

const COLORS = {
  ground: 0xdce7ce,
  groundAlt: 0xd2dfc2,
  road: 0xc6b99d,
  roadEdge: 0xa89a7f,
  ink: 0x263238,
  cream: 0xf9f1dc,
  roof: 0x47535d,
  window: 0xf6c55c,
  tree: 0x5d8c51,
  trunk: 0x886a47,
};

const layerColor = (layer) => new THREE.Color(LAYERS[layer].color);

function material(color, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 });
}

function box(width, height, depth, color, x = 0, y = height / 2, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(radius, height, color, x = 0, y = height / 2, z = 0, sides = 8) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, sides), material(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addWindows(group, width, depth, y = 0.65) {
  [-0.35, 0.35].forEach((x) => group.add(box(0.26, 0.3, 0.05, COLORS.window, x * width, y, depth / 2 + 0.03)));
}

function makeBuilding(station) {
  const group = new THREE.Group();
  const accent = layerColor(station.layer);
  const body = new THREE.Color(COLORS.cream);

  group.add(box(1.72, 0.12, 1.42, accent, 0, 0.06, 0));
  group.add(box(1.42, 0.78, 1.12, body, 0, 0.48, 0));
  addWindows(group, 1.42, 1.12);

  if (["tower", "control"].includes(station.kind)) {
    group.add(box(0.72, 1.15, 0.72, body, 0, 1.43, 0));
    group.add(box(0.86, 0.18, 0.86, accent, 0, 2.08, 0));
    group.add(cylinder(0.07, 0.7, COLORS.ink, 0, 2.47, 0, 6));
  } else if (["warehouse", "depot", "workshop", "hall"].includes(station.kind)) {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.03, 0.48, 4), material(accent));
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.78;
    roof.position.y = 1.02;
    roof.castShadow = true;
    group.add(roof);
  } else if (station.kind === "pipes") {
    group.add(cylinder(0.28, 1.45, accent, -0.35, 1.2, 0, 10));
    group.add(cylinder(0.2, 1.08, 0x6ba6a0, 0.38, 0.98, 0.15, 10));
  } else if (station.kind === "gate" || station.kind === "checkpoint") {
    group.add(box(0.18, 1.18, 0.22, accent, -0.48, 1.28, 0));
    group.add(box(0.18, 1.18, 0.22, accent, 0.48, 1.28, 0));
    group.add(box(1.15, 0.2, 0.24, accent, 0, 1.82, 0));
  } else if (station.kind === "junction") {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.12, 8, 18), material(accent));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.22;
    group.add(ring);
  } else if (station.kind === "vault") {
    group.add(cylinder(0.43, 0.1, accent, 0, 0.65, 0.57, 14));
    group.add(cylinder(0.11, 0.16, COLORS.ink, 0, 0.65, 0.64, 12));
  } else if (station.kind === "terminal") {
    group.add(box(0.78, 0.58, 0.12, COLORS.ink, 0, 1.28, -0.05));
    group.add(box(0.62, 0.4, 0.04, 0x78b6c2, 0, 1.28, 0.02));
  } else if (station.kind === "switchhouse") {
    [-0.45, 0, 0.45].forEach((x) => group.add(box(0.25, 0.85, 0.58, COLORS.roof, x, 1.28, 0)));
  } else {
    group.add(box(0.96, 0.18, 0.86, accent, 0, 1.0, 0));
  }

  const beacon = cylinder(0.11, 0.38, accent, -0.63, 1.18, -0.38, 10);
  beacon.name = "beacon";
  group.add(beacon);
  group.userData.station = station;
  group.traverse((object) => { object.userData.station = station; });
  return group;
}

function makeTree(x, z, scale = 1) {
  const group = new THREE.Group();
  group.add(cylinder(0.08 * scale, 0.55 * scale, COLORS.trunk, 0, 0.28 * scale, 0, 7));
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34 * scale, 1), material(COLORS.tree));
  crown.position.y = 0.72 * scale;
  crown.castShadow = true;
  group.add(crown);
  group.position.set(x, 0, z);
  return group;
}

function getPathPoints(ids) {
  return ids.map((id) => {
    const station = STATIONS.find((item) => item.id === id);
    return new THREE.Vector3(station.x, 0.33, station.z);
  });
}

export function createSimulation(canvas, labelsRoot, callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9d0a7);
  scene.fog = new THREE.Fog(0xb9d0a7, 24, 42);

  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
  camera.position.set(15, 18, 18);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableRotate = false;
  controls.screenSpacePanning = true;
  controls.minZoom = 0.72;
  controls.maxZoom = 2.8;
  controls.target.set(0, 0, 0.6);

  scene.add(new THREE.HemisphereLight(0xfff8e8, 0x607055, 2.5));
  const sun = new THREE.DirectionalLight(0xfff1ca, 3.2);
  sun.position.set(-8, 16, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);

  const map = new THREE.Group();
  scene.add(map);

  for (let x = -12; x < 12; x += 2) {
    for (let z = -8; z < 9; z += 2) {
      const tile = box(1.98, 0.08, 1.98, ((x + z) / 2) % 2 === 0 ? COLORS.ground : COLORS.groundAlt, x + 1, -0.08, z + 1);
      tile.receiveShadow = true;
      map.add(tile);
    }
  }

  const roadMaterial = material(COLORS.road);
  const roadPoints = getPathPoints(STATIONS.map((station) => station.id));
  for (let index = 0; index < roadPoints.length - 1; index += 1) {
    const from = roadPoints[index];
    const to = roadPoints[index + 1];
    const length = from.distanceTo(to);
    const road = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.06, length), roadMaterial);
    road.position.copy(from).lerp(to, 0.5);
    road.position.y = 0.03;
    road.rotation.y = Math.atan2(to.x - from.x, to.z - from.z);
    road.receiveShadow = true;
    map.add(road);
  }

  [
    [-10.5, 6.2, 1.2], [-8.9, 2.6, 0.9], [-10.0, -0.7, 1], [-7.7, -5.6, 1.1],
    [-4.6, 6.3, 0.85], [-1.2, 6.4, 1.05], [2.4, 6.5, 0.9], [5.9, 6.2, 1.1],
    [9.9, 5.2, 1.1], [10.4, 0.2, 0.9], [8.6, -4.8, 1.1], [5.8, -5.6, 0.9],
    [1.6, -5.4, 1.1], [-1.8, -5.7, 0.9], [-5.0, -5.5, 1.0]
  ].forEach(([x, z, scale]) => map.add(makeTree(x, z, scale)));

  const stationGroups = new Map();
  const labelNodes = new Map();
  STATIONS.forEach((station) => {
    const group = makeBuilding(station);
    group.position.set(station.x, 0.12, station.z);
    map.add(group);
    stationGroups.set(station.id, group);

    const label = document.createElement("button");
    label.className = "map-label";
    label.dataset.station = station.id;
    label.innerHTML = `<span>${station.number}</span>${station.name}`;
    label.setAttribute("aria-label", `Open station ${station.number}: ${station.name}`);
    label.addEventListener("click", () => callbacks.onStation(station.id));
    labelsRoot.append(label);
    labelNodes.set(station.id, label);
  });

  const routeGroup = new THREE.Group();
  map.add(routeGroup);
  let routeCurve;
  let routeIds = [];
  const tokenColors = [LAYERS.signal.color, LAYERS.media.color, LAYERS.control.color];
  const tokens = tokenColors.map((color, index) => {
    const token = new THREE.Mesh(new THREE.OctahedronGeometry(index === 1 ? 0.22 : 0.18, 0), material(color, 0.35));
    token.castShadow = true;
    token.userData.offset = index * 0.075;
    token.userData.kind = ["SIP", "RTP", "EVENT"][index];
    scene.add(token);
    return token;
  });

  function setRoute(ids) {
    routeIds = ids;
    routeGroup.clear();
    const points = getPathPoints(ids);
    routeCurve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.08);
    const geometry = new THREE.TubeGeometry(routeCurve, Math.max(80, points.length * 14), 0.07, 6, false);
    const line = new THREE.Mesh(geometry, material(0x48636a));
    line.position.y = 0.02;
    routeGroup.add(line);
  }

  let progress = 0;
  let selectedId = STATIONS[0].id;
  let paused = false;
  let speed = 1;
  let follow = false;
  let labelsVisible = true;
  let lastTime = performance.now();

  function selectStation(id, focus = true) {
    selectedId = id;
    stationGroups.forEach((group, stationId) => {
      const selected = stationId === id;
      group.scale.setScalar(selected ? 1.14 : 1);
      const beacon = group.getObjectByName("beacon");
      if (beacon) beacon.material.emissive = selected ? layerColor(group.userData.station.layer).multiplyScalar(0.42) : new THREE.Color(0x000000);
    });
    labelNodes.forEach((node, stationId) => node.classList.toggle("is-selected", stationId === id));
    if (focus) {
      const station = STATIONS.find((item) => item.id === id);
      controls.target.set(station.x, 0, station.z);
    }
  }

  function setProgress(value) {
    progress = ((value % 1) + 1) % 1;
  }

  function currentRouteStation() {
    if (!routeIds.length) return null;
    const index = Math.min(routeIds.length - 1, Math.floor(progress * routeIds.length));
    return routeIds[index];
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  canvas.addEventListener("pointerup", (event) => {
    if (event.button !== 0) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects([...stationGroups.values()], true).find((item) => item.object.userData.station);
    if (hit) callbacks.onStation(hit.object.userData.station.id);
  });

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    const aspect = rect.width / rect.height;
    const viewHeight = rect.width < 760 ? 15.5 : 12.5;
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
  }

  function projectLabels() {
    labelNodes.forEach((node, id) => {
      const group = stationGroups.get(id);
      const pos = new THREE.Vector3(group.position.x, 2.35, group.position.z).project(camera);
      node.style.transform = `translate(-50%, -100%) translate(${(pos.x * 0.5 + 0.5) * canvas.clientWidth}px, ${(-pos.y * 0.5 + 0.5) * canvas.clientHeight}px)`;
      node.hidden = !labelsVisible || pos.z > 1;
    });
  }

  function render(now) {
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    if (!paused && routeCurve) progress = (progress + delta * 0.025 * speed) % 1;

    if (routeCurve) {
      tokens.forEach((token) => {
        const tokenProgress = (progress - token.userData.offset + 1) % 1;
        const position = routeCurve.getPointAt(tokenProgress);
        token.position.copy(position);
        token.position.y += 0.32 + Math.sin(now * 0.004 + token.userData.offset * 30) * 0.06;
        token.rotation.y += delta * 2;
      });
      if (follow && !paused) {
        const lead = routeCurve.getPointAt(progress);
        controls.target.lerp(new THREE.Vector3(lead.x, 0, lead.z), 0.04);
      }
    }

    stationGroups.forEach((group) => {
      const beacon = group.getObjectByName("beacon");
      if (beacon) beacon.rotation.y = now * 0.001;
    });
    controls.update();
    projectLabels();
    renderer.render(scene, camera);
    callbacks.onTick({ progress, stationId: currentRouteStation() });
    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);
  resize();
  selectStation(selectedId, false);
  requestAnimationFrame(render);

  return {
    setRoute,
    selectStation,
    setPaused(value) { paused = value; },
    setSpeed(value) { speed = value; },
    setFollow(value) { follow = value; },
    setLabels(value) { labelsVisible = value; },
    step() { paused = true; setProgress(progress + 1 / Math.max(routeIds.length * 6, 1)); },
    reset() { setProgress(0); controls.target.set(0, 0, 0.6); camera.zoom = 1; camera.updateProjectionMatrix(); },
    zoomBy(amount) { camera.zoom = THREE.MathUtils.clamp(camera.zoom + amount, controls.minZoom, controls.maxZoom); camera.updateProjectionMatrix(); },
  };
}

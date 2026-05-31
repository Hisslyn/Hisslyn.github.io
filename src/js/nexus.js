// ---------- title ----------
const word = "NEXUS";
const title = document.getElementById('title');
word.split('').forEach(function(ch, i) {
  const s = document.createElement('span');
  s.textContent = ch;
  s.style.animationDelay = (0.35 + i * 0.07) + 's';
  title.appendChild(s);
});

// ---------- custom cursor (canvas-scoped) ----------
const cur = document.querySelector('.cursor');
const ring = document.querySelector('.cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
(function loop() {
  rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
  cur.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
  ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
  requestAnimationFrame(loop);
})();

// ================= THREE.JS =================
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050814, 0.007);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 400);

// ---- diffuse particle cloud ----
const COUNT = 15000;
const CLOUD_R = 98;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);
const brights = new Float32Array(COUNT);
const cA = new THREE.Color(0x4ad6ff), cB = new THREE.Color(0xa78bff), cC = new THREE.Color(0x6a8cff);
for (let i = 0; i < COUNT; i++) {
  const radius = CLOUD_R * (0.22 + 0.78 * Math.random());
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const flatten = 0.86;
  const jit = radius * 0.28;
  positions[i * 3]     = Math.sin(phi) * Math.cos(theta) * radius + (Math.random() - 0.5) * jit;
  positions[i * 3 + 1] = Math.cos(phi) * radius * flatten         + (Math.random() - 0.5) * jit;
  positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius + (Math.random() - 0.5) * jit;
  const mix = Math.random();
  const col = mix < 0.5 ? cA.clone().lerp(cC, mix * 2) : cC.clone().lerp(cB, (mix - 0.5) * 2);
  colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  sizes[i] = 0.03 + Math.pow(Math.random(), 3.0) * 1.4;
  brights[i] = 0.12 + Math.pow(Math.random(), 2.2) * 1.25;
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
geo.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));
const sc = document.createElement('canvas'); sc.width = sc.height = 64;
const sx = sc.getContext('2d'); const sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.3, 'rgba(255,255,255,0.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
sx.fillStyle = sg; sx.fillRect(0, 0, 64, 64);
const sprite = new THREE.CanvasTexture(sc);
const cloudMat = new THREE.ShaderMaterial({
  uniforms: { uTex: { value: sprite }, uScale: { value: 0.5 * innerHeight * Math.min(devicePixelRatio, 2) } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: [
    'attribute vec3 color; attribute float aSize; attribute float aBright;',
    'varying vec3 vColor;',
    'uniform float uScale;',
    'void main(){',
    '  vColor=color*aBright;',
    '  vec4 mv=modelViewMatrix*vec4(position,1.0);',
    '  gl_PointSize=aSize*(uScale/-mv.z);',
    '  gl_Position=projectionMatrix*mv;',
    '}'
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D uTex; varying vec3 vColor;',
    'void main(){ vec4 t=texture2D(uTex,gl_PointCoord); gl_FragColor=vec4(vColor,0.9)*t; }'
  ].join('\n')
});
const cloud = new THREE.Points(geo, cloudMat);
scene.add(cloud);

// distant stars
const starGeo = new THREE.BufferGeometry();
const SC = 1600;
const sp = new Float32Array(SC * 3);
for (let i = 0; i < SC; i++) {
  sp[i * 3] = (Math.random() - 0.5) * 140;
  sp[i * 3 + 1] = (Math.random() - 0.5) * 140;
  sp[i * 3 + 2] = (Math.random() - 0.5) * 140;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x99aaff, size: 0.09, transparent: true, opacity: 0.55 }));
scene.add(stars);

// ---- falling meteor field ----
const asteroids = [];
const astMat = new THREE.MeshStandardMaterial({ color: 0xb4bcd6, roughness: 1, metalness: 0.05, emissive: 0x2a3550, emissiveIntensity: 0.6 });
const FALL = new THREE.Vector3(-0.45, -1.0, -0.32).normalize();
const SPAWN = 95;
const ASTN = 44;
function spawnPos() {
  const u = new THREE.Vector3().crossVectors(FALL, new THREE.Vector3(0, 1, 0)).normalize();
  const w = new THREE.Vector3().crossVectors(FALL, u).normalize();
  const p = FALL.clone().multiplyScalar(-SPAWN * (0.8 + Math.random() * 0.6));
  p.addScaledVector(u, (Math.random() - 0.5) * 2 * SPAWN);
  p.addScaledVector(w, (Math.random() - 0.5) * 2 * SPAWN);
  return p;
}
for (let i = 0; i < ASTN; i++) {
  const base = 0.06 + Math.random() * 0.20;
  const g = new THREE.IcosahedronGeometry(base, 1);
  const pos = g.attributes.position;
  for (let k = 0; k < pos.count; k++) {
    const f = 0.85 + Math.random() * 0.3;
    pos.setXYZ(k, pos.getX(k) * f, pos.getY(k) * f, pos.getZ(k) * f);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, astMat);
  m.position.copy(spawnPos());
  scene.add(m);
  const tg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const trail = new THREE.Line(tg, new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(trail);
  asteroids.push({
    m: m, trail: trail, tlen: 3 + Math.random() * 6, speed: 0.7 + Math.random() * 0.8,
    rot: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05)
  });
}

// lights
scene.add(new THREE.AmbientLight(0x223355, 0.5));

// ---- Milky Way ----
(function buildMilkyWay() {
  const W = 2048, H = 1024;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  x.fillStyle = '#03050f'; x.fillRect(0, 0, W, H);
  const bandY = H * 0.5, bandH = H * 0.26;
  for (let i = 0; i < 520; i++) {
    const px = Math.random() * W;
    const wave = Math.sin(px / W * Math.PI * 2) * H * 0.06;
    const py = bandY + wave + (Math.random() - 0.5) * bandH;
    const r = 40 + Math.random() * 180;
    const tint = Math.random();
    const col = tint < 0.5 ? '74,180,255' : tint < 0.8 ? '120,140,255' : '167,139,255';
    const a = 0.05 + Math.random() * 0.06;
    for (const ox of [-W, 0, W]) {
      if (px + ox + r < 0 || px + ox - r > W) continue;
      const gg = x.createRadialGradient(px + ox, py, 0, px + ox, py, r);
      gg.addColorStop(0, 'rgba(' + col + ',' + a + ')');
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gg; x.beginPath(); x.arc(px + ox, py, r, 0, 7); x.fill();
    }
  }
  for (let i = 0; i < 9000; i++) {
    const inBand = Math.random() < 0.78;
    const px = Math.random() * W;
    const wave = Math.sin(px / W * Math.PI * 2) * H * 0.06;
    const py = inBand ? bandY + wave + (Math.random() - 0.5) * bandH * 1.4 : Math.random() * H;
    const s = Math.random() * 1.6 + 0.2;
    x.globalAlpha = inBand ? 0.4 + Math.random() * 0.6 : 0.2 + Math.random() * 0.4;
    const w = Math.random();
    x.fillStyle = w < 0.7 ? '#eaf0ff' : (w < 0.9 ? '#acc4ff' : '#c9b8ff');
    x.fillRect(px, py, s, s);
    if (px < 3) x.fillRect(px + W, py, s, s);
    else if (px > W - 3) x.fillRect(px - W, py, s, s);
  }
  x.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = THREE.RepeatWrapping;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 48, 48),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  sky.rotation.z = 0.5; sky.rotation.x = 0.3;
  window.__milkyway = sky;
  scene.add(sky);
})();

// ---- radial glow sprite ----
const glowBase = (function () {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
})();

// ---- central sun ----
const sunGrp = new THREE.Group();
scene.add(sunGrp);

const NOISE_GLSL = [
  'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
  'vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
  'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
  'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
  'float snoise(vec3 v){',
  '  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);',
  '  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);',
  '  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;',
  '  vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);',
  '  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;',
  '  i=mod289(i);',
  '  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));',
  '  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;',
  '  vec4 j=p-49.0*floor(p*ns.z*ns.z);',
  '  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);',
  '  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);',
  '  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);',
  '  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));',
  '  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
  '  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);',
  '  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
  '  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;',
  '  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;',
  '  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
  '}',
  'float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<5;i++){ f+=a*snoise(p); p*=2.02; a*=0.5; } return f; }'
].join('\n');

const sunMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: [
    'varying vec3 vP; varying vec3 vN; varying vec3 vView;',
    'void main(){',
    '  vP=position; vN=normalize(normalMatrix*normal);',
    '  vec4 mv=modelViewMatrix*vec4(position,1.0); vView=normalize(-mv.xyz);',
    '  gl_Position=projectionMatrix*mv;',
    '}'
  ].join('\n'),
  fragmentShader: NOISE_GLSL + [
    'uniform float uTime; varying vec3 vP; varying vec3 vN; varying vec3 vView;',
    'void main(){',
    '  vec3 p=normalize(vP);',
    '  float big=fbm(p*2.6+vec3(0.0,uTime*0.06,uTime*0.03));',
    '  float fine=fbm(p*6.5-vec3(uTime*0.10,0.0,uTime*0.05));',
    '  float h=clamp(0.6*big+0.4*fine,-1.0,1.0)*0.5+0.5;',
    '  vec3 c1=vec3(0.42,0.04,0.0);',
    '  vec3 c2=vec3(1.0,0.30,0.02);',
    '  vec3 c3=vec3(1.0,0.72,0.16);',
    '  vec3 c4=vec3(1.0,0.97,0.86);',
    '  vec3 col=mix(c1,c2,smoothstep(0.0,0.4,h));',
    '  col=mix(col,c3,smoothstep(0.38,0.72,h));',
    '  col=mix(col,c4,smoothstep(0.74,1.0,h));',
    '  float fres=pow(1.0-max(dot(vN,vView),0.0),2.2);',
    '  col+=vec3(1.0,0.55,0.2)*fres*0.9;',
    '  col*=1.18;',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n')
});
const sunCore = new THREE.Mesh(new THREE.SphereGeometry(2.8, 96, 96), sunMat);
sunGrp.add(sunCore);

const sunShell = new THREE.Mesh(
  new THREE.SphereGeometry(3.5, 64, 64),
  new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    vertexShader: [
      'varying vec3 vN; varying vec3 vView;',
      'void main(){ vN=normalize(normalMatrix*normal);',
      '  vec4 mv=modelViewMatrix*vec4(position,1.0); vView=normalize(-mv.xyz);',
      '  gl_Position=projectionMatrix*mv; }'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vN; varying vec3 vView;',
      'void main(){ float f=pow(1.0-max(dot(vN,vView),0.0),3.0);',
      '  gl_FragColor=vec4(vec3(1.0,0.55,0.18)*f, f*0.9); }'
    ].join('\n')
  })
);
sunGrp.add(sunShell);

const sunCorona = [
  [6.5, 0xfff4c4, 0.55], [10, 0xffc24d, 0.38], [15, 0xff8a3a, 0.26],
  [21, 0xff5a2a, 0.15], [30, 0xffb86a, 0.08]
];
sunCorona.forEach(function(item) {
  const s = item[0], c = item[1], o = item[2];
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowBase, color: new THREE.Color(c), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: o
  }));
  spr.scale.set(s, s, 1); spr.userData.base = s; spr.userData.o = o; spr.userData.corona = true;
  sunGrp.add(spr);
});
const sunLight = new THREE.PointLight(0xffd9a0, 3.6, 340);
sunGrp.add(sunLight);

// ---- sun flares ----
const flareStarTex = (function () {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const x = cv.getContext('2d');
  x.translate(128, 128);
  const rays = [
    [0, 124], [Math.PI / 2, 124], [Math.PI, 124], [Math.PI * 1.5, 124],
    [Math.PI / 4, 66], [Math.PI * 3 / 4, 66], [Math.PI * 5 / 4, 66], [Math.PI * 7 / 4, 66]
  ];
  rays.forEach(function(ray) {
    const ang = ray[0], len = ray[1];
    x.save(); x.rotate(ang);
    const g = x.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(0, -2.5); x.lineTo(len, 0); x.lineTo(0, 2.5); x.closePath(); x.fill();
    x.restore();
  });
  const cg = x.createRadialGradient(0, 0, 0, 0, 0, 46);
  cg.addColorStop(0, 'rgba(255,255,255,0.9)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = cg; x.beginPath(); x.arc(0, 0, 46, 0, 7); x.fill();
  return new THREE.CanvasTexture(cv);
})();
const flareStar = new THREE.Sprite(new THREE.SpriteMaterial({
  map: flareStarTex, color: 0xfff0c8, transparent: true, blending: THREE.AdditiveBlending,
  depthWrite: false, opacity: 0.6
}));
flareStar.scale.set(30, 30, 1);
sunGrp.add(flareStar);
const flareStreak = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowBase, color: 0xffe0b0, transparent: true, blending: THREE.AdditiveBlending,
  depthWrite: false, opacity: 0.4
}));
flareStreak.scale.set(54, 3.2, 1);
sunGrp.add(flareStreak);

// ---- procedural planet texture ----
function planetTexture(base, accent, bands) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const x = cv.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const r = Math.random() * 9; x.globalAlpha = Math.random() * 0.18;
    x.fillStyle = Math.random() > 0.5 ? accent : '#000';
    x.beginPath(); x.arc(Math.random() * 256, Math.random() * 256, r, 0, 7); x.fill();
  }
  if (bands) {
    for (let y = 0; y < 256; y += 4) {
      x.globalAlpha = 0.05 + Math.random() * 0.08;
      x.fillStyle = Math.random() > 0.5 ? accent : base;
      x.fillRect(0, y + Math.sin(y * 0.3) * 2, 256, 3);
    }
  }
  x.globalAlpha = 1;
  return new THREE.CanvasTexture(cv);
}

// ---- planets — mapped to real pages ----
const planetDefs = [
  { name: 'Work',    sub: 'Things I have built',  href: 'projects.html',  dist: 26, incl: 0.18,  node: 0.4, phase: 0.6, speed: 0.04,  r: 2.4, base: '#16486e', accent: '#5cc8ff', spin: 0.22, ring: false, tilt: 0.4 },
  { name: 'About',   sub: 'Who is behind this',   href: 'cv.html',        dist: 44, incl: 0.45,  node: 2.1, phase: 2.4, speed: 0.026, r: 3.8, base: '#8a5a1e', accent: '#ffce5e', spin: 0.12, ring: true,  tilt: 0.6 },
  { name: 'Lab',     sub: 'Works in progress',    href: 'merch.html',     dist: 64, incl: -0.3,  node: 4.0, phase: 4.1, speed: 0.016, r: 1.5, base: '#0e5a55', accent: '#3df0d0', spin: 0.34, ring: false, tilt: 0.2 },
  { name: 'Contact', sub: 'Start a conversation', href: 'contactme.html', dist: 14, incl: 0.6,   node: 5.2, phase: 1.3, speed: 0.055, r: 2.0, base: '#3a3470', accent: '#9d8cff', spin: 0.18, ring: false, tilt: 0.9 },
];
const labelLayer = document.getElementById('labels');
const planets = [];
planetDefs.forEach(function(d, i) {
  const plane = new THREE.Group();
  plane.rotation.order = 'YXZ'; plane.rotation.y = d.node; plane.rotation.x = d.incl;
  scene.add(plane);

  const seg = 128, pts = [];
  for (let s = 0; s <= seg; s++) {
    const a = s / seg * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * d.dist, 0, Math.sin(a) * d.dist));
  }
  const ringLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: new THREE.Color(d.accent), transparent: true, opacity: 0.28 })
  );
  plane.add(ringLine);

  const pivot = new THREE.Group(); plane.add(pivot);
  pivot.rotation.y = d.phase;

  const grp = new THREE.Group(); grp.position.set(d.dist, 0, 0); pivot.add(grp);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(d.r, 48, 48),
    new THREE.MeshStandardMaterial({
      map: planetTexture(d.base, d.accent, d.ring),
      roughness: 0.85, metalness: 0.1, emissive: new THREE.Color(d.base), emissiveIntensity: 0.18
    })
  );
  mesh.userData.index = i;
  grp.add(mesh);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowBase, color: new THREE.Color(d.accent), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55
  }));
  const gScale = d.r * 4.2;
  glow.scale.set(gScale, gScale, 1);
  glow.userData.base = gScale;
  grp.add(glow);

  if (d.ring) {
    const rg = new THREE.Mesh(
      new THREE.RingGeometry(d.r * 1.5, d.r * 2.4, 64),
      new THREE.MeshBasicMaterial({ color: d.accent, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    rg.rotation.x = Math.PI / 2.2;
    grp.add(rg);
  }
  grp.rotation.z = d.tilt;

  const lab = document.createElement('div'); lab.className = 'plabel';
  lab.innerHTML = '<div class="nm">' + d.name + '</div><div class="sub">' + d.sub + '</div>';
  labelLayer.appendChild(lab);
  planets.push(Object.assign({}, d, { plane: plane, pivot: pivot, grp: grp, mesh: mesh, glow: glow, ringLine: ringLine, lab: lab, lit: 0, angle: d.phase }));
});

// ---- orbit camera ----
const target = new THREE.Vector3(0, 0, 0);
let theta = 0.6, phi = Math.PI / 2;
let R = 78, targetR = 78;
let velT = 0, velP = 0;
let dragging = false, downX = 0, downY = 0, lastX = 0, lastY = 0, moved = 0, downTime = 0;
const PHI_MIN = 0.18, PHI_MAX = Math.PI - 0.18;

function applyCamera() {
  R += (targetR - R) * 0.08;
  camera.position.set(
    target.x + R * Math.sin(phi) * Math.cos(theta),
    target.y + R * Math.cos(phi),
    target.z + R * Math.sin(phi) * Math.sin(theta)
  );
  camera.lookAt(target);
}

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pick(cx, cy) {
  ndc.x = (cx / innerWidth) * 2 - 1;
  ndc.y = -(cy / innerHeight) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(planets.map(function(p) { return p.mesh; }));
  return hits.length ? hits[0].object.userData.index : -1;
}

let hover = -1, warp = false, warpTo = null;

canvas.addEventListener('pointerdown', function(e) {
  dragging = true; downX = lastX = e.clientX; downY = lastY = e.clientY; moved = 0; downTime = performance.now();
  velT = velP = 0; ring.classList.add('drag');
});
addEventListener('pointermove', function(e) {
  mx = e.clientX; my = e.clientY;
  if (dragging) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    theta -= dx * 0.005; phi -= dy * 0.005;
    phi = Math.max(PHI_MIN, Math.min(PHI_MAX, phi));
    velT = -dx * 0.005; velP = -dy * 0.005;
  } else if (!warp) {
    hover = pick(e.clientX, e.clientY);
    ring.classList.toggle('hot', hover >= 0);
  }
});
addEventListener('pointerup', function(e) {
  ring.classList.remove('drag');
  const quick = performance.now() - downTime < 350;
  if (dragging && moved < 8 && quick) {
    const idx = pick(e.clientX, e.clientY);
    if (idx >= 0) enter(idx);
  }
  dragging = false;
});
addEventListener('wheel', function(e) {
  targetR = Math.max(16, Math.min(140, targetR + e.deltaY * 0.03));
}, { passive: true });

function enter(idx) {
  warpTo = planets[idx];
  warpTo.igniting = true;
  document.getElementById('hud').classList.add('zooming');
  planets.forEach(function(p) { if (p !== warpTo) p.lab.style.opacity = 0; });
  setTimeout(function() { warp = true; }, 180);
  setTimeout(function() { window.location.href = warpTo.href; }, 1100);
}

// ---- project labels to screen ----
const v = new THREE.Vector3();
function updateLabels() {
  const camDir = new THREE.Vector3(); camera.getWorldDirection(camDir);
  const wp = new THREE.Vector3();
  planets.forEach(function(p, i) {
    p.grp.getWorldPosition(wp);
    v.copy(wp); v.y += p.r + 0.9; v.project(camera);
    const behind = v.z > 1;
    const toP = new THREE.Vector3().subVectors(wp, camera.position).normalize();
    const facing = toP.dot(camDir) > 0;
    if (behind || !facing) { p.lab.style.opacity = 0; return; }
    if (!warp || p === warpTo) p.lab.style.opacity = (hover === i ? 1 : 0.82);
    p.lab.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px';
    p.lab.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';
    p.lab.classList.toggle('hot', hover === i);
    const sErr = hover === i ? 1.12 : 1;
    p.lab.style.transform = 'translate(-50%,-50%) scale(' + sErr + ')';
  });
}

const SYS = 0.17;
const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  cloud.rotation.y = t * 0.025 * SYS; cloud.rotation.x = Math.sin(t * 0.05 * SYS) * 0.04;
  stars.rotation.y = t * 0.006 * SYS;
  if (window.__milkyway) window.__milkyway.rotation.y = t * 0.004 * SYS;

  asteroids.forEach(function(a) {
    a.m.position.addScaledVector(FALL, a.speed);
    a.m.rotation.x += a.rot.x; a.m.rotation.y += a.rot.y; a.m.rotation.z += a.rot.z;
    if (a.m.position.dot(FALL) > SPAWN || a.m.position.length() > SPAWN * 2.2) a.m.position.copy(spawnPos());
    const h = a.m.position;
    const arr = a.trail.geometry.attributes.position.array;
    arr[0] = h.x; arr[1] = h.y; arr[2] = h.z;
    arr[3] = h.x - FALL.x * a.tlen; arr[4] = h.y - FALL.y * a.tlen; arr[5] = h.z - FALL.z * a.tlen;
    a.trail.geometry.attributes.position.needsUpdate = true;
  });

  planets.forEach(function(p, i) {
    p.mesh.rotation.y = t * p.spin * SYS;
    if (!warp) p.pivot.rotation.y = p.phase + t * p.speed * SYS;
    const goal = (hover === i && !warp) ? 1.12 : 1;
    p.mesh.scale.x += (goal - p.mesh.scale.x) * 0.12;
    p.mesh.scale.y = p.mesh.scale.z = p.mesh.scale.x;

    const litGoal = p.igniting ? 1 : (hover === i && !warp ? 0.35 : 0);
    p.lit += (litGoal - p.lit) * (p.igniting ? 0.14 : 0.1);
    const pulse = 1 + Math.sin(t * 1.6 + p.phase) * 0.06;
    p.glow.material.opacity = (0.5 + p.lit * 0.5) * pulse;
    p.glow.scale.setScalar(p.glow.userData.base * (1 + p.lit * 0.7) * pulse);
    p.mesh.material.emissiveIntensity = 0.18 + p.lit * 1.6;
    p.ringLine.material.opacity = 0.28 + p.lit * 0.5;
  });

  sunMat.uniforms.uTime.value = t;
  sunCore.rotation.y = t * 0.03 * SYS;
  sunGrp.children.forEach(function(ch) {
    if (ch.isSprite && ch.userData.corona) {
      const b = ch.userData.base, o = ch.userData.o, k = 1 + Math.sin(t * 1.2 + b) * 0.05;
      ch.scale.set(b * k, b * k, 1); ch.material.opacity = o * (0.92 + Math.sin(t * 0.9 + b) * 0.08);
    }
  });
  flareStar.material.rotation = t * 0.06 * SYS;
  flareStar.material.opacity = 0.5 + Math.sin(t * 0.7) * 0.12;
  const fk = 1 + Math.sin(t * 1.1) * 0.16;
  flareStar.scale.set(30 * fk, 30 * fk, 1);
  flareStreak.material.opacity = 0.32 + Math.sin(t * 0.9 + 1.5) * 0.12;
  flareStreak.scale.set(54 * (1 + Math.sin(t * 0.8) * 0.1), 3.2, 1);

  if (!dragging && !warp) {
    theta += velT; phi += velP;
    phi = Math.max(PHI_MIN, Math.min(PHI_MAX, phi));
    velT *= 0.94; velP *= 0.94; theta += 0.0006 * SYS;
  }
  if (warp) {
    targetR = Math.max(3, targetR - 2);
    const wp = new THREE.Vector3();
    warpTo.grp.getWorldPosition(wp);
    target.lerp(wp, 0.04);
  }

  applyCamera(); updateLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
applyCamera(); animate();

addEventListener('resize', function() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  cloudMat.uniforms.uScale.value = 0.5 * innerHeight * Math.min(devicePixelRatio, 2);
});

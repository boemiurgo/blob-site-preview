// Prices preview in 3D, after the start window's vinyl selector (start-logo/record3d.js): the same lathed
// record and shader, plus cardboard sleeves. With no sleeve the record stands alone; a normal sleeve sits
// in front with the record peeking out to the right; a gatefold opens like a book with the record resting
// on its right panel. Hovering tilts the scene toward the pointer, lifts the record, slides it out a little
// and sets it spinning, as on the start window. Without WebGL the flat images stay in place.
(() => {
  const figure = document.querySelector('#prices .record-preview');
  const stage = figure?.querySelector('.record-preview__stage');
  if (!stage) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'record-preview__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return;

  const CAMERA = 4.2, FOV = .65, BASE_YAW = -.22, BASE_PITCH = -.2, FLOOR = -1.16;
  const halfHeight = CAMERA * Math.tan(FOV / 2);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const FINISHES = { solid: 0, splatter: 1, clear: 2, smoked: 3, marbled: 4, recycled: 5 };
  // Each price color option as a vinyl color and finish; labels are the site lime.
  const LOOKS = {
    'black': ['#161616', 'solid'],
    'clear': ['#cfd2cc', 'clear'],
    'solid color': ['#f04e30', 'solid'],
    'smoked': ['#3a3f3a', 'smoked'],
    'splatter': ['#b4f01c', 'splatter'],
    'marbled': ['#f04e30', 'marbled'],
    'recycled random': ['#6f9f0a', 'recycled'],
  };
  const LABEL = '#b8ff1a', SLEEVE = '#b8fe21', GATEFOLD = '#356336';
  // Scene targets per sleeve choice; ext is the 12" scene's half width and height, used to fit the stage.
  // A double record adds a second disc (rec2): fanned out behind the first, peeking further out of a
  // normal sleeve, or resting on the gatefold's left panel.
  const SCENES = {
    basic: { recX: 0, recZ: 0, rec2X: 0, rec2Z: 0, sleeve: 0, gate: 0, ext: [1.12, 1.12] },
    printed: { recX: .52, recZ: -.07, rec2X: .52, rec2Z: -.07, sleeve: 1, gate: 0, ext: [1.58, 1.12] },
    gatefold: { recX: 1.22, recZ: .09, rec2X: 1.22, rec2Z: .09, sleeve: 0, gate: 1, ext: [2.3, 1.12] },
  };
  const DOUBLE = {
    basic: { recX: -.28, recZ: 0, rec2X: .34, rec2Z: -.12, ext: [1.46, 1.12] },
    printed: { recX: .36, recZ: -.07, rec2X: .86, rec2Z: -.14, ext: [1.98, 1.12] },
    gatefold: { recX: 1.22, recZ: .09, rec2X: -1.22, rec2Z: .09, ext: [2.3, 1.12] },
  };
  const SIDE = 1.06, THICK = .028; // sleeve half size and half thickness

  const M4 = {
    ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
    mul(...list) { return list.reduce((a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }); },
    translate(x, y, z) { const m = M4.ident(); m[12] = x; m[13] = y; m[14] = z; return m; },
    scale(x, y = x, z = x) { const m = M4.ident(); m[0] = x; m[5] = y; m[10] = z; return m; },
    rotX(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; },
    rotY(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; },
    rotZ(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; },
    perspective(fov, aspect, near, far) { const f = 1 / Math.tan(fov / 2), m = new Float32Array(16); m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = (2 * far * near) / (near - far); return m; },
    normal(m) { return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]); }, // rotation + uniform scale
  };

  let u, attribs, recordMesh, shadowMesh, boxMesh;
  try {
    const vs = 'attribute vec3 pos,nrm;uniform mat4 model,proj;uniform mat3 normal;varying vec3 N,P,L,G;void main(){L=pos;G=nrm;vec4 p=model*vec4(pos,1.);p.z-=' + CAMERA.toFixed(2) + ';P=p.xyz;N=normal*nrm;gl_Position=proj*p;}';
    // The start record's shader, plus marbled and recycled finishes and a matte cardboard mode for sleeves.
    const fs = `precision highp float;varying vec3 N,P,L,G;
    uniform vec3 vinyl,label,dots,box;uniform mat3 normal;uniform float px,fade,finish,pass,mode,shadow,seed,flatMode,paper,ink;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+17.;a*=.5;}return v;}
    float splat(vec2 p,float cell,float density){vec2 g=p/cell,i=floor(g),f=fract(g);float d=9.;
      for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y)),c=i+o+seed;
        if(hash(c)>density)continue;
        vec2 q=o+vec2(hash(c+3.1),hash(c+7.7))-f;d=min(d,length(q)/(.1+.32*hash(c+1.3)));}
      return 1.-smoothstep(.8,1.,d);}
    void main(){
      if(mode>.5&&mode<1.5){float s=1.-smoothstep(.1,1.,length(L.xy));gl_FragColor=vec4(0.,0.,0.,1.)*s*s*shadow;return;}
      vec3 n=normalize(N),v=normalize(-P);float facing=dot(n,v);
      vec3 l1=normalize(vec3(-.5,.85,1.)),l2=normalize(vec3(.8,.15,.6));
      if(mode>1.5){ // cardboard sleeve: matte, a soft sheen and darker edges
        if(facing<0.)n=-n;
        float d1=max(dot(n,l1),0.),d2=max(dot(n,l2),0.),fres=pow(1.-max(dot(n,v),0.),3.);
        float sheen=pow(max(dot(n,normalize(l1+v)),0.),24.);
        float edge=max(abs(L.x)/box.x,abs(L.y)/box.y);
        vec3 c=vinyl*(.62+.3*d1+.12*d2)+.05*sheen+.04*fres;
        c*=1.-.1*smoothstep(.9,1.,edge)*step(.7,abs(G.z));
        if(flatMode>.5){c=vinyl;if(edge>.975)c=vec3(ink);}
        float a=1.-fade;gl_FragColor=vec4(clamp(c,0.,1.)*a,a);return;
      }
      if(pass>.5&&pass<1.5&&facing>0.)discard;
      if(pass>1.5&&facing<=0.)discard;
      if(facing<0.)n=-n;
      float r=length(L.xy);bool face=abs(G.z)>.7;
      float d1=max(dot(n,l1),0.),d2=max(dot(n,l2),0.),fres=pow(1.-max(dot(n,v),0.),4.);
      float gloss=pow(max(dot(n,normalize(l1+v)),0.),160.)+.4*pow(max(dot(n,normalize(l2+v)),0.),90.);
      vec3 base=vinyl;float alpha=1.,h=0.;
      if(face&&r<.334){
        base=label;
        if(abs(r-.305)<.0025||abs(r-.07)<.002)base*=.8;
        h=.14*gloss+.04*fres;
      }else{
        if(finish>.5&&finish<1.5){base=mix(base,dots,splat(L.xy,.09,.3));base=mix(base,dots,splat(L.xy+5.3,.034,.22));}
        else if(finish>1.5&&finish<2.5){
          if(flatMode>.5){alpha=.8;}else{base=mix(vinyl,vec3(1.),.22);alpha=.38;}
        }
        else if(finish>2.5&&finish<3.5){
          float a=r*5.5+seed;vec2 q=mat2(cos(a),sin(a),-sin(a),cos(a))*L.xy;
          float wisp=smoothstep(.4,.68,fbm(q*2.4+seed));
          base=mix(mix(vinyl,vec3(1.),.15),vinyl*.16+.03,wisp);alpha=mix(.5,.94,wisp);
        }
        else if(finish>3.5&&finish<4.5){ // marbled: color swirled through white
          float a=r*4.2+seed;vec2 q=mat2(cos(a),sin(a),-sin(a),cos(a))*L.xy;
          base=mix(vec3(.95,.95,.93),vinyl,smoothstep(.44,.56,fbm(q*2.2+seed)));
        }
        else if(finish>4.5){ // recycled: blotches of leftover colors
          base=mix(vinyl,vec3(.19,.38,.11),smoothstep(.46,.6,fbm(L.xy*3.1+seed)));
          base=mix(base,vec3(.9,.82,.2),smoothstep(.58,.7,fbm(L.xy*4.7+seed+9.)));
        }
        float groove=.14;
        if(face&&r>.338&&r<.95){
          groove=.48+.35*clamp(1.-px*900.,0.,1.)*sin(r*1800.)+.17*clamp(1.-px*485.,0.,1.)*sin(r*971.);
          if(abs(fract((r-.442)/.0855)-.5)<.035||r<.442)groove=.14;
        }
        vec3 t=normalize(normal*vec3(-L.y,L.x,0.));float t1=dot(t,normalize(l1+v)),t2=dot(t,normalize(l2+v));
        float aniso=(pow(max(1.-t1*t1,0.),28.)+.45*pow(max(1.-t2*t2,0.),28.))*groove;
        h=.34*aniso+.3*gloss+.07*fres;
        if(r>.985){base*=.42;alpha=mix(alpha,1.,.75);}
        else if(!face)alpha=mix(alpha,1.,.5);
      }
      vec3 c=clamp(base*(.56+.32*d1+.14*d2)+h,0.,1.);
      if(flatMode>.5){
        c=base;
        if(face&&r>.36&&r<.95&&abs(fract(r*11.)-.5)<.06)c*=.86;
        if(r>.978||abs(r-.334)<.004){c=vec3(ink);alpha=1.;}
      }else alpha=clamp(alpha+h*.7,0.,1.);
      gl_FragColor=vec4(c*alpha,alpha);
    }`;
    const shader = (type, source) => { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; };
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    u = Object.fromEntries(['model', 'proj', 'normal', 'vinyl', 'label', 'dots', 'box', 'px', 'fade', 'finish', 'pass', 'mode', 'shadow', 'seed', 'flatMode', 'paper', 'ink'].map(n => [n, gl.getUniformLocation(program, n)]));
    attribs = [['pos', 0], ['nrm', 12]].map(([name, off]) => { const a = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(a); return [a, off]; });

    // Record lathe profile, as on the start window: raised label, sunken groove field, lip and rounded edge.
    const LBL = .024, FIELD = .017, LIP = .021, EDGE = .97, HOLE = .023;
    const seg = (a, b) => { const dr = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dr, dz); return [[a[0], a[1], -dz / l, dr / l], [b[0], b[1], -dz / l, dr / l]]; };
    const top = [seg([HOLE, LBL], [.33, LBL]), seg([.33, LBL], [.338, FIELD]), seg([.338, FIELD], [.95, FIELD]), seg([.95, FIELD], [EDGE, LIP])];
    const strips = [...top, ...top.map(s => s.map(([r, z, nr, nz]) => [r, -z, nr, -nz]))];
    const arc = [];
    for (let i = 0; i <= 14; i++) {
      const t = Math.PI / 2 - i / 14 * Math.PI, c = Math.cos(t), s = Math.sin(t), nr = c / (1 - EDGE), nz = s / LIP, l = Math.hypot(nr, nz);
      arc.push([EDGE + (1 - EDGE) * c, LIP * s, nr / l, nz / l]);
    }
    strips.push(arc, [[HOLE, LBL, -1, 0], [HOLE, -LBL, -1, 0]]);
    const vertices = [], indices = [], K = 128;
    for (const strip of strips) {
      const b = vertices.length / 6, m = strip.length;
      for (let k = 0; k <= K; k++) {
        const a = k / K * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
        for (const [r, z, nr, nz] of strip) vertices.push(c * r, s * r, z, c * nr, s * nr, nz);
      }
      for (let k = 0; k < K; k++) for (let j = 0; j < m - 1; j++) { const a = b + k * m + j, c = a + m; indices.push(a, c, c + 1, a, c + 1, a + 1); }
    }
    // Sleeve panel: a thin box centred on the origin.
    const bv = [], bi = [];
    const faces = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]], ext = [SIDE, SIDE, THICK];
    for (const n of faces) {
      const axis = n.findIndex(v => v), [a, b] = [0, 1, 2].filter(i => i !== axis), base = bv.length / 6;
      for (const [sa, sb] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const p = [0, 0, 0]; p[axis] = n[axis] * ext[axis]; p[a] = sa * ext[a]; p[b] = sb * ext[b];
        bv.push(...p, ...n);
      }
      bi.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    const buffer = (target, data) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; };
    recordMesh = { vb: buffer(gl.ARRAY_BUFFER, new Float32Array(vertices)), ib: buffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), count: indices.length };
    boxMesh = { vb: buffer(gl.ARRAY_BUFFER, new Float32Array(bv)), ib: buffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bi)), count: bi.length };
    shadowMesh = { vb: buffer(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 0, 1, 1, -1, 0, 0, 0, 1, -1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1])) };
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  } catch (error) { figure.dataset.renderError = error.message; return; }

  stage.append(canvas);
  figure.classList.add('is-3d');

  const useMesh = mesh => {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb);
    for (const [a, off] of attribs) gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 24, off);
    if (mesh.ib) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
  };
  const rgb = hex => hex.match(/\w\w/g).map(v => parseInt(v, 16) / 255);
  const luma = c => .2126 * c[0] + .7152 * c[1] + .0722 * c[2];

  let flat = document.documentElement.dataset.viewMode === '2d', paper = .95, ink = .08;
  const readTheme = () => {
    const css = getComputedStyle(document.documentElement), num = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return Number.isNaN(v) ? d : v; };
    paper = num('--record-paper', .95); ink = num('--record-ink', .08); schedule();
  };
  document.addEventListener('blob:viewmode', e => { flat = e.detail === '2d'; schedule(); });
  document.addEventListener('blob:theme', readTheme);

  // Animated scene values ease toward the current choice; hover values toward the pointer.
  const target = () => {
    const key = SCENES[figure.dataset.sleeve] ? figure.dataset.sleeve : 'basic', double = figure.dataset.discs === '2';
    return { ...SCENES[key], ...(double ? DOUBLE[key] : null), disc2: double ? 1 : 0, size: figure.dataset.record === '7' ? .7 : 1 };
  };
  const now0 = target();
  const cur = { recX: now0.recX, recZ: now0.recZ, rec2X: now0.rec2X, rec2Z: now0.rec2Z, disc2: now0.disc2, sleeve: now0.sleeve, gate: now0.gate, size: now0.size, extX: now0.ext[0], extY: now0.ext[1] };
  let hover = 0, tx = 0, ty = 0, spin = 0, speed = 0, pointer = null, frame = 0, last = 0, visible = true;

  function schedule() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); }
  function draw(now) {
    frame = 0;
    const dt = Math.min(64, last ? now - last : 16);
    last = now;
    const w0 = canvas.clientWidth, h0 = canvas.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (!w0 || !h0) { last = 0; return; }
    const w = Math.round(w0 * dpr), h = Math.round(h0 * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

    let busy = false;
    const goal = target(), ease = 1 - Math.exp(-dt / 110);
    const toward = (key, value) => { cur[key] += (value - cur[key]) * ease; if (Math.abs(value - cur[key]) > .002) busy = true; else cur[key] = value; };
    toward('recX', goal.recX); toward('recZ', goal.recZ); toward('rec2X', goal.rec2X); toward('rec2Z', goal.rec2Z); toward('disc2', goal.disc2); toward('sleeve', goal.sleeve); toward('gate', goal.gate);
    toward('size', goal.size); toward('extX', goal.ext[0]); toward('extY', goal.ext[1]);
    const on = pointer ? 1 : 0, hEase = 1 - Math.exp(-dt / 140);
    hover += (on - hover) * hEase;
    tx += ((pointer ? pointer.x : 0) - tx) * hEase;
    ty += ((pointer ? pointer.y : 0) - ty) * hEase;
    if (!reduceMotion.matches) {
      speed += (on * 2.2 * (figure.dataset.rpm === '45' ? 1.35 : 1) - speed) * (1 - Math.exp(-dt / (on ? 260 : 900))); // spins up fast, coasts down
      spin = (spin + speed * dt / 1000) % (Math.PI * 2);
    }
    if (Math.abs(hover - on) > .002 || Math.abs(tx) + Math.abs(ty) > .002 && !pointer || speed > .01) busy = true;

    // Fit the 12" scene to the stage; a 7" record and its sleeve are smaller inside the same frame. The canvas
    // bleeds past the stage on every side (centred on it), so tilted or wide scenes are never cut at its edge.
    const sw = stage.clientWidth || w0, sh = stage.clientHeight || h0;
    const aspect = w0 / h0, fit = .9 * Math.min(halfHeight * (sw / sh) / cur.extX, halfHeight / cur.extY) * (sh / h0);
    const group = flat
      ? M4.scale(fit * cur.size)
      : M4.mul(M4.rotX(BASE_PITCH - .22 * ty * hover), M4.rotY(BASE_YAW + .32 * tx * hover), M4.scale(fit * cur.size));

    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(u.proj, false, M4.perspective(FOV, aspect, .1, 30));
    gl.uniform1f(u.flatMode, flat ? 1 : 0);
    gl.uniform1f(u.paper, paper);
    gl.uniform1f(u.ink, ink);
    gl.uniform1f(u.seed, 3.7);
    const put = model => { gl.uniformMatrix4fv(u.model, false, model); gl.uniformMatrix3fv(u.normal, false, M4.normal(model)); };

    // Soft contact shadow under the whole scene; it lightens as the record lifts.
    if (!flat) {
      useMesh(shadowMesh);
      gl.depthMask(false);
      gl.uniform1f(u.mode, 1);
      const sw = fit * cur.size * (cur.extX * .92), sy = FLOOR * fit * cur.size;
      gl.uniformMatrix4fv(u.model, false, M4.mul(M4.translate(0, sy, -.3), M4.scale(sw, .12 * fit * cur.size, 1)));
      gl.uniform1f(u.shadow, .26 * (1 - .3 * hover));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.depthMask(true);
    }

    // Sleeves: a normal sleeve in front of the record, or a gatefold opened like a book, spine toward the viewer.
    // Settled sleeves go before the record; ones fading in or out go after it, without writing depth.
    const drawSleeves = settled => {
      const show = p => settled ? p > .99 : p > .01 && p <= .99;
      if (!show(cur.sleeve) && !show(cur.gate)) return;
      useMesh(boxMesh);
      gl.uniform1f(u.mode, 2);
      gl.uniform3fv(u.box, [SIDE, SIDE, THICK]);
      gl.depthMask(settled);
      if (show(cur.sleeve)) {
        gl.uniform3fv(u.vinyl, rgb(SLEEVE));
        gl.uniform1f(u.fade, 1 - cur.sleeve);
        put(M4.mul(group, M4.translate(-.42 - .06 * hover, 0, .02), M4.scale(.85 + .15 * cur.sleeve)));
        gl.drawElements(gl.TRIANGLES, boxMesh.count, gl.UNSIGNED_SHORT, 0);
      }
      if (show(cur.gate)) {
        gl.uniform3fv(u.vinyl, rgb(GATEFOLD));
        gl.uniform1f(u.fade, 1 - cur.gate);
        const open = flat ? 0 : .34 - .2 * hover, k = .85 + .15 * cur.gate; // hovering opens it flatter
        for (const side of [-1, 1]) {
          put(M4.mul(group, M4.scale(k), M4.rotY(side * open), M4.translate(side * (SIDE + .004), 0, -THICK)));
          gl.drawElements(gl.TRIANGLES, boxMesh.count, gl.UNSIGNED_SHORT, 0);
        }
      }
      gl.uniform1f(u.fade, 0);
      gl.depthMask(true);
    };
    drawSleeves(true);

    // The record: lifts, slides out of its sleeve, tilts toward the pointer and spins on hover.
    useMesh(recordMesh);
    gl.uniform1f(u.mode, 0);
    const [hex, finish] = LOOKS[figure.dataset.color] || LOOKS.black;
    const vinyl = rgb(hex), label = rgb(LABEL);
    const dots = Math.abs(luma(vinyl) - luma(label)) > .18 ? label : luma(vinyl) > .5 ? [.08, .08, .07] : [.95, .95, .93];
    gl.uniform3fv(u.vinyl, vinyl);
    gl.uniform3fv(u.label, label);
    gl.uniform3fv(u.dots, dots);
    gl.uniform1f(u.finish, FINISHES[finish]);
    const free = Math.max(0, 1 - cur.sleeve - cur.gate); // a sleeved record only tilts with the scene
    const slide = .32 * cur.sleeve * hover, rise = .08 * hover * free + .12 * cur.gate * hover, recScale = 1 + .05 * hover;
    const drawRecord = (x, z, scale, turn) => {
      const recModel = flat
        ? M4.mul(group, M4.translate(x, .05 * hover, z), M4.rotZ(-turn), M4.scale(scale))
        : M4.mul(group, M4.translate(x + slide, .05 * hover, z + rise),
          M4.rotX(-.18 * ty * hover * free), M4.rotY(.3 * tx * hover * free), M4.rotZ(-turn), M4.scale(recScale * scale));
      put(recModel);
      gl.uniform1f(u.px, 1.3 * 2 * halfHeight / (fit * cur.size * recScale * scale) / h);
      if (finish === 'clear' || finish === 'smoked') {
        gl.uniform1f(u.pass, 1); gl.drawElements(gl.TRIANGLES, recordMesh.count, gl.UNSIGNED_SHORT, 0);
        gl.uniform1f(u.pass, 2); gl.drawElements(gl.TRIANGLES, recordMesh.count, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.uniform1f(u.pass, 0); gl.drawElements(gl.TRIANGLES, recordMesh.count, gl.UNSIGNED_SHORT, 0);
      }
    };
    // The second disc of a double grows in from behind the first, then the first is drawn over it.
    if (cur.disc2 > .01) drawRecord(cur.rec2X, cur.rec2Z, .6 + .4 * cur.disc2, spin + 1.3);
    drawRecord(cur.recX, cur.recZ, 1, spin);
    drawSleeves(false);
    if (busy) schedule(); else last = 0;
  }

  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    pointer = { x: Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)), y: Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1)) };
    schedule();
  });
  stage.addEventListener('pointerleave', () => { pointer = null; schedule(); });
  new MutationObserver(schedule).observe(figure, { attributes: true, attributeFilter: ['data-sleeve', 'data-record', 'data-color', 'data-discs', 'data-rpm'] });
  new ResizeObserver(schedule).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }).observe(stage);
  document.addEventListener('visibilitychange', schedule);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); figure.classList.remove('is-3d'); canvas.remove(); });
  readTheme();
})();

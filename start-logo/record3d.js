// Start vinyl selector, after Record Studio's records: a lathed disc with a raised label, sunken groove
// field and rounded lip, in solid, splatter, clear and smoked finishes. The chosen color pair sits in
// front; the neighbouring pairs wait smaller and further back on either side, like a game character
// select. Dragging, clicking a side record or the arrow keys scroll through the same pairs as the
// Colorize button, shared with the logo and wordmark. Hovering a record lifts it, tilts it toward the
// pointer and sets it spinning.
window.BLOB_START_RECORD = function(host, M4, recordAt, stepPalette) {
  const canvas = host.querySelector('canvas'), fallback = host.querySelector('.start-record__fallback');
  const BASE_YAW = -.22, BASE_PITCH = -.30, CAMERA = 4.2, FOV = .65, RADIUS = 1, FLOOR = -1.13;
  const FINISHES = { solid: 0, splatter: 1, clear: 2, smoked: 3 };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // pos is the carousel position relative to the chosen pair: 0 = centred, 1 = next pair centred.
  let pos = 0, pitch = BASE_PITCH, drag = null, anim = null, visible = true, frame = 0, ready = false;
  let pointer = null, hovered = null, last = 0;
  // 2D view (shared with the logos): face-on discs, flat colors, a thin outline and no shadows.
  let flat = document.documentElement.dataset.viewMode === '2d';
  document.addEventListener('blob:viewmode', e => { flat = e.detail === '2d'; schedule(); });
  // Page paper (distance haze) and ink (2D outlines) come from the theme.
  let paper = .95, ink = .08;
  const readTheme = () => {
    const css = getComputedStyle(host);
    const num = (name, fallback) => { const v = parseFloat(css.getPropertyValue(name)); return Number.isNaN(v) ? fallback : v; };
    paper = num('--record-paper', .95);
    ink = num('--record-ink', .08);
    schedule();
  };
  document.addEventListener('blob:theme', readTheme);
  const motion = new Map(); // per relative pair: hover amount, tilt and spin
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });

  // Wider canvases spread the records out and show a third pair on each side.
  let spread = 1, SLOTS = 2;
  const layout = rect => { const aspect = rect.width / (rect.height || 1); spread = Math.max(1, Math.min(1.75, aspect / 2.1)); SLOTS = aspect > 3.1 ? 3 : 2; };
  // Where a record sits for a slot distance s (0 = front and centre, ±1 = first neighbours…).
  const slot = s => {
    const a = Math.abs(s), dir = Math.sign(s), near = Math.min(a, 1), far = Math.max(a - 1, 0);
    return {
      x: dir * (2.35 * (1 + (spread - 1) * .3) * near + 1.4 * (1 + (spread - 1) * 1.9) * far), // extra width mostly goes between the side records
      z: -(1.5 * near + 1.2 * far),
      yaw: BASE_YAW - Math.max(-1, Math.min(1, s)) * .55, // side records turn toward the centre
      fade: Math.min(.5, Math.max(0, a - .15) * .22),
      scale: 1 - .2 * near - .08 * far, // on top of the perspective shrink
    };
  };
  const halfHeight = CAMERA * Math.tan(FOV / 2);
  // Screen position (px from the canvas centre) and radius of a slot's record.
  const project = (s, rect) => {
    layout(rect);
    const p = slot(s), k = CAMERA / (CAMERA - p.z), unit = rect.height / 2 / halfHeight;
    return { x: p.x * k * unit, r: RADIUS * p.scale * k * unit };
  };
  // The pair under a canvas point (px from the centre), front-most first, or null.
  const pick = (x, y, rect) => {
    const ks = [];
    for (let k = Math.round(pos) - SLOTS; k <= Math.round(pos) + SLOTS; k++) ks.push(k);
    ks.sort((a, b) => Math.abs(a - pos) - Math.abs(b - pos));
    return ks.find(k => { const p = project(k - pos, rect); return Math.hypot(x - p.x, y * 1.15) < p.r * .95; }) ?? null;
  };
  const stateOf = k => { if (!motion.has(k)) motion.set(k, { hover: 0, tx: 0, ty: 0, spin: 0, speed: 0 }); return motion.get(k); };

  const rgb = hex => hex.match(/\w\w/g).map(v => parseInt(v, 16) / 255);
  const luma = c => .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  const update = () => {
    const { vinyl, label } = recordAt(0);
    host.style.setProperty('--vinyl', vinyl);
    host.style.setProperty('--label', label);
    host.dataset.vinyl = vinyl;
    host.dataset.label = label;
    schedule();
  };

  const M = {
    scale(x, y = x, z = x) { const m = M4.ident(); m[0] = x; m[5] = y; m[10] = z; return m; },
    rotZ(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; },
  };

  function schedule() { if (ready && !frame && visible && !document.hidden) frame = requestAnimationFrame(draw); }
  function draw(now) {
    frame = 0;
    const dt = Math.min(64, last ? now - last : 16);
    last = now;
    let busy = false;
    if (anim) {
      const t = anim.duration ? Math.min(1, (now - anim.start) / anim.duration) : 1, e = 1 - Math.pow(1 - t, 3);
      pos = anim.from + (anim.to - anim.from) * e;
      pitch = anim.pitch + (BASE_PITCH - anim.pitch) * e;
      if (t >= 1) {
        const steps = Math.round(anim.to);
        anim = null;
        pos = 0; // the chosen pair moves on, so the carousel looks the same from 0
        if (steps) {
          const shifted = [...motion].map(([k, m]) => [k - steps, m]);
          motion.clear();
          shifted.forEach(([k, m]) => motion.set(k, m));
          stepPalette(steps);
        }
      } else busy = true;
    }
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    if (!rect.width || !rect.height) { last = 0; return; }
    const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

    layout(rect);
    hovered = pointer && !drag ? pick(pointer.x, pointer.y, rect) : null;
    host.classList.toggle('is-picking', hovered !== null && hovered !== Math.round(pos));

    const items = [];
    for (let k = Math.round(pos) - SLOTS - 1; k <= Math.round(pos) + SLOTS + 1; k++) {
      const s = k - pos;
      if (Math.abs(s) > SLOTS + .6) { motion.delete(k); continue; }
      const p = slot(s), m = stateOf(k), on = k === hovered ? 1 : 0, ease = 1 - Math.exp(-dt / 140);
      m.hover += (on - m.hover) * ease;
      if (on && pointer) {
        const c = project(s, rect);
        m.tx += (Math.max(-1, Math.min(1, (pointer.x - c.x) / c.r)) - m.tx) * ease;
        m.ty += (Math.max(-1, Math.min(1, pointer.y / c.r)) - m.ty) * ease;
      } else { m.tx -= m.tx * ease; m.ty -= m.ty * ease; }
      if (!reduceMotion.matches) { // the hover spin is ambient motion, so it respects the setting
        m.speed += (on * 2.2 - m.speed) * (1 - Math.exp(-dt / (on ? 260 : 900))); // spins up fast, coasts down
        m.spin = (m.spin + m.speed * dt / 1000) % (Math.PI * 2);
      }
      if (Math.abs(m.hover - on) > .002 || Math.abs(m.tx) + Math.abs(m.ty) > .002 || m.speed > .01) busy = true;
      items.push({ p, m, look: recordAt(k) });
    }
    items.sort((a, b) => a.p.z - b.p.z); // back to front, for the see-through finishes

    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(u.proj, false, M4.perspective(FOV, rect.width / rect.height, .1, 30));

    gl.uniform1f(u.flatMode, flat ? 1 : 0);
    gl.uniform1f(u.paper, paper);
    gl.uniform1f(u.ink, ink);
    // Soft contact shadows on an imaginary floor; they shrink and lighten as a record lifts.
    useMesh(shadowMesh);
    gl.depthMask(false);
    gl.uniform1f(u.mode, 1);
    for (const { p, m } of flat ? [] : items) {
      const lift = m.hover;
      gl.uniformMatrix4fv(u.model, false, M4.mul(M4.translate(p.x, FLOOR * p.scale, p.z - .1), M.scale(p.scale * (1 - .14 * lift), p.scale * .13 * (1 - .2 * lift), 1)));
      gl.uniform1f(u.shadow, .3 * (1 - p.fade * 1.4) * (1 - .45 * lift));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.depthMask(true);
    gl.uniform1f(u.mode, 0);

    useMesh(recordMesh);
    for (const { p, m, look } of items) {
      const size = p.scale * (1 + .06 * m.hover);
      const model = flat
        ? M4.mul(M4.translate(p.x, .07 * m.hover * p.scale, p.z), M.rotZ(-m.spin), M.scale(size))
        : M4.mul(
          M4.translate(p.x, .07 * m.hover * p.scale, p.z),
          M4.rotX(pitch - .28 * m.ty * m.hover),
          M4.rotY(p.yaw + .4 * m.tx * m.hover),
          M.rotZ(-m.spin),
          M.scale(size),
        );
      const vinyl = rgb(look.vinyl), label = rgb(look.label);
      // Splatter dots take the label color, or ink when it would vanish into the vinyl.
      const dots = Math.abs(luma(vinyl) - luma(label)) > .18 ? label : luma(vinyl) > .5 ? [.08, .08, .07] : [.95, .95, .93];
      gl.uniformMatrix4fv(u.model, false, model);
      gl.uniformMatrix3fv(u.normal, false, M4.normal(model)); // uniform scale: the shader renormalises
      gl.uniform3fv(u.vinyl, vinyl);
      gl.uniform3fv(u.label, label);
      gl.uniform3fv(u.dots, dots);
      gl.uniform1f(u.finish, FINISHES[look.finish] || 0);
      gl.uniform1f(u.fade, p.fade);
      gl.uniform1f(u.seed, ((look.index + 2) * 7.31) % 13);
      // Model units per device pixel at this depth, with slack for the tilt.
      gl.uniform1f(u.px, 1.3 * 2 * halfHeight * (CAMERA - p.z) / CAMERA / size / h);
      if (look.finish === 'clear' || look.finish === 'smoked') {
        gl.uniform1f(u.pass, 1); gl.drawElements(gl.TRIANGLES, recordMesh.count, gl.UNSIGNED_SHORT, 0);
        gl.uniform1f(u.pass, 2); gl.drawElements(gl.TRIANGLES, recordMesh.count, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.uniform1f(u.pass, 0); gl.drawElements(gl.TRIANGLES, recordMesh.count, gl.UNSIGNED_SHORT, 0);
      }
    }
    if (busy) schedule(); else last = 0;
  }
  function animate(to, duration) {
    anim = { from: pos, to, pitch, duration, start: performance.now() }; // user-started and brief, so it runs even with reduced motion
    schedule();
  }
  // Scroll by n pairs; repeated presses add up instead of restarting.
  function go(n) {
    if (!ready) { stepPalette(n); return; }
    const to = Math.max(-4, Math.min(4, Math.round(anim ? anim.to : pos) + n));
    animate(to, 260 + 140 * Math.min(3, Math.abs(to - pos)));
  }

  let u, recordMesh, shadowMesh, attribs;
  function useMesh(mesh) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb);
    for (const [a, off] of attribs) gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 24, off);
    if (mesh.ib) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
  }
  if (gl) {
    try {
      const vs = 'attribute vec3 pos,nrm;uniform mat4 model,proj;uniform mat3 normal;varying vec3 N,P,L,G;void main(){L=pos;G=nrm;vec4 p=model*vec4(pos,1.);p.z-=' + CAMERA.toFixed(2) + ';P=p.xyz;N=normal*nrm;gl_Position=proj*p;}';
      const fs = `precision highp float;varying vec3 N,P,L,G;
      uniform vec3 vinyl,label,dots;uniform mat3 normal;uniform float px,fade,finish,pass,mode,shadow,seed,flatMode,paper,ink;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+17.;a*=.5;}return v;}
      // Round drops scattered on a jittered grid; density is the share of cells holding one.
      float splat(vec2 p,float cell,float density){vec2 g=p/cell,i=floor(g),f=fract(g);float d=9.;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y)),c=i+o+seed;
          if(hash(c)>density)continue;
          vec2 q=o+vec2(hash(c+3.1),hash(c+7.7))-f;d=min(d,length(q)/(.1+.32*hash(c+1.3)));}
        return 1.-smoothstep(.8,1.,d);}
      void main(){
        if(mode>.5){float s=1.-smoothstep(.1,1.,length(L.xy));gl_FragColor=vec4(0.,0.,0.,1.)*s*s*shadow;return;}
        vec3 n=normalize(N),v=normalize(-P);float facing=dot(n,v);
        if(pass>.5&&pass<1.5&&facing>0.)discard;
        if(pass>1.5&&facing<=0.)discard;
        if(facing<0.)n=-n;
        float r=length(L.xy);bool face=abs(G.z)>.7;
        vec3 l1=normalize(vec3(-.5,.85,1.)),l2=normalize(vec3(.8,.15,.6));
        float d1=max(dot(n,l1),0.),d2=max(dot(n,l2),0.),fres=pow(1.-max(dot(n,v),0.),4.);
        float gloss=pow(max(dot(n,normalize(l1+v)),0.),160.)+.4*pow(max(dot(n,normalize(l2+v)),0.),90.);
        vec3 base=vinyl;float alpha=1.,h=0.;
        if(face&&r<.334){
          base=label;
          if(abs(r-.305)<.0025||abs(r-.07)<.002)base*=.8; // printed rings
          h=.14*gloss+.04*fres; // satin paper
        }else{
          if(finish>.5&&finish<1.5){base=mix(base,dots,splat(L.xy,.09,.3));base=mix(base,dots,splat(L.xy+5.3,.034,.22));}
          else if(finish>1.5&&finish<2.5){ // clear: see-through in 3D; in 2D its true color, slightly see-through
            if(flatMode>.5){alpha=.8;}else{base=mix(vinyl,vec3(1.),.22);alpha=.38;}
          }
          else if(finish>2.5){
            float a=r*5.5+seed;vec2 q=mat2(cos(a),sin(a),-sin(a),cos(a))*L.xy; // swirled smoke
            float wisp=smoothstep(.4,.68,fbm(q*2.4+seed));
            base=mix(mix(vinyl,vec3(1.),.15),vinyl*.16+.03,wisp);alpha=mix(.5,.94,wisp);
          }
          float groove=.14;
          if(face&&r>.338&&r<.95){
            groove=.48+.35*clamp(1.-px*900.,0.,1.)*sin(r*1800.)+.17*clamp(1.-px*485.,0.,1.)*sin(r*971.); // fade grooves finer than a pixel
            if(abs(fract((r-.442)/.0855)-.5)<.035||r<.442)groove=.14;
          }
          vec3 t=normalize(normal*vec3(-L.y,L.x,0.));float t1=dot(t,normalize(l1+v)),t2=dot(t,normalize(l2+v));
          float aniso=(pow(max(1.-t1*t1,0.),28.)+.45*pow(max(1.-t2*t2,0.),28.))*groove;
          h=.34*aniso+.3*gloss+.07*fres;
          if(r>.985){base*=.42;alpha=mix(alpha,1.,.75);} // dark outer edge keeps light discs readable
          else if(!face)alpha=mix(alpha,1.,.5); // walls look through more plastic
        }
        vec3 c=clamp(base*(.56+.32*d1+.14*d2)+h,0.,1.);
        if(flatMode>.5){ // 2D: flat fills, printed groove rings and a thin ink outline
          c=base;
          if(face&&r>.36&&r<.95&&abs(fract(r*11.)-.5)<.06)c*=.86;
          if(r>.978||abs(r-.334)<.004){c=vec3(ink);alpha=1.;}
        }
        if(flatMode<.5){ // 3D only: 2D records keep their exact palette colors
          alpha=clamp(alpha+h*.7,0.,1.); // highlights stay bright on clear vinyl
          c=mix(c,vec3(paper),fade); // distance haze toward the page paper
        }
        gl_FragColor=vec4(c*alpha,alpha);
      }`;
      const shader = (type, source) => { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; };
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vs));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      u = Object.fromEntries(['model', 'proj', 'normal', 'vinyl', 'label', 'dots', 'px', 'fade', 'finish', 'pass', 'mode', 'shadow', 'seed', 'flatMode', 'paper', 'ink'].map(n => [n, gl.getUniformLocation(program, n)]));
      attribs = [['pos', 0], ['nrm', 12]].map(([name, off]) => { const a = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(a); return [a, off]; });

      // Lathe profile (radius, height, normal): raised label, sunken groove field, lip and rounded edge.
      const LABEL = .024, FIELD = .017, LIP = .021, EDGE = .97, HOLE = .023;
      const seg = (a, b) => { const dr = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dr, dz); return [[a[0], a[1], -dz / l, dr / l], [b[0], b[1], -dz / l, dr / l]]; };
      const top = [seg([HOLE, LABEL], [.33, LABEL]), seg([.33, LABEL], [.338, FIELD]), seg([.338, FIELD], [.95, FIELD]), seg([.95, FIELD], [EDGE, LIP])];
      const strips = [...top, ...top.map(s => s.map(([r, z, nr, nz]) => [r, -z, nr, -nz]))];
      const arc = [];
      for (let i = 0; i <= 14; i++) {
        const t = Math.PI / 2 - i / 14 * Math.PI, c = Math.cos(t), s = Math.sin(t), nr = c / (RADIUS - EDGE), nz = s / LIP, l = Math.hypot(nr, nz);
        arc.push([EDGE + (RADIUS - EDGE) * c, LIP * s, nr / l, nz / l]);
      }
      strips.push(arc, [[HOLE, LABEL, -1, 0], [HOLE, -LABEL, -1, 0]]);
      const vertices = [], indices = [], K = 160;
      for (const strip of strips) {
        const b = vertices.length / 6, m = strip.length;
        for (let k = 0; k <= K; k++) {
          const a = k / K * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
          for (const [r, z, nr, nz] of strip) vertices.push(c * r, s * r, z, c * nr, s * nr, nz);
        }
        for (let k = 0; k < K; k++) for (let j = 0; j < m - 1; j++) { const a = b + k * m + j, c = a + m; indices.push(a, c, c + 1, a, c + 1, a + 1); }
      }
      const buffer = (target, data) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; };
      recordMesh = { vb: buffer(gl.ARRAY_BUFFER, new Float32Array(vertices)), ib: buffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)), count: indices.length };
      shadowMesh = { vb: buffer(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 0, 1, 1, -1, 0, 0, 0, 1, -1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1])) };
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      ready = true;
      fallback.hidden = true;
      new ResizeObserver(schedule).observe(canvas);
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }).observe(host);
      document.addEventListener('visibilitychange', schedule);
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); ready = false; canvas.hidden = true; fallback.hidden = false; host.dataset.renderError = 'WebGL context lost'; });
    } catch (error) { canvas.hidden = true; fallback.hidden = false; host.dataset.renderError = error.message; }
  } else { canvas.hidden = true; host.dataset.renderError = 'WebGL unavailable'; }

  const local = (e, rect) => ({ x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 });
  // Pixels of drag that move the carousel by one pair.
  const slotWidth = rect => Math.max(40, project(1, rect).x);
  host.addEventListener('pointerdown', e => {
    if (e.button !== 0 || drag) return;
    if (anim) { pos = anim.from + (anim.to - anim.from) * Math.min(1, (performance.now() - anim.start) / (anim.duration || 1)); anim = null; }
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos, moved: false, vx: 0, lastX: e.clientX, lastT: e.timeStamp };
    host.setPointerCapture(e.pointerId);
    host.classList.add('is-dragging');
    schedule();
  });
  host.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    if (e.pointerType === 'mouse') { pointer = local(e, rect); schedule(); }
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
    if (e.timeStamp > drag.lastT) { drag.vx = (e.clientX - drag.lastX) / (e.timeStamp - drag.lastT); drag.lastX = e.clientX; drag.lastT = e.timeStamp; }
    pos = Math.max(-4, Math.min(4, drag.pos - dx / slotWidth(rect)));
    pitch = BASE_PITCH + Math.max(-.4, Math.min(.4, dy / 250));
    schedule();
  });
  host.addEventListener('pointerleave', () => { pointer = null; schedule(); });
  const end = e => {
    if (!drag || drag.id !== e.pointerId) return;
    const rect = canvas.getBoundingClientRect(), moved = drag.moved, vx = drag.vx;
    drag = null;
    host.classList.remove('is-dragging');
    if (!moved && e.type === 'pointerup') {
      // A click on a side record picks it; front-most records win where they overlap.
      const p = local(e, rect), hit = pick(p.x, p.y, rect);
      if (hit !== null && hit !== Math.round(pos)) { go(hit - Math.round(pos)); return; }
    }
    const fling = Math.max(-1, Math.min(1, -vx * 90 / slotWidth(rect)));
    animate(Math.max(-4, Math.min(4, Math.round(pos + fling))), 320);
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => host.addEventListener(type, end));
  host.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    if (!drag) go(e.key === 'ArrowRight' ? 1 : -1);
  });
  readTheme();
  update();
  return update;
};

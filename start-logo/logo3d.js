// Spinning 3D BLOB logo for the Start window.
// Mesh, shaders and lighting come from Blob Logo Studio (“Original polished” preset), trimmed to the
// logo only. The static image stays visible until the mesh has loaded, and is kept when WebGL is
// unavailable.
(() => {
  'use strict';

  const hosts = [...document.querySelectorAll('[data-logo3d]')];
  if (!hosts.length) return;

  const MESH_URL = './start-logo/logo-mesh.bin';
  // logo-mesh.bin holds the “logo” block of Blob Logo Studio's #mesh-data.
  const META = {
    min: [-49.9567099, -30.061143, 0],
    max: [49.9974444, 30.0604216, 6.5],
    body: [0, 193530],
    top: [193530, 3066],
    position: [0, 98304],
    normal: [196608, 98304],
    index: [393216, 196596],
  };
  const TEXT_META = {"min":[-50,-16.0544558,0],"max":[50,16.0544558,6.5],"body":[0,3294],"top":[3294,2850],"position":[0,5772],"normal":[11544,5772],"index":[23088,6144]};
  const LOOK = {
    surface: [1, 1, 1],
    body: [0.025, 0.025, 0.025],
    rim: [0.72, 0.72, 0.72],
    shadow: [0, 0, 0],
    gloss: [1, 1, 1],
    reflection: 0.28,
    shadows: 1,
    glossAmount: 0.38,
    realism: 0.8, // soft studio reflections on the rounded walls
  };
  const LOGO_TILT = (-62 * Math.PI) / 180;
  const FOV = (20 * Math.PI) / 180;
  // Coordinated face colors with black borders in both views.
  const palettes = [
    ['#b8ff1a', '#ac8cff'],
    ['#eeff00', '#00ff7b'],
    ['#000000', '#ffffff'],
    ['#808080', '#e58261'],
    ['#27bfdd', '#c4bf1c'],
    ['#16d095', '#000000'],
    ['#eb0000', '#eeff00'],
    ['#ffffff', '#ffffff'],
  ];
  // Every page opens with white text and a green logo. Both views share these faces.
  let palette = -1;
  const defaultColors = ['#ffffff', '#b8ff1a'];
  const faceColors = () => palette < 0 ? defaultColors : palettes[palette];
  const flatArtwork = ["<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-18 -18 1810 606\" role=\"img\" aria-label=\"BLOB\"><g id=\"text-artwork\" ><linearGradient id=\"text-rim\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffffff\"/><stop offset=\"0.3\" stop-color=\"#ffffff\"/><stop offset=\"0.55\" stop-color=\"#ffffff\"/><stop offset=\"0.76\" stop-color=\"#ffffff\"/><stop offset=\"1\" stop-color=\"#ffffff\"/></linearGradient><g id=\"text-border\" fill=\"#000000\" stroke-linejoin=\"miter\" stroke-width=\"25.34285714285714\" stroke=\"#000000\">\n    <g id=\"border-letter-b-first\" transform=\"translate(0 0)\">\n      <path id=\"border-b-first-stem-and-bowl\" d=\"M0 0H63.36V190.07H190.07V253.43H126.71V316.79H63.36V380.14H126.71V506.86H316.79V443.5H380.14V570.21H0Z\"/>\n      <path id=\"border-b-first-upper-right\" d=\"M253.43 190.07H380.14V253.43H443.5V443.5H380.14V316.79H316.79V253.43H253.43Z\"/>\n    </g>\n    <g id=\"border-letter-l\" transform=\"translate(0 0)\">\n      <path d=\"M570.21 0H633.57V506.86H696.93V570.21H570.21Z\"/>\n    </g>\n    <g id=\"border-letter-o\" transform=\"translate(0 0)\">\n      <path id=\"border-o-upper-left\" d=\"M823.64 190.07H1140.43V253.43H887V506.86H823.64Z\"/>\n      <path id=\"border-o-lower-right\" d=\"M1140.43 253.43H1203.79V506.86H1140.43V570.21H887V506.86H1077.07V443.5H1140.43Z\"/>\n    </g>\n    <g id=\"border-letter-b-last\" transform=\"translate(0 0)\">\n      <path d=\"M1330.5 0H1393.86V190.07H1520.57V253.43H1457.21V316.79H1393.86V443.5H1457.21V506.86H1647.29V380.14H1710.64V316.79H1647.29V253.43H1583.93V190.07H1710.64V253.43H1774V443.5H1710.64V570.21H1330.5Z\"/>\n    </g>\n  </g><g id=\"editable-wordmark\" fill=\"__FACE__\">\n    <g id=\"editable-letter-b-first\" transform=\"translate(0 0)\">\n      <path id=\"editable-b-first-stem-and-bowl\" d=\"M0 0H63.36V190.07H190.07V253.43H126.71V316.79H63.36V380.14H126.71V506.86H316.79V443.5H380.14V570.21H0Z\"/>\n      <path id=\"editable-b-first-upper-right\" d=\"M253.43 190.07H380.14V253.43H443.5V443.5H380.14V316.79H316.79V253.43H253.43Z\"/>\n    </g>\n    <g id=\"editable-letter-l\" transform=\"translate(0 0)\">\n      <path d=\"M570.21 0H633.57V506.86H696.93V570.21H570.21Z\"/>\n    </g>\n    <g id=\"editable-letter-o\" transform=\"translate(0 0)\">\n      <path id=\"editable-o-upper-left\" d=\"M823.64 190.07H1140.43V253.43H887V506.86H823.64Z\"/>\n      <path id=\"editable-o-lower-right\" d=\"M1140.43 253.43H1203.79V506.86H1140.43V570.21H887V506.86H1077.07V443.5H1140.43Z\"/>\n    </g>\n    <g id=\"editable-letter-b-last\" transform=\"translate(0 0)\">\n      <path d=\"M1330.5 0H1393.86V190.07H1520.57V253.43H1457.21V316.79H1393.86V443.5H1457.21V506.86H1647.29V380.14H1710.64V316.79H1647.29V253.43H1583.93V190.07H1710.64V253.43H1774V443.5H1710.64V570.21H1330.5Z\"/>\n    </g>\n  </g></g></svg>","﻿<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\" viewBox=\"0 0 1774 887\" role=\"img\" aria-labelledby=\"title desc\" width=\"1774\" height=\"887\">\r\n  <title id=\"title\">My blob</title>\r\n  <desc id=\"desc\">Logo-only artwork from the supplied Blob Logo Studio SVG.</desc>\r\n  <defs>\r\n    <linearGradient id=\"side\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\r\n      <stop offset=\"0\" stop-color=\"#060606\" />\r\n      <stop offset=\".45\" stop-color=\"#030303\" />\r\n      <stop offset=\".76\" stop-color=\"#000000\" />\r\n      <stop offset=\"1\" stop-color=\"#0d0d0d\" />\r\n    </linearGradient>\r\n    <linearGradient id=\"top\" x1=\"0\" y1=\"0\" x2=\".38\" y2=\"1\">\r\n      <stop stop-color=\"#b8ff1a\" />\r\n      <stop offset=\".55\" stop-color=\"#b8ff1a\" />\r\n      <stop offset=\"1\" stop-color=\"#b4f919\" />\r\n    </linearGradient>\r\n    <linearGradient id=\"rim\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\r\n      <stop stop-color=\"#252525\" />\r\n      <stop offset=\".30\" stop-color=\"#c8c8c8\" />\r\n      <stop offset=\".55\" stop-color=\"#ffffff\" />\r\n      <stop offset=\".76\" stop-color=\"#e4e4e4\" />\r\n      <stop offset=\"1\" stop-color=\"#555555\" />\r\n    </linearGradient>\r\n    <linearGradient id=\"bevelLeft\" x1=\".1\" y1=\".4\" x2=\".7\" y2=\".9\">\r\n      <stop stop-color=\"#000000\" />\r\n      <stop offset=\".45\" stop-color=\"#393939\" />\r\n      <stop offset=\".61\" stop-color=\"#b7b7b7\" />\r\n      <stop offset=\".75\" stop-color=\"#ffffff\" />\r\n      <stop offset=\"1\" stop-color=\"#f5f5f5\" />\r\n    </linearGradient>\r\n    <linearGradient id=\"bevelRight\" x1=\".85\" y1=\".6\" x2=\".25\" y2=\".5\">\r\n      <stop stop-color=\"#000000\" />\r\n      <stop offset=\".52\" stop-color=\"#131313\" />\r\n      <stop offset=\".78\" stop-color=\"#8b8b8b\" />\r\n      <stop offset=\"1\" stop-color=\"#ffffff\" />\r\n    </linearGradient>\r\n    <linearGradient id=\"softHighlight\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\r\n      <stop stop-color=\"#fff\" />\r\n      <stop offset=\".55\" stop-color=\"#fff\" />\r\n      <stop offset=\"1\" stop-color=\"#fff\" stop-opacity=\"0\" />\r\n    </linearGradient>\r\n  </defs>\r\n  <g id=\"logo-artwork\">\r\n    <g id=\"editor-proportion\" transform=\"translate(887 443.5) scale(1 1) translate(-887 -443.5)\">\r\n      <g id=\"extruded-body\" inkscape:groupmode=\"layer\" inkscape:label=\"01 · Extruded body\" data-name=\"Extruded black body\" fill=\"#000000\">\r\n        <path d=\"M 86,314&#xA; C 83,272 141,242 211,241&#xA; C 275,240 346,257 426,260&#xA; L 424,214&#xA; C 419,177 469,159 524,159&#xA; C 576,159 626,177 673,197&#xA; L 670,150&#xA; C 663,113 714,86 772,86&#xA; C 839,85 902,119 913,165&#xA; C 917,185 953,199 1009,215&#xA; C 1071,233 1125,234 1166,224&#xA; L 1164,200&#xA; C 1156,160 1209,127 1274,127&#xA; C 1341,126 1391,153 1395,195&#xA; L 1391,273&#xA; C 1451,274 1506,256 1571,257&#xA; C 1644,257 1695,288 1696,332&#xA; L 1695,394&#xA; C 1696,441 1657,479 1600,490&#xA; C 1540,503 1476,480 1406,474&#xA; C 1350,469 1292,470 1256,480&#xA; C 1320,485 1408,494 1463,522&#xA; C 1504,543 1527,572 1527,607&#xA; L 1526,656&#xA; C 1523,709 1470,742 1412,756&#xA; C 1335,775 1270,745 1206,707&#xA; C 1146,671 1086,602 1011,626&#xA; L 1012,703&#xA; C 1013,771 935,814 854,824&#xA; C 768,834 654,801 648,730&#xA; L 644,664&#xA; C 640,611 692,575 752,541&#xA; C 700,521 657,510 609,513&#xA; C 544,516 491,542 439,580&#xA; C 380,623 321,648 251,649&#xA; C 172,650 113,619 110,560&#xA; L 108,501&#xA; C 108,474 119,454 140,440&#xA; C 104,426 86,403 86,373 Z\" />\r\n      </g>\r\n      <g id=\"side-reflections\" inkscape:groupmode=\"layer\" inkscape:label=\"02 · Side reflections\" data-name=\"Continuous reflections on the sides\" fill=\"url(#rim)\" opacity=\"0\">\r\n        <path d=\"M 87,340 C 91,376 122,400 179,412 C 141,410 108,398 93,376 C 88,369 86,354 87,340 Z\" />\r\n        <path d=\"M 109,506 C 115,566 173,599 246,599 C 318,599 369,570 430,531 C 490,491 550,472 606,473 C 674,474 733,490 778,509 C 790,514 799,521 804,526 C 792,521 783,520 772,515 C 720,493 665,482 607,482 C 550,481 493,500 435,539 C 374,580 318,608 246,608 C 169,608 114,572 109,524 Z\" />\r\n        <path d=\"M 647,683 C 657,746 732,780 824,781 C 911,782 994,748 1010,688 L 1010,706 C 992,758 912,789 824,789 C 731,788 656,753 649,705 Z\" />\r\n        <path d=\"M 1003,609 C 1076,564 1146,622 1220,669 C 1286,711 1345,724 1408,703 C 1475,682 1516,652 1525,608 L 1526,626 C 1516,664 1475,691 1410,711 C 1345,732 1282,720 1215,677 C 1142,630 1083,575 1017,606 C 1011,608 1007,609 1003,609 Z\" />\r\n        <path d=\"M 1198,460 C 1247,425 1306,428 1380,435 C 1450,442 1533,468 1596,452 C 1651,438 1683,411 1695,373 L 1695,389 C 1684,422 1651,448 1598,460 C 1532,475 1450,450 1379,443 C 1308,436 1249,432 1206,463 Z\" />\r\n        <path d=\"M 425,222 C 427,248 444,264 470,272 C 441,269 426,258 425,240 Z\" opacity=\".8\" />\r\n        <path d=\"M 672,157 C 678,181 688,195 707,209 C 684,201 674,183 672,171 Z\" opacity=\".8\" />\r\n      </g>\r\n      <g id=\"top-face\" inkscape:groupmode=\"layer\" inkscape:label=\"03 · White top face\" data-name=\"Opaque white top surface\" fill=\"__FACE__\">\r\n        <path d=\"M 121,289&#xA; C 143,261 190,249 245,257&#xA; C 391,276 544,292 641,273&#xA; C 679,266 678,254 644,244&#xA; C 594,229 491,235 457,206&#xA; C 447,197 470,188 497,181&#xA; C 560,165 628,185 684,210&#xA; C 734,232 809,237 839,217&#xA; C 868,196 821,174 788,163&#xA; C 749,151 709,148 702,133&#xA; C 696,120 740,104 778,104&#xA; C 827,104 873,124 890,151&#xA; C 901,168 894,179 918,193&#xA; C 975,227 1078,251 1153,246&#xA; C 1200,244 1214,229 1200,218&#xA; C 1180,202 1184,181 1206,164&#xA; C 1242,136 1305,136 1342,155&#xA; C 1366,166 1378,182 1364,199&#xA; C 1345,222 1265,235 1239,252&#xA; C 1222,264 1226,271 1255,279&#xA; C 1326,301 1437,296 1534,280&#xA; C 1616,266 1648,284 1664,310&#xA; C 1680,337 1650,357 1608,360&#xA; C 1549,366 1485,343 1430,334&#xA; C 1322,316 1260,327 1210,357&#xA; C 1171,380 1139,410 1159,436&#xA; C 1189,471 1270,477 1360,490&#xA; C 1445,502 1497,528 1501,571&#xA; C 1506,606 1474,620 1412,620&#xA; C 1334,620 1288,590 1239,552&#xA; C 1184,509 1126,480 1071,483&#xA; C 1015,485 969,500 966,531&#xA; C 963,555 989,603 978,638&#xA; C 969,674 919,687 851,687&#xA; C 770,687 688,672 685,636&#xA; C 681,611 712,584 757,558&#xA; C 800,533 836,514 842,484&#xA; C 850,451 819,419 786,402&#xA; C 727,370 654,362 587,367&#xA; C 504,372 451,412 402,450&#xA; C 350,491 323,514 264,514&#xA; C 209,516 156,505 143,487&#xA; C 126,465 157,443 200,429&#xA; C 269,408 369,391 446,365&#xA; C 491,350 515,336 507,323&#xA; C 495,302 461,306 421,310&#xA; C 349,318 275,326 218,321&#xA; C 161,317 128,310 121,301&#xA; C 115,296 116,294 121,289 Z\" />\r\n      </g>\r\n      <g id=\"rounded-bevel\" inkscape:groupmode=\"layer\" inkscape:label=\"04 · Rounded bevel\" data-name=\"Smooth bevel transitions\" opacity=\"0\">\r\n        <path fill=\"url(#bevelLeft)\" d=\"M 441,432 C 480,396 526,373 587,367 C 654,362 727,370 786,402 C 814,417 834,439 841,463 C 816,443 785,426 750,411 C 690,385 633,378 578,380 C 524,382 475,404 441,432 Z\" />\r\n        <path fill=\"url(#bevelRight)\" d=\"M 1171,398 C 1191,372 1230,346 1285,334 C 1332,324 1381,327 1430,334 C 1371,329 1316,342 1274,359 C 1230,376 1203,396 1171,401 Z\" />\r\n        <path fill=\"url(#bevelLeft)\" d=\"M 996,508 C 1017,489 1044,483 1071,483 C 1126,480 1184,509 1239,552 C 1268,575 1296,594 1324,604 C 1290,600 1253,581 1225,561 C 1170,520 1119,492 1073,493 C 1043,493 1015,498 996,508 Z\" />\r\n        <path fill=\"url(#softHighlight)\" d=\"M 834,441 C 850,457 849,480 839,495 C 833,503 827,508 819,513 C 834,497 838,482 835,468 C 834,457 830,450 834,441 Z\" />\r\n        <path fill=\"url(#softHighlight)\" d=\"M 968,527 C 965,552 979,579 987,608 C 994,631 991,646 981,659 C 987,635 978,613 972,592 C 962,564 959,544 968,527 Z\" />\r\n      </g>\r\n      <g id=\"specular-highlights\" inkscape:groupmode=\"layer\" inkscape:label=\"05 · Gloss highlights\" data-name=\"Gloss highlights\" fill=\"#ffffff\" opacity=\"1\">\r\n        <path d=\"M 114,307 C 121,309 126,314 132,318 C 139,323 145,326 154,330 C 138,330 118,326 111,320 C 104,314 106,308 114,307 Z\" />\r\n        <path d=\"M 140,475 C 138,487 155,499 180,508 L 195,516 C 174,513 151,506 138,497 C 127,489 127,480 140,475 Z\" />\r\n        <path d=\"M 453,209 C 459,210 461,215 468,218 L 478,222 C 465,225 449,220 446,216 C 442,212 446,209 453,209 Z\" />\r\n        <path d=\"M 700,145 C 707,148 712,153 720,157 C 706,162 697,158 693,154 C 686,147 691,142 700,145 Z\" />\r\n        <path d=\"M 681,629 C 679,646 702,665 733,678 C 706,674 686,665 677,653 C 671,644 674,635 681,629 Z\" />\r\n        <path d=\"M 649,244 C 663,246 673,252 670,259 C 667,264 661,267 654,269 C 664,261 662,252 649,244 Z\" />\r\n        <path d=\"M 836,199 C 845,200 848,207 843,212 C 838,217 831,220 824,222 C 833,215 838,207 836,199 Z\" />\r\n      </g>\r\n    </g>\r\n  </g>\r\n</svg>"];
  const syncFlatColors = () => hosts.forEach(host => {
    const side = host.dataset.logo3d === 'text' ? 0 : 1;
    const img = host.querySelector('.hero-logo__img');
    if (img) img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flatArtwork[side].replace('__FACE__', faceColors()[side]));
  });
  const surfaceColor = (isText) => faceColors()[isText ? 0 : 1].match(/[a-f\d]{2}/gi).map(channel => parseInt(channel, 16) / 255);
  syncFlatColors();
  const randomColor = document.getElementById('logoRandomColor');
  let syncRecord = () => {};
  const rememberPalette = () => {
    syncFlatColors();
    syncRecord();
    try { localStorage.setItem('blob-start-logo-palette', String(palette)); } catch (_) {}
  };
  if (randomColor) {
    randomColor.addEventListener('click', () => {
      const available = palettes.map((_, index) => index);
      const alternatives = available.filter(index => index !== palette);
      const choices = alternatives.length ? alternatives : available;
      palette = choices[Math.floor(Math.random() * choices.length)];
      rememberPalette();
    });
  }

  const M4 = {
    ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
    mul(...list) { return list.reduce((a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }); },
    translate(x, y, z) { const m = M4.ident(); m[12] = x; m[13] = y; m[14] = z; return m; },
    rotX(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; },
    rotY(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; },
    perspective(fov, aspect, near, far) { const f = 1 / Math.tan(fov / 2), m = new Float32Array(16); m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = (2 * far * near) / (near - far); return m; },
    normal(m) { // rotation-only model/view: the upper 3×3 is its own inverse transpose
      return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]);
    },
  };

  // Start vinyl selector: each disc takes a logo face color, its label the wordmark's. The selector
  // runs through the opening colors followed by every Colorize pair, wrapping around.
  const recordHost = document.querySelector('.start-record');
  if (recordHost && window.BLOB_START_RECORD) {
    const count = palettes.length + 1; // -1 is the opening pair
    const paletteAt = (offset) => ((palette + 1 + offset) % count + count) % count - 1;
    // Vinyl finish for the opening pair, then for each Colorize pair in order.
    const finishes = ['solid', 'splatter', 'clear', 'smoked', 'solid', 'splatter', 'solid', 'splatter', 'clear'];
    const recordAt = (offset) => {
      const i = paletteAt(offset), [text, logo] = i < 0 ? defaultColors : palettes[i];
      return { vinyl: logo, label: text, finish: finishes[i + 1], index: i };
    };
    const stepPalette = (steps) => { palette = paletteAt(steps); rememberPalette(); };
    syncRecord = window.BLOB_START_RECORD(recordHost, M4, recordAt, stepPalette);
  }

  const VERTEX_SHADER = `
    attribute vec3 aPos;attribute vec3 aNrm;
    uniform mat4 uModel,uView,uProj;uniform mat3 uNormal;uniform vec3 uQMin,uQRange;uniform float uExtrude,uFat,uFatHeight;uniform vec2 uWall;
    varying vec3 vN;varying vec3 vP;varying float vH;
    void main(){
      vec3 p=uQMin+aPos*uQRange,n=aNrm;
      p.z+=uExtrude*clamp((p.z-uWall.x)/(uWall.y-uWall.x),0.,1.);
      // Blob Logo Studio fatness: rounded, fuller walls without extra depth.
      float lxy=length(n.xy);
      if(uFat>0.&&lxy>.001){
        float t=clamp(p.z/uFatHeight,0.,1.),w=smoothstep(.05,.35,lxy);
        p.xy+=n.xy/lxy*uFat*sin(3.14159265*t)*w;
        n=vec3(n.xy,n.z-uFat*3.14159265/uFatHeight*cos(3.14159265*t)*w*lxy);
      }
      vH=p.z;
      vec4 vp=uView*uModel*vec4(p,1.0);vP=vp.xyz;vN=uNormal*n;
      gl_Position=uProj*vp;
    }`;
  const FRAGMENT_SHADER = `
    precision highp float;
    varying vec3 vN;varying vec3 vP;varying float vH;
    uniform float uKind,uReflection,uShadows,uGloss,uHeightScale,uRealism;
    uniform vec3 uColor,uRim,uShadow,uGlossColor,uUp,uL1,uL2;
    float rimShade(float t){
      float s=mix(.145,.784,smoothstep(0.,.30,t));
      s=mix(s,1.,smoothstep(.30,.55,t));s=mix(s,.894,smoothstep(.55,.76,t));
      return mix(s,.333,smoothstep(.76,1.,t));
    }
    float studio(float y){
      float floorLight=.06+.14*smoothstep(-.6,0.,y);
      float strip=smoothstep(.02,.16,y)*(1.-smoothstep(.3,.46,y));
      float softbox=smoothstep(.55,.9,y);
      return clamp(floorLight+.95*strip+.2*smoothstep(.1,.5,y)+.8*softbox,0.,1.);
    }
    void main(){
      vec3 N=normalize(vN),V=normalize(-vP);
      vec3 L1=normalize(uL1),L2=normalize(uL2);
      float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.),diffuse=.72*d1+.3*d2;
      vec3 R=reflect(-V,N);float ry=dot(R,uUp);
      float env=smoothstep(-.15,.3,ry)*(1.-smoothstep(.55,.95,ry));
      float spec=pow(max(dot(N,normalize(L1+V)),0.),38.)+.35*pow(max(dot(N,normalize(L2+V)),0.),24.);
      float ground=mix(1.,.3+.7*smoothstep(-.85,.4,dot(N,uUp)),.3+.7*uRealism);
      float fresnel=pow(1.-max(dot(N,V),0.),4.);
      vec3 color;
      if(uKind<.5){
        color=uColor*(.42+.68*diffuse)*ground;
        float painted=rimShade(clamp(1.-vH*uHeightScale,0.,1.))*(.7+.3*env);
        float shade=mix(painted,studio(ry),uRealism);
        vec3 mirrored=mix(uRim,uShadow,(1.-shade)*uShadows)*mix(1.,ground,uRealism);
        float amount=uReflection*mix(.35+.65*shade,.72+.28*fresnel,uRealism);
        color=mix(color,mirrored,amount);
        color+=uGlossColor*uGloss*(.95*spec*ground+mix(.22*env,.35*smoothstep(.6,.9,ry)+.25*fresnel*shade,uRealism));
      }else{
        color=uColor*(.66+.34*min(diffuse,1.))+uGlossColor*uGloss*.65*spec; // directional light keeps the lime face readable
      }
      gl_FragColor=vec4(clamp(color,0.,1.),1.);
    }`;

  function start(host, bytes, META, isText = false) {
    const environment = host.closest('.window__body');
    const canvas = document.createElement('canvas');
    canvas.className = 'logo3d__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) throw Error('3D is unavailable in this browser');

    const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; };
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);

    const u = {};
    for (const n of ['uModel', 'uView', 'uProj', 'uNormal', 'uQMin', 'uQRange', 'uExtrude', 'uFat', 'uFatHeight', 'uWall', 'uKind', 'uReflection', 'uShadows', 'uGloss', 'uHeightScale', 'uRealism', 'uColor', 'uRim', 'uShadow', 'uGlossColor', 'uUp', 'uL1', 'uL2']) u[n] = gl.getUniformLocation(program, n);
    const aPos = gl.getAttribLocation(program, 'aPos');
    const aNrm = gl.getAttribLocation(program, 'aNrm');
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aNrm);

    const upload = (target, data) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; };
    const pos = upload(gl.ARRAY_BUFFER, new Uint16Array(bytes, META.position[0], META.position[1]));
    const nrm = upload(gl.ARRAY_BUFFER, new Int16Array(bytes, META.normal[0], META.normal[1]));
    const idx = upload(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bytes, META.index[0], META.index[1]));

    const qRange = META.max.map((v, i) => v - META.min[i]);
    const mid = META.min.map((v, i) => (v + META.max[i]) / 2);
    const thick = META.max[2] - META.min[2];
    const extrude = thick * (90 - 80) * 0.06; // shallow matte body, Studio vertical stretch 90
    const model = M4.mul(M4.rotX(isText ? 0 : LOGO_TILT), M4.translate(-mid[0], -mid[1], -mid[2] - extrude / 2));
    const radius = Math.hypot(qRange[0], qRange[1], thick + extrude) / 2 + (isText ? 0 : 2.8);

    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.vertexAttribPointer(aPos, 3, gl.UNSIGNED_SHORT, true, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, nrm);
    gl.vertexAttribPointer(aNrm, 3, gl.SHORT, true, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.uniform3fv(u.uQMin, META.min);
    gl.uniform3fv(u.uQRange, qRange);
    gl.uniform1f(u.uExtrude, extrude);
    gl.uniform1f(u.uFat, isText ? 0 : 1.8);
    gl.uniform1f(u.uFatHeight, thick + extrude);
    gl.uniform2fv(u.uWall, [META.min[2] + 0.45, META.max[2] - 0.45]);
    gl.uniform1f(u.uReflection, LOOK.reflection);
    gl.uniform1f(u.uShadows, LOOK.shadows);
    gl.uniform1f(u.uGloss, LOOK.glossAmount);
    gl.uniform1f(u.uHeightScale, 1 / (thick + extrude));
    gl.uniform1f(u.uRealism, LOOK.realism);
    gl.uniform3fv(u.uRim, LOOK.rim);
    gl.uniform3fv(u.uShadow, LOOK.shadow);
    gl.uniform3fv(u.uGlossColor, LOOK.gloss);
    gl.enable(gl.DEPTH_TEST);

    const initialView = { yaw: -14, pitch: 14 };
    const view = { ...initialView };
    let drag = null;
    let last = performance.now();
    let visible = true;

    function draw() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const aspect = w / h;
      const t = Math.tan(FOV / 2);
      const anchor = host.getBoundingClientRect();
      const cx = anchor.left + anchor.width / 2 - r.left;
      const cy = anchor.top + anchor.height / 2 - r.top;
      // Full-window canvas, with room for the bounding sphere at every rotation.
      // The wide wordmark is sized by its box width only; its rotation sphere is far taller than the text.
      const room = isText
        ? Math.max(1, Math.min(anchor.width * 0.46, cx - 12, r.width - cx - 12))
        : Math.max(1, Math.min(anchor.width * 0.46, cx - 12, r.width - cx - 12, cy - 12, r.height - cy - 12));
      const dist = radius / Math.sin(Math.atan(2 * room * t / r.height));
      const orbit = M4.mul(M4.rotX((view.pitch * Math.PI) / 180), M4.rotY((view.yaw * Math.PI) / 180));
      const viewM = M4.mul(M4.translate(0, 0, -dist), orbit);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const projection = M4.perspective(FOV, aspect, dist / 40, dist * 4);
      projection[8] = 1 - 2 * cx / r.width;
      projection[9] = 2 * cy / r.height - 1;
      gl.uniformMatrix4fv(u.uProj, false, projection);
      gl.uniformMatrix4fv(u.uView, false, viewM);
      gl.uniformMatrix4fv(u.uModel, false, model);
      gl.uniformMatrix3fv(u.uNormal, false, M4.normal(M4.mul(viewM, model)));
      const toView = (d) => { const m = viewM, v = [m[0] * d[0] + m[4] * d[1] + m[8] * d[2], m[1] * d[0] + m[5] * d[1] + m[9] * d[2], m[2] * d[0] + m[6] * d[1] + m[10] * d[2]], l = Math.hypot(...v); return v.map((a) => a / l); };
      gl.uniform3fv(u.uUp, toView([0, 1, 0]));
      gl.uniform3fv(u.uL1, toView([-0.5, 0.85, 0.5]));
      gl.uniform3fv(u.uL2, toView([0.8, 0.15, 0.6]));
      gl.uniform1f(u.uKind, 0);
      gl.uniform3fv(u.uColor, LOOK.body);
      gl.drawElements(gl.TRIANGLES, META.body[1], gl.UNSIGNED_SHORT, META.body[0] * 2);
      gl.uniform1f(u.uKind, 1);
      gl.uniform3fv(u.uColor, surfaceColor(isText));
      gl.drawElements(gl.TRIANGLES, META.top[1], gl.UNSIGNED_SHORT, META.top[0] * 2);
    }

    function loop(now) {
      const dt = Math.min(64, now - last);
      last = now;
      if (host.dataset.mode !== '3d') drag = null;
      if (!drag && visible && host.dataset.mode === '3d' && !document.hidden) {
        const ease = 1 - Math.exp(-dt / 300);
        for (const axis of ['yaw', 'pitch']) {
          view[axis] += (initialView[axis] - view[axis]) * ease;
          if (Math.abs(initialView[axis] - view[axis]) < 0.01) view[axis] = initialView[axis];
        }
      }
      if (visible && host.dataset.mode === '3d' && !document.hidden) draw();
      requestAnimationFrame(loop);
    }

    const beginInteraction = (e) => {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch };
    };
    host.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' && host.dataset.mode === '3d' && !drag) beginInteraction(e);
    });
    host.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || drag || host.dataset.mode !== '3d') return;
      beginInteraction(e);
      host.setPointerCapture(e.pointerId);
    });
    host.addEventListener('pointermove', (e) => {
      if (host.dataset.mode !== '3d') return;
      if (!drag && e.pointerType === 'mouse') beginInteraction(e);
      if (!drag || drag.id !== e.pointerId) return;
      view.yaw = drag.yaw + (e.clientX - drag.x) * 0.15;
      view.pitch = drag.pitch + (e.clientY - drag.y) * 0.4;

    });
    const endDrag = (e) => { if (drag && drag.id === e.pointerId) drag = null; };
    host.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') endDrag(e); });
    host.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') endDrag(e); });
    host.addEventListener('pointercancel', endDrag);
    host.addEventListener('lostpointercapture', endDrag);

    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(host);
    }

    canvas.hidden = host.dataset.mode !== '3d';
    environment.appendChild(canvas);
    host.classList.add('is-3d');
    requestAnimationFrame(loop);
  }

  // file:// pages cannot fetch binary assets; load the same bytes via a classic script.
  let localMeshes;
  function loadLocalMeshes() {
    if (!localMeshes) {
      localMeshes = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './start-logo/local-meshes.js';
        script.onload = () => {
          script.remove();
          if (window.BLOB_START_MESHES) resolve(window.BLOB_START_MESHES);
          else reject(Error('Local mesh bundle is empty'));
        };
        script.onerror = () => { script.remove(); reject(Error('Local mesh bundle unavailable')); };
        document.head.appendChild(script);
      }).catch(error => { localMeshes = null; throw error; });
    }
    return localMeshes;
  }
  async function loadMesh(isText) {
    // index.html starts these downloads in <head>, before the page has finished parsing.
    const key = isText ? 'text' : 'logo', preload = window.BLOB_MESH_PRELOAD;
    if (preload && preload[key]) { const early = preload[key]; preload[key] = null; return early; }
    if (location.protocol === 'file:') {
      const meshes = await loadLocalMeshes();
      const raw = atob(meshes[isText ? 'text' : 'logo']);
      return Uint8Array.from(raw, char => char.charCodeAt(0)).buffer;
    }
    const response = await fetch(isText ? './start-logo/wordmark-mesh.bin' : MESH_URL);
    if (!response.ok) throw Error('Mesh unavailable');
    return response.arrayBuffer();
  }

  const buttons = document.querySelectorAll('[data-logo-mode]');
  const status = document.getElementById('logoModeStatus');
  let loading = false;
  let ready = false;
  async function choose(mode) {
    hosts.forEach(host => { host.dataset.mode = mode; });
    document.querySelectorAll('.logo3d__canvas').forEach(canvas => { canvas.hidden = mode !== '3d'; });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.logoMode === mode)));
    try { sessionStorage.setItem('blob-start-logo-mode', mode); } catch (_) {}
    // The record selector follows the same 2D/3D choice.
    document.documentElement.dataset.viewMode = mode;
    document.dispatchEvent(new CustomEvent('blob:viewmode', { detail: mode }));
    status.textContent = '';
    if (mode !== '3d' || ready || loading) return;
    loading = true;
    status.textContent = 'Loading 3D…';
    try {
      const buffers = await Promise.all(hosts.map(host => loadMesh(host.dataset.logo3d === 'text')));
      hosts.forEach((host, i) => {
        if (!host.classList.contains('is-3d')) start(host, buffers[i], host.dataset.logo3d === 'text' ? TEXT_META : META, host.dataset.logo3d === 'text');
      });
      ready = true;
      status.textContent = '';
    } catch (_) {
      hosts.forEach(host => { if (!host.classList.contains('is-3d')) host.classList.add('is-3d-failed'); });
      status.textContent = '3D unavailable — showing 2D.';
    } finally { loading = false; }
  }
  buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.logoMode)));
  let initial = '3d';
  try { if (sessionStorage.getItem('blob-start-logo-mode') === '2d') initial = '2d'; } catch (_) {}
  choose(initial);
})();

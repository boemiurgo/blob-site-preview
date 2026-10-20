function readLanguage() {
  try { return sessionStorage.getItem('blob.v2.lang') === 'it' ? 'it' : 'en'; } catch { return 'en'; }
}

const DEFAULT_QTY = '1000';

const state = {
  record: '12',
  sleeve: 'basic',
  qty: '1000',
  color: 'black',
  weight: '140',
  discs: '1',
  rpm: '33',
  extras: [],
  lang: readLanguage(),
};

// Formspree endpoint for automatic quote sending (no mail client / mailto).
const FORMSPREE_ENDPOINT = '#';

/**
 * Files in ./assets/ offered in the taskbar “Downloads” panel.
 * Add the file under assets/ and append an entry: { file: 'name.ext', label: { it: '…', en: '…' } }.
 */
const ASSET_DOWNLOADS = [];

const TASKBAR_POPUP_IDS = [
  { panelId: 'downloadFilesPanel', buttonId: 'downloadFilesButton' },
  { panelId: 'infosPanel', buttonId: 'infosButton' },
  { panelId: 'startStoryPanel', buttonId: 'storyButton' },
];

function closeOtherTaskbarPanels(keepPanelId) {
  for (const { panelId, buttonId } of TASKBAR_POPUP_IDS) {
    if (panelId === keepPanelId) continue;
    const p = document.getElementById(panelId);
    const b = document.getElementById(buttonId);
    if (p) p.classList.add('is-hidden');
    if (b) b.setAttribute('aria-expanded', 'false');
  }
}

const TRANSLATIONS = {
  it: {
    meta: {
      title: 'BLOB Records - Custom vinyls, made your way',
      description: 'Pressing vinili 12", 7" e copie singole. Prezzi e richiesta preventivo.',
    },
    skip: { toContent: 'Vai al contenuto' },
    window: {
      mainTitle: 'Blob Records',
      pricesTitle: 'Prezzi',
      contactTitle: 'Preventivo',
      up: 'Finestra precedente',
      down: 'Finestra successiva',
    },
    settings: { open: 'Impostazioni', title: 'Impostazioni', theme: 'Tema', light: 'Chiaro', dark: 'Scuro', },
    hero: { options: 'Opzioni', viewMode: 'Visualizzazione', screenEffect: 'Effetto CRT', language: 'Lingua', randomColor: 'Colorize', dragHint: 'Trascina gli oggetti per ruotarli.',
      ctaPrices: 'Vedi prezzi', ctaQuote: 'Richiedi un preventivo' },
    prices: {
      recordTypes: 'Tipo di disco',
      sleeveTypes: 'Tipo di copertina',
      qty: 'Numero di copie',
      colors: 'Colori',
      vinylWeight: 'Grammatura',
      discs: 'Dischi',
      rpm: 'Velocità',
      summary: 'Riepilogo',
      unitPrice: 'Prezzo unitario',
      copies: 'Copie',
      total: 'Totale',
      badgeCopies: 'copie',
      badgeVinylOnly: 'Senza copertina',
      badgeWithSleeve: 'Con copertina',
      sleeveTypeDetailPrinted:
        'Normale: fronte e retro stampati, la copertina classica.',
      sleeveTypeDetailGatefold:
        'Gatefold: si apre a libro; dentro, pannelli extra per altra grafica o testi.',
      colorDesc: {
        black:
          'Nero: il classico vinile nero, tinta uniforme e aspetto sempre riconoscibile.',
        clear:
          'Trasparente: PVC trasparente; si vede attraverso il disco e le scanalature sul bordo.',
        solidColor:
          'Solid: un solo pigmento su tutta la superficie, colore pieno senza variazioni di base.',
        smoked:
          'Fumé: colore di base sfumato con tonalità più morbide, effetto “fumo” e profondità soft.',
        splatter:
          'Splatter: schizzi di colori contrastanti nella miscela: ogni copia è unica, perfetta per tirature limitate e edizioni da collezione.',
        recycled:
          'Riciclato: materiale di recupero; ogni disco cambia toni e sfumature. Scelta più sostenibile, in listino al pari del nero.',
        marbled:
          'Marbled: venature e macchie che ricordano il marmo; ogni pressatura ha un disegno diverso.',
      },
    },
    option: {
      record: { single: 'Copia singola' },
      discs: { '1': 'Singolo', '2': 'Doppio' },
      sleeve: { basic: 'Basic', printed: 'Normale', gatefold: 'Gatefold' },
    },
    contact: { contactsAria: 'Contatti', labelEmail: 'Email', labelPhone: 'Telefono' },
    form: {
      sectionProject: 'Progetto', sectionPressing: 'Stampa', sectionContact: 'Contatti',
      projectName: 'Nome progetto',
      albumName: 'Nome album',
      vinylType: 'Tipo di vinile',
      vinylWeight: 'Grammatura',
      qty: 'Numero di copie',
      color: 'Colori',
      sleeveType: 'Tipo di copertina',
      extras: 'Extra',
      email: 'E-mail',
      phone: 'Telefono',
      projectDescription: 'Descrivi il tuo progetto',
      projectDescriptionPlaceholder: 'Inserisci dettagli utili sul progetto (tiratura, riferimenti grafici, tempistiche, note)...',
      optionVinyl12: '12"',
      optionVinyl7: '7"',
      optionVinylSingle: 'Single',
      optionColorBlack: 'Nero',
      optionColorWhite: 'Bianco',
      optionColorClear: 'Trasparente',
      optionColorColored: 'Colorato',
      optionColorSolid: 'Solid',
      optionColorSmoked: 'Fumé',
      optionColorSplatter: 'Splatter',
      optionColorMarbled: 'Marbled',
      optionColorRecycled: 'Recycled Random',
      optionSleeveBasic: 'Basic',
      optionSleeveStandard: 'Normale',
      optionSleeveGatefold: 'Gatefold',
      optionExtrasNone: 'Nessuno',
      optionExtrasInsert: 'Inserto',
      optionExtrasSticker: 'Sticker',
      optionExtrasPoster: 'Poster',
      send: 'Invia',
      mailSubject: 'Richiesta preventivo',
      selectionLabel: 'Selezione',
      unitPrice: 'Prezzo unitario',
      total: 'Totale',
      projectNameLabel: 'Nome progetto',
      albumNameLabel: 'Nome album',
      vinylTypeLabel: 'Tipo di vinile',
      vinylWeightLabel: 'Grammatura',
      colorLabel: 'Colori',
      sleeveTypeLabel: 'Tipo di copertina',
      extrasLabel: 'Extra',
      projectDescriptionLabel: 'Descrizione progetto',
      quoteStatusAria: 'Stato richiesta preventivo',
      quoteSuccessTitle: 'Successo',
      quoteErrorTitle: 'Errore',
      quoteSentSuccess: 'La tua richiesta è stata inviata, ti ricontatteremo presto.',
      quoteSentError: "Qualcosa è andato storto durante l'invio. Riprova.",
    },
    footer: { brand: 'Blob Records', up: 'Su' },
    taskbar: {
      aria: 'Barra delle applicazioni',
      menu: 'Menu',
      prices: 'Prezzi',
      quote: 'Preventivo',
      crt: 'CRT:',
      intensity: 'Intensita',
      infos: 'Infos',
      infosButton: 'Infos',
      downloadFiles: 'Downloads',
      downloadFilesButton: 'Downloads',
      story: 'Chi siamo',
      storyButton: 'Chi siamo',
      download: 'Download HTML',
    },
    panel: {
      storyAria: 'Chi siamo',
      storyTitle: 'Chi siamo',
      closeStory: 'Chiudi pannello Chi siamo',
      infosAria: 'Cosa devi sapere',
      infosTitle: 'Cosa devi sapere',
      closeInfos: 'Chiudi pannello infos',
      downloadAria: 'Scarica file',
      downloadTitle: 'Downloads',
      closeDownload: 'Chiudi pannello download',
      downloadHint: 'Clicca un link per scaricare.',
      downloadEmpty: 'Non ci sono ancora file da scaricare. Contattaci per i materiali del tuo progetto.',
      downloadListAria: 'Elenco file',
    },
  },
  en: {
    meta: {
      title: 'BLOB Records - Custom vinyls, made your way',
      description: '12", 7" and one-off vinyl pressing. Prices and quote request.',
    },
    skip: { toContent: 'Skip to content' },
    window: {
      mainTitle: 'Blob Records',
      pricesTitle: 'Prices',
      contactTitle: 'Quote',
      up: 'Previous window',
      down: 'Next window',
    },
    settings: { open: 'Settings', title: 'Settings', theme: 'Theme', light: 'Light', dark: 'Dark', },
    hero: { options: 'Options', viewMode: 'View mode', screenEffect: 'CRT effect', language: 'Language', randomColor: 'Colorize', dragHint: 'Drag the objects to rotate them.',
      ctaPrices: 'View prices', ctaQuote: 'Request a quote' },
    prices: {
      recordTypes: 'Record type',
      sleeveTypes: 'Sleeve type',
      qty: 'Number of copies',
      colors: 'Colors',
      vinylWeight: 'Vinyl weight',
      discs: 'Discs',
      rpm: 'Speed',
      summary: 'Summary',
      unitPrice: 'Unit price',
      copies: 'Copies',
      total: 'Total',
      badgeCopies: 'copies',
      badgeVinylOnly: 'Without sleeve',
      badgeWithSleeve: 'With sleeve',
      sleeveTypeDetailPrinted:
        'Normal: printed front and back—the usual jacket.',
      sleeveTypeDetailGatefold:
        'Gatefold: opens like a book; extra inside panels for more art or notes.',
      colorDesc: {
        black:
          'Black: standard black PVC—deep, even, and the reference look everyone knows.',
        clear:
          'Clear: fully transparent vinyl so you can see light through the puck and the grooves at the edge.',
        solidColor:
          'Solid: one pigment across the whole record, an even field of color with no base variation.',
        smoked:
          'Smoked: a tinted base blended with softer, hazy gradients for a smoky, atmospheric finish.',
        splatter:
          'Splatter: contrasting colors splashed through the compound at random—every copy is unique, ideal for limited runs and collector editions.',
        recycled:
          'Recycled: pressed from reclaimed material; each disc varies in tone and shade. The most sustainable option, listed at the same price as black vinyl.',
        marbled:
          'Marbled: swirls and veins like marble—each pressing is visually distinct from the next.',
      },
    },
    option: {
      record: { single: 'One copy' },
      discs: { '1': 'Single', '2': 'Double' },
      sleeve: { basic: 'Basic', printed: 'Normal', gatefold: 'Gatefold' },
    },
    contact: { contactsAria: 'Contacts', labelEmail: 'Email', labelPhone: 'Phone' },
    form: {
      sectionProject: 'Project', sectionPressing: 'Pressing', sectionContact: 'Contact',
      projectName: 'Project name',
      albumName: 'Album name',
      vinylType: 'Vinyl type',
      vinylWeight: 'Vinyl weight',
      qty: 'Number of copies',
      color: 'Colors',
      sleeveType: 'Sleeve type',
      extras: 'Extras',
      email: 'E-mail',
      phone: 'Phone number',
      projectDescription: 'Describe your project',
      projectDescriptionPlaceholder: 'Add useful details about your project (run size, artwork references, timeline, notes)...',
      optionVinyl12: '12"',
      optionVinyl7: '7"',
      optionVinylSingle: 'Single',
      optionColorBlack: 'Black',
      optionColorWhite: 'White',
      optionColorClear: 'Clear',
      optionColorColored: 'Colored',
      optionColorSolid: 'Solid',
      optionColorSmoked: 'Smoked',
      optionColorSplatter: 'Splatter',
      optionColorMarbled: 'Marbled',
      optionColorRecycled: 'Recycled Random',
      optionSleeveBasic: 'Basic',
      optionSleeveStandard: 'Standard',
      optionSleeveGatefold: 'Gatefold',
      optionExtrasNone: 'None',
      optionExtrasInsert: 'Insert',
      optionExtrasSticker: 'Sticker',
      optionExtrasPoster: 'Poster',
      send: 'Send',
      mailSubject: 'Quote request',
      selectionLabel: 'Selection',
      unitPrice: 'Unit price',
      total: 'Total',
      projectNameLabel: 'Project name',
      albumNameLabel: 'Album name',
      vinylTypeLabel: 'Vinyl type',
      vinylWeightLabel: 'Vinyl weight',
      colorLabel: 'Colors',
      sleeveTypeLabel: 'Sleeve type',
      extrasLabel: 'Extras',
      projectDescriptionLabel: 'Project description',
      quoteStatusAria: 'Quote request status',
      quoteSuccessTitle: 'Success',
      quoteErrorTitle: 'Error',
      quoteSentSuccess: "Your quote has been sent, we'll get back to you.",
      quoteSentError: 'Something went wrong while sending your quote. Please try again.',
    },
    footer: { brand: 'Blob Records', up: 'Up' },
    taskbar: {
      aria: 'Task bar',
      menu: 'Menu',
      prices: 'Prices',
      quote: 'Quote',
      crt: 'CRT:',
      intensity: 'Intensity',
      infos: 'Infos',
      infosButton: 'Infos',
      downloadFiles: 'Downloads',
      downloadFilesButton: 'Downloads',
      story: 'About us',
      storyButton: 'About us',
      download: 'Download HTML',
    },
    panel: {
      storyAria: 'About us',
      storyTitle: 'About us',
      closeStory: 'Close About us panel',
      infosAria: 'What you need to know',
      infosTitle: 'What you need to know',
      closeInfos: 'Close infos panel',
      downloadAria: 'Download files',
      downloadTitle: 'Downloads',
      closeDownload: 'Close download panel',
      downloadHint: 'Click a link to download.',
      downloadEmpty: 'No downloads available yet. Contact us for materials for your project.',
      downloadListAria: 'File list',
    },
  },
};

const EDITABLE_DEFAULTS = {
  'hero.kicker': {
    it: 'Trasforma la tua musica in arte',
    en: 'Turn your music into art',
  },
  'hero.title': {
    it: 'Vinili personalizzati, a modo tuo.',
    en: 'Custom vinyls, made your way.',
  },
  'hero.subtitle': {
    it: '12", 7" e copie singole. Scegli le opzioni e richiedi un preventivo.',
    en: '12", 7" and one-off copies. Choose your options and request a quote.',
  },
  'prices.title': { it: 'Prezzi', en: 'Prices' },
  'prices.subtitle': {
    it: 'Seleziona cio di cui hai bisogno e vedi subito cosa spenderai.',
    en: "Select what you need and find out how much you'll spend.",
  },
  'prices.note': {
    it: 'I prezzi non includono IVA.',
    en: 'Prices do not include VAT.',
  },
  'contact.title': { it: 'Richiedi un preventivo', en: 'Request a quote' },
  'contact.subtitle': { it: 'Richiedi un preventivo con pochi dettagli.', en: 'Request a quote with a few details.' },
  'contact.email': { it: 'recordsblob@gmail.com', en: 'recordsblob@gmail.com' },
  'contact.phone1': { it: '+39 347 421 1714', en: '+39 347 421 1714' },
  'contact.phone2': { it: '+39 380 897 1267', en: '+39 380 897 1267' },
  'story.text': {
    it: 'Siamo due amici cresciuti scambiando dischi, passando i weekend nei piccoli club e sognando di stampare i nostri vinili. Oggi Blob Records e il nostro primo passo: aiutare gli artisti a trasformare le canzoni in dischi reali con cura, prezzi chiari e supporto pratico dall\'inizio alla fine. Per ora ci concentriamo sul vinile, ma questo e solo l\'inizio del nostro percorso.',
    en: 'We are two friends who grew up trading records, spending weekends in small clubs, and dreaming about pressing our own vinyl. Today, Blob Records is our first step: helping artists turn songs into real records with care, clear prices, and hands-on support from start to finish. For now we are focused on pressing vinyl, and this is only the beginning of our journey.',
  },
  'infos.text': {
    it: 'Prima della stampa, prepara il master specifico per il taglio su vinile: evita basse frequenze estreme in stereo, controlla le sibilanti e lascia abbastanza headroom. Verifica presto ordine tracce e durata dei lati, perche lati lunghi possono ridurre volume e impatto. Finalizza la grafica con abbondanze e dimensioni corrette e valuta sempre un test pressing prima della produzione completa. Pianifica tempi e budget con margine, perche lacche, galvanica e pressa richiedono controlli qualita accurati.',
    en: 'Before pressing vinyl, prepare your master specifically for vinyl cutting: avoid extreme low-end in stereo, control sibilance, and leave enough headroom. Check your track order and side length early, because longer sides can reduce volume and impact. Finalize artwork with correct bleed and dimensions, and always review a test pressing before approving full production. Plan timeline and budget with margin, since lacquers, plating, and pressing each need careful quality checks.',
  },
};

Object.assign(TRANSLATIONS.en, {studio:{brand:'Independent sound. Physical form.',oneoff:'ONE-OFF COPIES',made:'YOUR MUSIC, MADE REAL ↗',preview:'YOUR RECORD',illustration:'Illustration only. Every pressing is unique.'}});
Object.assign(TRANSLATIONS.it, {studio:{brand:'Suono indipendente. Forma fisica.',oneoff:'COPIE SINGOLE',made:'LA TUA MUSICA PRENDE FORMA ↗',preview:'IL TUO DISCO',illustration:'Immagine illustrativa. Ogni stampa è unica.'}});

function renderRecordPreview() {
  const image=document.getElementById('recordPreview');
  if(!image)return;
  const names={'black':'black','clear':'clear','solid color':'solid','smoked':'smoked','splatter':'splatter','marbled':'marbled','recycled random':'recycled'};
  const source='./assets/record-'+(names[state.color]||'black')+'.webp';
  if(image.getAttribute('src')!==source)image.src=source;
  const preview=image.closest('.record-preview');
  preview.dataset.record=state.record;
  preview.dataset.sleeve=state.sleeve;
  preview.dataset.color=state.color;
  preview.dataset.rpm=state.rpm;
  preview.dataset.discs=state.record==='single'?'1':state.discs;
  const label=labelFor('record',state.record)+' / '+labelFor('color',state.color)+' / '+labelFor('sleeve',state.sleeve);
  image.alt=label+(state.lang==='it'?' — immagine illustrativa':' — record illustration');

}

function t(key) {
  const source = TRANSLATIONS[state.lang] || TRANSLATIONS.it;
  return key.split('.').reduce((acc, part) => acc?.[part], source);
}

function moneyEUR(value) {
  if (value == null) return '—';
  const locale = state.lang === 'en' ? 'en-GB' : 'it-IT';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(value);
}

const priceList = {
  '12': {
    '100': { vinyl: 9.5, cover: 12 },
    '200': { vinyl: 6, cover: 8 },
    '300': { vinyl: 4.5, cover: 6 },
    '500': { vinyl: 3.5, cover: 5 },
    '1000': { vinyl: 3, cover: 4 },
    '2000': { vinyl: 2.75, cover: 3.75 },
  },
  '7': {
    '100': { vinyl: 6, cover: 9 },
    '300': { vinyl: 4, cover: 5.5 },
    '500': { vinyl: 3, cover: 4 },
  },
  single: {
    '1': { vinyl: 50, cover: 70 },
    '2': { vinyl: 90, cover: 100 },
  },
};

function unitPriceForSelection() {
  const record = priceList[state.record];
  const row = record?.[state.qty];
  if (!row) return null;

  // From the provided price list: two columns are "solo vinile" and "con copertina".
  // We map "Base" sleeve => solo vinile, anything else => con copertina.
  const mode = state.sleeve === 'basic' ? 'vinyl' : 'cover';
  const base = row[mode] ?? null;
  if (base == null) return null;

  // Gatefold surcharge: +€0.50 per copy compared to "Normal" sleeve.
  const gatefoldSurcharge = state.sleeve === 'gatefold' ? 0.5 : 0;

  // Color surcharges (per copy)
  // Only applies to 12" orders. For 7" and Single, color is forced to Black.
  // Black and "recycled random" share the same price (no surcharge).
  const colorSurcharge =
    state.record !== '12'
      ? 0
      : state.color === 'clear'
        ? 1
        : state.color === 'solid color'
          ? 0.5
          : state.color === 'smoked' || state.color === 'marbled'
            ? 1
            : state.color === 'splatter'
              ? 1.5
              : 0;

  // 180g vinyl: +€0.50 per copy (12" only; 7"/Single use list prices as 140g).
  const weightSurcharge = state.record === '12' && state.weight === '180' ? 0.5 : 0;

  // Double record: a second disc at the "vinyl only" list price, with its own color and weight surcharges.
  // ASSUMPTION — no double-record price list yet; replace once confirmed.
  const extraDisc = state.discs === '2' && state.record !== 'single' ? row.vinyl + colorSurcharge + weightSurcharge : 0;

  const extrasSurcharge = state.extras.reduce((sum, k) => sum + (EXTRA_PRICES[k] ?? 0), 0);

  return base + gatefoldSurcharge + colorSurcharge + weightSurcharge + extraDisc + extrasSurcharge;
}

function availableQtyForRecord(recordKey) {
  return Object.keys(priceList[recordKey] ?? {}).sort((a, b) => Number(a) - Number(b));
}

function clampQtyToRecordOptions() {
  const opts = availableQtyForRecord(state.record);
  const raw = String(state.qty ?? '').trim();
  if (opts.includes(raw)) {
    state.qty = raw;
    return;
  }
  state.qty = opts.includes(DEFAULT_QTY) ? DEFAULT_QTY : (opts[0] ?? DEFAULT_QTY);
}

function setActiveChip(group, value) {
  document.querySelectorAll(`.chip[data-group="${group}"]`).forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.value === value);
    btn.setAttribute('aria-pressed', String(btn.dataset.value === value));
  });
}

function labelFor(group, value) {
  const map = {
    record: { '12': '12"', '7': '7"', single: t('option.record.single') },
    sleeve: {
      basic: t('option.sleeve.basic'),
      printed: t('option.sleeve.printed'),
      gatefold: t('option.sleeve.gatefold'),
    },
    color: {
      black: 'Black',
      'recycled random': t('form.optionColorRecycled'),
      clear: 'Clear',
      'solid color': t('form.optionColorSolid'),
      smoked: 'Smoked',
      splatter: 'Splatter',
      marbled: t('form.optionColorMarbled'),
    },
    qty: {
      '1': '1',
      '2': '2',
      '100': '100',
      '200': '200',
      '300': '300',
      '500': '500',
      '1000': '1000',
      '2000': '2000',
    },
    discs: { '1': t('option.discs.1'), '2': t('option.discs.2') },
    rpm: { '33': '33 RPM', '45': '45 RPM' },
    weight: {
      '140': '140g',
      '180': '180g',
    },
  };
  return map[group]?.[value] ?? value;
}

// Optional extras (poster, insert, sticker): any combination, toggled on the prices window and in the quote form.
// Per-copy prices are not in the price list yet, so they are quoted separately; set a number here to add one.
const EXTRA_KEYS = ['poster', 'insert', 'sticker'];
const EXTRA_PRICES = { poster: null, insert: null, sticker: null };
const extraLabel = (key) => t(`form.optionExtras${key[0].toUpperCase()}${key.slice(1)}`);
const extrasText = () => (state.extras.length ? state.extras.map(extraLabel).join(', ') : t('form.optionExtrasNone'));

function setExtras(next) {
  state.extras = EXTRA_KEYS.filter((k) => next.includes(k));
  document.querySelectorAll('.chip[data-extra]').forEach((btn) => {
    const on = state.extras.includes(btn.dataset.extra);
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('#quoteForm input[name="extras"]').forEach((box) => { box.checked = state.extras.includes(box.value); });
  renderPrices();
}

function setupExtras() {
  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('.chip[data-extra]') : null;
    if (!btn) return;
    const key = btn.dataset.extra;
    setExtras(state.extras.includes(key) ? state.extras.filter((k) => k !== key) : [...state.extras, key]);
  });
  document.addEventListener('change', (e) => {
    if (!(e.target instanceof HTMLInputElement) || e.target.name !== 'extras' || !e.target.closest('#quoteForm')) return;
    setExtras(Array.from(document.querySelectorAll('#quoteForm input[name="extras"]:checked'), (box) => box.value));
  });
  setExtras(state.extras);
}

function renderPrices() {
  renderRecordPreview();
  const badge = document.getElementById('selectionBadge');
  const unit = unitPriceForSelection();
  const qtyNum = Number(state.qty);
  const total = unit == null || Number.isNaN(qtyNum) ? null : unit * qtyNum;
  const modeLabel = state.sleeve === 'basic' ? t('prices.badgeVinylOnly') : t('prices.badgeWithSleeve');
  const weightLabel = state.record === '12' ? ` • ${labelFor('weight', state.weight)}` : '';
  const discsLabel = state.discs === '2' ? ` • ${labelFor('discs', '2')}` : '';

  const extrasLabel = state.extras.length ? ` • + ${extrasText()}` : '';
  badge.textContent = `${labelFor('record', state.record)}${discsLabel}${weightLabel} • ${labelFor('rpm', state.rpm)} • ${labelFor('qty', state.qty)} ${t('prices.badgeCopies')} • ${modeLabel}${extrasLabel}`;


  document.getElementById('priceUnit').textContent = moneyEUR(unit);
  document.getElementById('priceQty').textContent = Number.isNaN(qtyNum) ? '—' : String(qtyNum);
  document.getElementById('priceTotal').textContent = moneyEUR(total);
}

function renderQtyChips() {
  const wrap = document.getElementById('qtyChips');
  if (!wrap) return;

  clampQtyToRecordOptions();
  const qtyOptions = availableQtyForRecord(state.record);

  wrap.innerHTML = qtyOptions
    .map((q) => {
      const active = q === state.qty ? ' is-active' : '';
      return `<button class="chip${active}" data-group="qty" data-value="${q}">${q}</button>`;
    })
    .join('');
}

function enforceSleeveRules() {
  const sleeveButtons = Array.from(document.querySelectorAll('.chip[data-group="sleeve"]'));
  const recordIsSingle = state.record === 'single';
  const recordIs7 = state.record === '7';

  // Visibility rules:
  // - Single: only "basic" sleeve exists
  // - 7": no gatefold
  sleeveButtons.forEach((btn) => {
    const v = btn.getAttribute('data-value');
    const hidden = (recordIsSingle && v !== 'basic') || (recordIs7 && v === 'gatefold');
    btn.classList.toggle('is-hidden', hidden);
  });

  // Enforce a valid sleeve value when options change.
  if (recordIsSingle) {
    state.sleeve = 'basic';
  } else if (recordIs7 && state.sleeve === 'gatefold') {
    state.sleeve = 'printed';
  }

  setActiveChip('sleeve', state.sleeve);
}

function enforceColorRules() {
  const recordIs12 = state.record === '12';

  // For 7" and Single, the only allowed color is Black.
  if (!recordIs12) state.color = 'black';

  // Prices section: show the Color panel always, but for 7"/Single show only "Black".
  const colorPanel = document.getElementById('pricesColorPanel');
  if (colorPanel) {
    colorPanel.classList.remove('is-hidden');
    const colorButtons = Array.from(colorPanel.querySelectorAll('.chip[data-group="color"]'));
    colorButtons.forEach((btn) => {
      const v = btn.getAttribute('data-value');
      const hidden = !recordIs12 && v !== 'black';
      btn.classList.toggle('is-hidden', hidden);
    });
  }

  // Quote form: keep the dropdown in sync and restrict choices.
  const form = document.getElementById('quoteForm');
  const colorSelect = form?.querySelector('select[name="color"]') || null;
  if (colorSelect) {
    // Ensure Black exists and is selected when restricted.
    colorSelect.value = state.color;

    Array.from(colorSelect.options).forEach((opt) => {
      const isBlack = opt.value === 'black';
      // Hide non-black options when not 12".
      opt.hidden = !recordIs12 && !isBlack;
      // Also disable non-black options for robustness.
      opt.disabled = !recordIs12 && !isBlack;
    });

    if (!recordIs12) colorSelect.value = 'black';
  }

  setActiveChip('color', state.color);
}

function enforceWeightRules() {
  const recordIs12 = state.record === '12';

  if (!recordIs12) {
    state.weight = '140';
  }

  const weightLabel = document.getElementById('pricesWeightLabel');
  if (weightLabel) weightLabel.classList.toggle('is-hidden', !recordIs12);

  const weightButtons = Array.from(document.querySelectorAll('.chip[data-group="weight"]'));
  weightButtons.forEach((btn) => {
    btn.classList.toggle('is-hidden', !recordIs12);
  });

  setActiveChip('weight', state.weight);
}

// Single or double record; one-copy orders are always a single disc.
function enforceDiscRules() {
  const canDouble = state.record !== 'single';
  if (!canDouble) state.discs = '1';
  document.getElementById('pricesDiscsLabel')?.classList.toggle('is-hidden', !canDouble);
  document.getElementById('pricesDiscsChips')?.classList.toggle('is-hidden', !canDouble);
  setActiveChip('discs', state.discs);
}

// Playing speed: 7" defaults to 45 RPM, 12" and one-copy cuts to 33 RPM. No price difference.
function resetRpmForRecord() {
  state.rpm = state.record === '7' ? '45' : '33';
  setActiveChip('rpm', state.rpm);
  enforceRpmRules();
}

// 7" records are always 45 RPM, so the speed choice is hidden for them.
function enforceRpmRules() {
  const show = state.record !== '7';
  if (!show) state.rpm = '45';
  document.getElementById('pricesRpmLabel')?.classList.toggle('is-hidden', !show);
  document.getElementById('pricesRpmChips')?.classList.toggle('is-hidden', !show);
}

function renderQuoteQtyOptions() {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  const select = form.querySelector('select[name="qty"]');
  if (!select) return;

  clampQtyToRecordOptions();
  const qtyOptions = availableQtyForRecord(state.record);

  select.innerHTML = qtyOptions.map((q) => `<option value="${q}">${q}</option>`).join('');
  select.value = String(state.qty);
}

function mapVinylValueFromRecordKey(recordKey) {
  if (recordKey === '12') return '12"';
  if (recordKey === '7') return '7"';
  return 'Single';
}

function mapRecordKeyFromVinylValue(v) {
  if (v === '12"') return '12';
  if (v === '7"') return '7';
  return 'single';
}

function mapSleeveValueFromSleeveKey(sleeveKey) {
  if (sleeveKey === 'basic') return 'Basic';
  if (sleeveKey === 'printed') return 'Normale';
  if (sleeveKey === 'gatefold') return 'Gatefold';
  return 'Basic';
}

function mapSleeveKeyFromSleeveValue(v) {
  if (v === 'Basic') return 'basic';
  if (v === 'Normale') return 'printed';
  if (v === 'Gatefold') return 'gatefold';
  return 'basic';
}

function syncQuoteFormFromState() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const vinylSelect = form.querySelector('select[name="vinylType"]');
  if (vinylSelect) vinylSelect.value = mapVinylValueFromRecordKey(state.record);

  const colorSelect = form.querySelector('select[name="color"]');
  if (colorSelect) colorSelect.value = state.color;

  const sleeveSelect = form.querySelector('select[name="sleeveType"]');
  if (sleeveSelect) sleeveSelect.value = mapSleeveValueFromSleeveKey(state.sleeve);

  const weightSelect = form.querySelector('select[name="vinylWeight"]');
  const weightWrap = document.getElementById('vinylWeightWrap');
  if (weightSelect && weightWrap) {
    const recordIs12 = state.record === '12';
    weightWrap.classList.toggle('is-hidden', !recordIs12);
    weightSelect.required = recordIs12;
    if (!recordIs12) state.weight = '140';
    weightSelect.value = state.weight === '180' ? '180' : '140';
  }

  const discsSelect = form.querySelector('select[name="discs"]');
  const discsWrap = document.getElementById('quoteDiscsWrap');
  if (discsSelect) {
    discsWrap?.classList.toggle('is-hidden', state.record === 'single');
    discsSelect.value = state.discs;
  }

  const rpmSelect = form.querySelector('select[name="rpm"]');
  if (rpmSelect) {
    document.getElementById('quoteRpmWrap')?.classList.toggle('is-hidden', state.record === '7');
    rpmSelect.value = state.rpm;
  }

  renderQuoteQtyOptions();
}

function setupChips() {
  // Event delegation so dynamically rebuilt qty chips keep working.
  document.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('.chip[data-group]') : null;
    if (!btn) return;

    const group = btn.dataset.group;
    const value = btn.dataset.value;
    if (!group || !value) return;

    state[group] = value;

    // If record changes, rebuild quantity options.
    if (group === 'record') {
      renderQtyChips();
    }

    if (group === 'record' || group === 'sleeve') {
      enforceSleeveRules();
    }
    if (group === 'record' || group === 'color') {
      enforceColorRules();
    }
    if (group === 'record') {
      enforceWeightRules();
      enforceDiscRules();
      resetRpmForRecord();
    }

    setActiveChip(group, value);
    renderPrices();
    syncQuoteFormFromState();
  });
}

function showPopup(message, isError = false, onOk = null) {
  const existing = document.getElementById('quoteStatusPopup');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'quoteStatusPopup';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', t('form.quoteStatusAria'));

  const bg = isError ? '#5b1b1b' : '#0f5132';
  const title = isError ? t('form.quoteErrorTitle') : t('form.quoteSuccessTitle');

  overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2005;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    ">
      <div style="
        background: #fff;
        border: 4px solid #000;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.35);
        max-width: 560px;
        width: 100%;
        padding: 16px;
        font-family: var(--px, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);
      ">
        <div style="font-weight: 900; font-size: 14px; margin-bottom: 10px; color: ${bg}; text-transform: uppercase;">
          ${title}
        </div>
        <div style="white-space: pre-wrap; line-height: 1.5; font-size: 12px; color: #111;">
          ${message}
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top: 14px;">
          <button type="button" id="quoteStatusOk" style="
            border: 4px solid #000;
            background: #000;
            color: #fff;
            padding: 10px 14px;
            cursor: pointer;
            font-weight: 900;
            letter-spacing: 0.03em;
            font-size: 12px;
          ">OK</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const ok = overlay.querySelector('#quoteStatusOk');
  ok?.addEventListener('click', () => {
    overlay.remove();
    if (typeof onOk === 'function') onOk();
  });
}

function focusTopSection() {
  const topSection = document.getElementById('top');
  const topCrt = topSection?.classList.contains('crt') ? topSection : topSection?.closest('.crt');
  if (topCrt) {
    topCrt.classList.remove('crt--closed', 'crt--hidden');
    const win = topCrt.querySelector('.window');
    if (win) win.classList.remove('window--minimized');
  }
  if (window.location.hash !== '#top') {
    window.location.hash = '#top';
  } else {
    topSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setupForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  // Ensure quote fields match the current Prices selections.
  syncQuoteFormFromState();

  const vinylTypeSelect = form.querySelector('select[name="vinylType"]');
  const sleeveTypeSelect = form.querySelector('select[name="sleeveType"]');
  const qtySelect = form.querySelector('select[name="qty"]');
  const colorSelect = form.querySelector('select[name="color"]');
  const vinylWeightSelect = form.querySelector('select[name="vinylWeight"]');

  vinylTypeSelect?.addEventListener('change', () => {
    const nextRecord = mapRecordKeyFromVinylValue(vinylTypeSelect.value);
    if (!nextRecord || nextRecord === state.record) return;

    state.record = nextRecord;
    setActiveChip('record', state.record);
    renderQtyChips();
    enforceSleeveRules();
    enforceColorRules();
    enforceWeightRules();
    enforceDiscRules();
    resetRpmForRecord();
    renderPrices();
    syncQuoteFormFromState();
  });

  sleeveTypeSelect?.addEventListener('change', () => {
    const nextSleeve = mapSleeveKeyFromSleeveValue(sleeveTypeSelect.value);
    if (!nextSleeve || nextSleeve === state.sleeve) return;

    state.sleeve = nextSleeve;
    setActiveChip('sleeve', state.sleeve);
    renderPrices();
    syncQuoteFormFromState();
  });

  qtySelect?.addEventListener('change', () => {
    const nextQty = qtySelect.value;
    if (!nextQty || nextQty === state.qty) return;

    state.qty = nextQty;
    setActiveChip('qty', state.qty);
    renderPrices();
    syncQuoteFormFromState();
  });

  colorSelect?.addEventListener('change', () => {
    const nextColor = colorSelect.value;
    if (!nextColor || nextColor === state.color) return;
    state.color = nextColor;
    setActiveChip('color', state.color);
    renderPrices();
    syncQuoteFormFromState();
  });

  vinylWeightSelect?.addEventListener('change', () => {
    const w = vinylWeightSelect.value;
    if (w !== '140' && w !== '180') return;
    state.weight = w;
    setActiveChip('weight', state.weight);
    renderPrices();
    syncQuoteFormFromState();
  });

  form.querySelector('select[name="discs"]')?.addEventListener('change', (e) => {
    const d = e.target.value;
    if ((d !== '1' && d !== '2') || state.record === 'single') return;
    state.discs = d;
    setActiveChip('discs', state.discs);
    renderPrices();
    syncQuoteFormFromState();
  });

  form.querySelector('select[name="rpm"]')?.addEventListener('change', (e) => {
    const r = e.target.value;
    if (r !== '33' && r !== '45') return;
    state.rpm = r;
    setActiveChip('rpm', state.rpm);
    renderPrices();
    syncQuoteFormFromState();
  });

  function selectedText(name) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return '';
    if (el instanceof HTMLSelectElement) {
      const opt = el.selectedOptions?.[0];
      return String(opt?.textContent || '').trim();
    }
    return String(el.value || '').trim();
  }

  function ensureHiddenInput(name, value) {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = value;
  }

  // Classic Formspree POST (not AJAX): works with Formspree reCAPTCHA enabled.
  // AJAX fetch returns 403 unless reCAPTCHA is disabled or a custom key is set.
  form.setAttribute('action', FORMSPREE_ENDPOINT);
  form.setAttribute('method', 'POST');
  form.setAttribute('accept-charset', 'UTF-8');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    return; // Public design preview: never collect or send quote data.
    const data = new FormData(form);

    const projectName = String(data.get('projectName') || '').trim();
    const albumName = String(data.get('albumName') || '').trim();
    const subject = `${t('form.mailSubject')} - ${projectName}${albumName ? ` / ${albumName}` : ''}`.trim();
    const modeLabel = state.sleeve === 'basic' ? t('prices.badgeVinylOnly') : t('prices.badgeWithSleeve');
    const recordTypeLabel = state.record === 'single' ? t('form.optionVinylSingle') : labelFor('record', state.record);
    const bodyLines = [
      `${t('form.projectNameLabel')}: ${projectName}`,
      `${t('form.albumNameLabel')}: ${albumName}`,
      `${t('form.vinylTypeLabel')}: ${selectedText('vinylType')}`,
      `${t('form.vinylWeightLabel')}: ${state.record === '12' ? labelFor('weight', state.weight) : '140g'}`,
      `${t('prices.discs')}: ${labelFor('discs', state.discs)}`,
      `${t('prices.rpm')}: ${labelFor('rpm', state.rpm)}`,
      `${t('form.qty')}: ${selectedText('qty')}`,
      `${t('form.colorLabel')}: ${selectedText('color')}`,
      `${t('form.sleeveTypeLabel')}: ${selectedText('sleeveType')}`,
      `${t('form.extrasLabel')}: ${extrasText()}`,
      `${t('form.email')}: ${data.get('email') || ''}`,
      `${t('form.phone')}: ${data.get('phone') || ''}`,
      `${t('form.projectDescriptionLabel')}:`,
      `${data.get('projectDescription') || ''}`,
      '',
      `${t('form.selectionLabel')}: ${recordTypeLabel}${state.discs === '2' ? ` • ${labelFor('discs', '2')}` : ''}${state.record === '12' ? ` • ${labelFor('weight', state.weight)}` : ''} • ${labelFor('qty', state.qty)} ${t('prices.badgeCopies')} • ${modeLabel}${state.extras.length ? ` • + ${extrasText()}` : ''}`,
      `${t('form.unitPrice')}: ${moneyEUR(unitPriceForSelection())}`,
      `${t('form.total')}: ${moneyEUR(unitPriceForSelection() == null ? null : unitPriceForSelection() * Number(state.qty))}`,
    ];

    const bodyText = bodyLines.join('\n');
    const nextUrl = `${window.location.origin}${window.location.pathname}?sent=1`;

    ensureHiddenInput('subject', subject);
    ensureHiddenInput('message', bodyText);
    ensureHiddenInput('_next', nextUrl);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Native submit bypasses this listener's preventDefault path.
    HTMLFormElement.prototype.submit.call(form);
  });
}

function setupYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

// CRT effect is always on, kept very light; there is no toggle.
function setupCrtControls() {
  document.documentElement.style.setProperty('--crt-intensity', '0.25');
  document.body.classList.remove('crt-disabled');
  document.querySelectorAll('.crt').forEach((el) => el.classList.remove('crt--off'));
  try { sessionStorage.removeItem('blob-crt'); } catch (_) {}
}

// Light or dark theme, kept for the browser session (the <head> script applies it before paint).
function setupThemeControls() {
  const root = document.documentElement;
  const buttons = Array.from(document.querySelectorAll('[data-theme-option]'));
  const changed = () => document.dispatchEvent(new CustomEvent('blob:theme', { detail: root.dataset.theme || 'light' }));
  const setTheme = (theme) => {
    if (theme === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeOption === theme)));
    try { sessionStorage.setItem('blob-theme', theme); } catch (_) {}
    changed();
  };
  buttons.forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.themeOption)));
  delete root.dataset.contrast;
  try { sessionStorage.removeItem('blob-contrast'); } catch (_) {}
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
}

// Taskbar gear: opens the small settings panel (language, 2D/3D, theme).
function setupSettingsPanel() {
  const button = document.getElementById('settingsButton');
  const panel = document.getElementById('settingsPanel');
  if (!button || !panel) return;
  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !button.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); button.focus(); }
  });
}

function setupTaskbarActive() {
  const ids = ['top', 'prices', 'quote'];
  const screens = ids.map(id => document.getElementById(id));
  let scheduled = 0;
  function fit() {
    scheduled = 0;
    for (const screen of screens) {
    const body = screen?.querySelector('.window__body');
    const content = body?.querySelector(':scope > section');
    if (!content || !body.clientWidth || !body.clientHeight) continue;
    // Narrow prices/quote windows: reflow at real size and grow with the page instead of shrinking.
    const flow = screen.id !== 'top' && body.clientWidth < 600;
    body.classList.toggle('window__body--flow', flow);
    if (flow) { content.style.width = ''; content.style.transform = ''; continue; }
    const width = Math.max(body.clientWidth, screen.id === 'top' ? 0 : screen.id === 'quote' ? 380 : 600);
    content.style.width = `${width}px`;
    const options = screen.id === 'top' ? body.querySelector('.hero-options') : null;
    const reserved = options && body.clientWidth <= 640 ? options.offsetTop + options.offsetHeight + 8 : 0;
    // The start hero fills the window so its pieces can spread out evenly; taller content still scales down.
    if (screen.id === 'top') content.style.minHeight = `${Math.max(1, body.clientHeight - reserved)}px`;
    const scale = Math.min(1, body.clientWidth / width, Math.max(1, body.clientHeight - reserved) / content.offsetHeight);
    if (options) content.style.top = ((body.clientHeight + reserved) / 2) + 'px';
    content.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  }
  function scheduleFit() { if (!scheduled) scheduled = requestAnimationFrame(fit); }
  function setActive(id) {
    screens.forEach(el => el.classList.toggle('screen-active', el.id === id));
    document.getElementById('startButton')?.classList.toggle('is-active', id === 'top');
    document.querySelectorAll('.taskbar__task').forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('taskbar__task--active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  function show() {
    const requested = location.hash.slice(1);
    setActive(ids.includes(requested) ? requested : 'top');
    scheduleFit();
  }
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const bottom = document.querySelector('.taskbar').getBoundingClientRect().top;
      let best = screens[0], overlap = -1;
      screens.forEach(screen => {
        const rect = screen.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, 0));
        if (visible > overlap) { best = screen; overlap = visible; }
      });
      setActive(best.id);
    });
  }, {passive:true});
  window.addEventListener('hashchange', show);
  window.addEventListener('resize', scheduleFit);
  window.visualViewport?.addEventListener('resize', scheduleFit);
  const observer = new ResizeObserver(scheduleFit);
  screens.forEach(el => {
    observer.observe(el.querySelector('.window__body'));
    observer.observe(el.querySelector('.window__body > section'));
  });
  document.fonts?.ready.then(scheduleFit);
  document.addEventListener('load', scheduleFit, true);
  show();
}
function setupWindowControls() {
  // Each window's titlebar arrows step to the window above or below it.
  const order = ['top', 'prices', 'quote'];
  document.querySelectorAll('[data-window-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = order.indexOf(btn.closest('.crt')?.id);
      const step = btn.dataset.windowAction === 'up' ? -1 : 1;
      const targetId = order[Math.min(order.length - 1, Math.max(0, (idx < 0 ? order.length : idx) + step))];
      window.location.hash = `#${targetId}`;
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupEditableText() {
  const nodes = document.querySelectorAll('.editable[data-edit-key]');
  if (!nodes.length) return;

  nodes.forEach((el) => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('spellcheck');

    const key = el.getAttribute('data-edit-key');
    if (!key) return;
    const fallback = EDITABLE_DEFAULTS[key]?.[state.lang];
    if (fallback) el.innerHTML = fallback;

  });
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.documentElement.dataset.lang = state.lang;

  const title = t('meta.title');
  if (title) document.title = title;
  const description = t('meta.description');
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && description) metaDescription.setAttribute('content', description);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const value = t(key);
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (!key) return;
    const value = t(key);
    if (value != null) el.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (!key) return;
    const value = t(key);
    if (value != null) el.setAttribute('aria-label', value);
  });

  document.querySelectorAll('.editable[data-edit-key]').forEach((el) => {
    const key = el.getAttribute('data-edit-key');
    if (!key) return;
    const fallback = EDITABLE_DEFAULTS[key]?.[state.lang];
    if (fallback != null) el.innerHTML = fallback;
  });

  renderAssetDownloadList();
}

function renderAssetDownloadList() {
  const root = document.getElementById('downloadFilesList');
  const empty = document.getElementById('downloadFilesEmpty');
  const hint = document.getElementById('downloadFilesHint');
  if (!root) return;

  const lang = state.lang === 'en' ? 'en' : 'it';
  root.innerHTML = '';

  if (!ASSET_DOWNLOADS.length) {
    if (empty) empty.hidden = false;
    if (hint) hint.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (hint) hint.hidden = false;

  ASSET_DOWNLOADS.forEach((entry) => {
    const file = String(entry.file || '').replace(/^\/+/, '');
    if (!file) return;
    const li = document.createElement('li');
    li.className = 'download-files__item';
    const a = document.createElement('a');
    a.className = 'download-files__link';
    a.href = `./assets/${file}`;
    a.setAttribute('download', file.split('/').pop() || file);
    const label = entry.label?.[lang] ?? file.split('/').pop() ?? file;
    a.textContent = label;
    li.appendChild(a);
    root.appendChild(li);
  });
}

function setupLanguageSwitcher() {
  const buttons = Array.from(document.querySelectorAll('[data-lang-button]'));
  if (!buttons.length) return;

  function setLanguage(lang) {
    state.lang = lang === 'en' ? 'en' : 'it';
    try { sessionStorage.setItem('blob.v2.lang', state.lang); } catch {} 

    buttons.forEach((btn) => {
      const active = btn.getAttribute('data-lang-button') === state.lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    applyI18n();
    renderQtyChips();
    setActiveChip('record', state.record);
    setActiveChip('sleeve', state.sleeve);
    setActiveChip('color', state.color);
    setActiveChip('weight', state.weight);
    setActiveChip('discs', state.discs);
    setActiveChip('rpm', state.rpm);
    setActiveChip('qty', state.qty);
    renderPrices();
    syncQuoteFormFromState();
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang-button');
      if (!lang) return;
      setLanguage(lang);
    });
  });

  setLanguage(state.lang);
}

function setupTaskbarPanel(buttonId, panelId, closeId) {
  const triggerBtn = document.getElementById(buttonId);
  const panel = document.getElementById(panelId);
  const closeBtn = document.getElementById(closeId);
  const titlebar = panel?.querySelector('.start-panel__titlebar');
  if (!triggerBtn || !panel || !closeBtn) return;

  function positionPanelNearButton() {
    if (panelId === 'startStoryPanel') {
      const panelRect = panel.getBoundingClientRect();
      const buttonRect = triggerBtn.getBoundingClientRect();
      const minLeft = 8;
      const maxLeft = Math.max(minLeft, window.innerWidth - panelRect.width - 8);
      const desiredLeft = buttonRect.right - panelRect.width;

      // Keep the panel docked above the taskbar while aligning to button right edge.
      panel.style.top = '';
      panel.style.bottom = 'calc(var(--taskbar-h) + 8px)';
      panel.style.left = `${Math.min(maxLeft, Math.max(minLeft, desiredLeft))}px`;
      return;
    }

    // Centered panels (infos + downloads).
    if (panelId !== 'infosPanel' && panelId !== 'downloadFilesPanel') return;

    panel.style.bottom = 'auto';
    const panelRect = panel.getBoundingClientRect();

    const minLeft = 8;
    const maxLeft = Math.max(minLeft, window.innerWidth - panelRect.width - 8);
    const minTop = 8;
    const maxTop = Math.max(minTop, window.innerHeight - panelRect.height - 8);

    // Open centered in the viewport.
    const desiredLeft = (window.innerWidth - panelRect.width) / 2;
    const desiredTop = (window.innerHeight - panelRect.height) / 2;

    panel.style.left = `${Math.min(maxLeft, Math.max(minLeft, desiredLeft))}px`;
    panel.style.top = `${Math.min(maxTop, Math.max(minTop, desiredTop))}px`;
  }

  function setOpen(open) {
    if (open) {
      closeOtherTaskbarPanels(panelId);
    }
    panel.classList.toggle('is-hidden', !open);
    triggerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open && panel.contains(document.activeElement)) {
      (window.matchMedia('(max-width:640px)').matches ? document.getElementById('startButton') : triggerBtn)?.focus({preventScroll:true});
    }
    if (open) {
      positionPanelNearButton();
      closeBtn.focus({preventScroll:true});
    }
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !panel.classList.contains('is-hidden');
    setOpen(!isOpen);
  });

  closeBtn.addEventListener('click', () => setOpen(false));

  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (!target.closest(`#${panelId}`) && !target.closest(`#${buttonId}`)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  if (!titlebar) return;

  let dragState = null;

  function clampPanelPosition() {
    const panelRect = panel.getBoundingClientRect();
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, window.innerWidth - panelRect.width - 8);
    const minTop = 8;
    const maxTop = Math.max(minTop, window.innerHeight - panelRect.height - 8);

    const currentLeft = parseFloat(panel.style.left || '8');
    const currentTop = parseFloat(panel.style.top || String(window.innerHeight - panelRect.height - 44));

    panel.style.left = `${Math.min(maxLeft, Math.max(minLeft, currentLeft))}px`;
    panel.style.top = `${Math.min(maxTop, Math.max(minTop, currentTop))}px`;
  }

  titlebar.addEventListener('pointerdown', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('.start-panel__close')) return;
    if (e.button !== 0) return;

    const panelRect = panel.getBoundingClientRect();
    panel.style.bottom = 'auto';
    panel.style.left = `${panelRect.left}px`;
    panel.style.top = `${panelRect.top}px`;

    dragState = {
      pointerId: e.pointerId,
      offsetX: e.clientX - panelRect.left,
      offsetY: e.clientY - panelRect.top,
    };

    titlebar.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  titlebar.addEventListener('pointermove', (e) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;
    const panelRect = panel.getBoundingClientRect();
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, window.innerWidth - panelRect.width - 8);
    const minTop = 8;
    const maxTop = Math.max(minTop, window.innerHeight - panelRect.height - 8);

    const nextLeft = Math.min(maxLeft, Math.max(minLeft, e.clientX - dragState.offsetX));
    const nextTop = Math.min(maxTop, Math.max(minTop, e.clientY - dragState.offsetY));

    panel.style.left = `${nextLeft}px`;
    panel.style.top = `${nextTop}px`;
  });

  titlebar.addEventListener('pointerup', (e) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;
    dragState = null;
    titlebar.releasePointerCapture(e.pointerId);
  });

  titlebar.addEventListener('pointercancel', (e) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return;
    dragState = null;
    titlebar.releasePointerCapture(e.pointerId);
  });

  window.addEventListener('resize', clampPanelPosition);
}

function setupStartButton() {
  const startButton = document.getElementById('startButton');
  if (!startButton) return;

  const menuPanel = document.getElementById('mobileStartMenuPanel');
  function setMenuOpen(open) {
    if (!menuPanel) return;
    if (open) closeOtherTaskbarPanels(); // close any open taskbar panels
    menuPanel.classList.toggle('is-hidden', !open);
    startButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    startButton.classList.toggle('is-active', open || document.getElementById('top')?.classList.contains('screen-active'));
  }

  function toggleMenu() {
    if (!menuPanel) return;
    const isOpen = !menuPanel.classList.contains('is-hidden');
    setMenuOpen(!isOpen);
  }

  // Start opens the start menu at every width (its first item goes back to the start window).
  startButton.addEventListener('click', (e) => {
    if (!menuPanel) {
      focusTopSection();
      return;
    }
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when selecting an item; delegate "open panel" actions by clicking the existing triggers.
  menuPanel?.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const triggerId = target.closest('[data-mobile-trigger]')?.getAttribute('data-mobile-trigger');
    if (triggerId) {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(false);
      // Trigger on the next tick so the original click can't immediately close the panel
      // via the global "click outside" listeners used by taskbar panels.
      window.setTimeout(() => {
        const trigger = document.getElementById(triggerId);
        trigger?.click();
      }, 0);
      return;
    }

    // Any link inside the menu should close it (hash navigation remains normal).
    const link = target.closest('a[href]');
    if (link) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('click', (e) => {
    if (!menuPanel) return;
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (!target.closest('#mobileStartMenuPanel') && !target.closest('#startButton')) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!menuPanel) return;
    if (e.key === 'Escape') setMenuOpen(false);
  });
}

setupYear();
setupChips();
renderQtyChips();
enforceSleeveRules();
enforceColorRules();
enforceWeightRules();
enforceDiscRules();
enforceRpmRules();
renderPrices();
setupForm();
setupExtras();
setupCrtControls();
setupSettingsPanel();
setupThemeControls();
setupWindowControls();
setupTaskbarActive();
setupEditableText();
applyI18n();
setupLanguageSwitcher();

setupStartButton();
setupTaskbarPanel('downloadFilesButton', 'downloadFilesPanel', 'downloadFilesClose');
setupTaskbarPanel('infosButton', 'infosPanel', 'infosClose');
setupTaskbarPanel('storyButton', 'startStoryPanel', 'startStoryClose');

// After Formspree classic POST (+ optional reCAPTCHA), users return with ?sent=1.
if (new URLSearchParams(window.location.search).get('sent') === '1') {
  showPopup(t('form.quoteSentSuccess'), false, focusTopSection);
  const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
  window.history.replaceState({}, '', cleanUrl);
}

// After browser form restoration / autofill, keep qty in sync with app state (default 1000 for 12").
window.addEventListener('load', () => {
  setTimeout(() => {
    clampQtyToRecordOptions();
    renderQtyChips();
    syncQuoteFormFromState();
    setActiveChip('record', state.record);
    setActiveChip('sleeve', state.sleeve);
    setActiveChip('color', state.color);
    setActiveChip('weight', state.weight);
    setActiveChip('discs', state.discs);
    setActiveChip('rpm', state.rpm);
    setActiveChip('qty', state.qty);
    renderPrices();
    const sel = document.querySelector('#quoteForm select[name="qty"]');
    if (sel && sel.value !== String(state.qty)) {
      sel.value = String(state.qty);
    }
  }, 0);
});

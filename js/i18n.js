/* ───────────────────────────────────────────
   i18n — Bilingual EN / ES toggle
   Default language: English
   ─────────────────────────────────────────── */

(function () {
  'use strict';

  var STORAGE_KEY = 'jp-lang';
  var DEFAULT_LANG = 'en';

  /* ── Translation dictionary ── */
  var T = {

    /* ─── UI / Navigation ─── */
    'hero.subtitle':       { en: 'Visual Artist — Brenda Cisnero', es: 'Artista Visual — Brenda Cisnero' },
    'hero.enter':          { en: 'Enter', es: 'Entrar' },
    'nav.works':           { en: 'Works', es: 'Obras' },
    'nav.aboutme':         { en: 'About Me', es: 'Sobre mí' },
    'nav.contact':         { en: 'Contact', es: 'Contacto' },
    'nav.artist':          { en: 'Artist', es: 'Artista' },
    'hub.artist':          { en: 'Artist', es: 'Artista' },

    /* ─── Hub Cards ─── */
    'hub.bio.subtitle':    { en: 'Organic Matrices · AI · Video', es: 'Matrices orgánicas · IA · Video' },
    'hub.abs.subtitle':    { en: 'Mixed Media · 2022 / 2023', es: 'Técnica mixta · 2022 / 2023' },
    'hub.pla.subtitle':    { en: 'Mixed media · 2023 / 2024', es: 'Técnica mixta · 2023 / 2024' },

    /* ─── Biomaterials Intro ─── */
    'bio.label':           { en: 'Project', es: 'Proyecto' },
    'bio.title':           { en: 'Biomaterials — AI Generative', es: 'Biomateriales — IA Generativa' },
    'bio.intro.p1':        { en: 'Biomaterials – AI Generative is an artistic research project that explores the intersection between the organic and the digital. Starting from forms created with biodegradable materials, the artist generates unrepeatable matrices through high-resolution digital scanning.', es: 'Biomateriales – IA Generativa es un proyecto de investigación artística que explora la intersección entre lo orgánico y lo digital. A partir de formas creadas con materiales biodegradables, la artista genera matrices irrepetibles mediante escaneo digital de alta resolución.' },
    'bio.intro.p2':        { en: 'These matrices feed an artificial intelligence model trained with her visual archive, establishing a dialogue where emotion-words — not aesthetic commands — give rise to new works. The result is a body of work that moves between the fragility of the natural, the precision of the digital, and the intuition of the artificial.', es: 'Estas matrices alimentan un modelo de inteligencia artificial entrenado con su archivo visual, estableciendo un diálogo donde las palabras-emociones —no los comandos estéticos— dan origen a nuevas obras. El resultado es un cuerpo de trabajo que transita entre la fragilidad de lo natural, la precisión de lo digital y la intuición de lo artificial.' },

    /* ─── Biomaterials Artworks ─── */
    'bio.01.desc':         { en: 'Forms created with biodegradable materials, then scanned. Each scan is an unrepeatable "matrix." The digital texture IS the work.', es: 'Formas creadas con materiales biodegradables, luego escaneadas. Cada escaneo es una "matriz" irrepetible. La textura digital ES la obra.' },
    'bio.01.details':      { en: 'Biomaterial · 2025', es: 'Biomaterial · 2025' },
    'bio.scan1.desc':      { en: 'The scanner captures what the eye cannot see. Each piece exists only once, between the organic and the digital — the resulting texture is not a record, it is the work itself.', es: 'El escáner captura lo que el ojo no ve. Cada pieza existe una sola vez, entre lo orgánico y lo digital — la textura resultante no es registro, es la obra misma.' },
    'bio.scan1.details':   { en: 'Digital scan of biomaterial · 2025', es: 'Escaneo digital de biomaterial · 2025' },
    'bio.02.desc':         { en: 'The framed piece. The organic material, captured in its translucency, is presented as an object of contemplation — between fragility and permanence.', es: 'La pieza enmarcada. El material orgánico, capturado en su translucidez, se presenta como objeto de contemplación — entre la fragilidad y la permanencia.' },
    'bio.02.details':      { en: 'Framed biomaterial · 2025', es: 'Biomaterial enmarcado · 2025' },
    'bio.exhibit.title':   { en: 'Exhibition View', es: 'Vista de exhibición' },
    'bio.exhibit.desc':    { en: 'The organic matrices presented in gallery format. Over 120 documented pieces — each one exists only once, between the organic and the digital.', es: 'Las matrices orgánicas presentadas en formato de galería. Más de 120 piezas documentadas — cada una existe una sola vez, entre lo orgánico y lo digital.' },
    'bio.exhibit.details': { en: 'Biomaterials · 2025', es: 'Biomateriales · 2025' },
    'bio.03.desc':         { en: 'Each matrix is unrepeatable — the result of a precise moment in the life of the organic material.', es: 'Cada matriz es irrepetible — el resultado de un instante preciso en la vida del material orgánico.' },
    'bio.04.desc':         { en: 'The translucency of the biomaterial captured by the scanner reveals structures invisible to the eye — between the micro and the monumental.', es: 'La translucidez del biomaterial capturada por el escáner revela estructuras invisibles al ojo — entre lo micro y lo monumental.' },
    'bio.scan2.desc':      { en: 'Scanning as a creative act. The machine records what the eye cannot — each pass generates a new and unrepeatable work.', es: 'El escaneo como acto creativo. La máquina registra lo que el ojo no puede — cada pasada genera una obra nueva e irrepetible.' },
    'bio.scan2.details':   { en: 'Digital scan · 2025', es: 'Escaneo digital · 2025' },

    /* ─── AI Generative Images ─── */
    'gen.images':          { en: 'AI Generative · Images', es: 'AI Generativa · Imágenes' },
    'gen.details':         { en: 'AI Generative (Sora) · 2025', es: 'IA Generativa (Sora) · 2025' },
    'gen.01.desc':         { en: 'The scanned matrices feed a Sora model trained with her visual archive. She assigns words to each image — emotions, bonds, states of being.', es: 'Las matrices escaneadas alimentan un modelo Sora entrenado con su archivo visual. A cada imagen le asigna palabras — emociones, vínculos, estados del ser.' },
    'gen.02.desc':         { en: 'The model interprets the matrices through emotion-words. The result is not illustration — it is a dialogue between human sensitivity and artificial intelligence.', es: 'El modelo interpreta las matrices a través de palabras-emociones. El resultado no es ilustración — es un diálogo entre sensibilidad humana e inteligencia artificial.' },
    'gen.03.desc':         { en: 'Each generated image maintains the artist\'s aesthetic identity. It is not generic AI — it is an extension of her visual language.', es: 'Cada imagen generada mantiene la identidad estética de la artista. No es IA genérica — es extensión de su lenguaje visual.' },
    'gen.04.desc':         { en: 'The artist narrates experiences; the machine responds with visual form. A language between two intelligences.', es: 'La artista narra experiencias; la máquina responde con forma visual. Un lenguaje entre dos inteligencias.' },

    /* ─── AI Generative Videos ─── */
    'gen.videos':          { en: 'AI Generative · Video', es: 'AI Generativa · Video' },
    'vid.01.desc':         { en: 'The model responds with images and videos that are dialogue, not command. The process becomes part of the investigation.', es: 'El modelo responde con imágenes y videos que son diálogo, no comando. El procedimiento se vuelve parte de la investigación.' },
    'vid.02.desc':         { en: 'A language between two intelligences. The artist narrates experiences; the machine responds with visual form.', es: 'Un lenguaje entre dos inteligencias. La artista narra experiencias; la máquina responde con forma visual.' },
    'vid.03.desc':         { en: 'Each generated video maintains the artist\'s aesthetic identity — it is not generic AI, it is an extension of her visual language.', es: 'Cada video generado mantiene la identidad estética de la artista — no es IA genérica, es extensión de su lenguaje visual.' },

    /* ─── Abstract Art Intro ─── */
    'abs.label':           { en: 'Series 2022–2023', es: 'Serie 2022–2023' },
    'abs.title':           { en: 'Textures Becomes Structure', es: 'Texturas de la estructura' },
    'abs.section.name':    { en: 'Textures Becomes Structure', es: 'Texturas de la estructura' },
    'abs.intro.p1':        { en: 'In this abstract collection, the artist explores a diversity of works that emerge from her emotions, transforming them into a powerful tool of creation. Each piece invites the viewer to immerse in a world of sensations and reflections, where abstraction comes alive through personal expression.', es: 'En esta colección abstracta, la artista explora una diversidad de obras que surgen de sus emociones, convirtiéndolas en una poderosa herramienta de creación. Cada pieza invita al espectador a sumergirse en un mundo de sensaciones y reflexiones, donde lo abstracto cobra vida a través de la expresión personal.' },
    'abs.intro.p2':        { en: 'The emotional connection established between art and observer is fundamental to this artistic proposal.', es: 'La conexión emocional que se establece entre el arte y el observador es fundamental en esta propuesta artística.' },

    /* ─── Abstract Artworks (shared labels) ─── */
    'abs.details':         { en: 'Mixed media · Acrylic', es: 'Técnica mixta · Acrílico' },
    'abs.category':        { en: 'Abstract painting', es: 'Pintura abstracta' },

    /* ─── Platasí Label ─── */
    'platasi.label':       { en: 'Series 2023–2024', es: 'Serie 2023 / 2024' },

    /* ─── Platasí Artworks — Subtitles ─── */
    'pla.sub.01':          { en: 'Surface as threshold', es: 'La superficie como umbral' },
    'pla.sub.02':          { en: 'Immediate celebration', es: 'Celebración inmediata' },
    'pla.sub.03':          { en: 'A rehearsal of care', es: 'Un ensayo de cuidado' },
    'pla.sub.04':          { en: 'Force as structure', es: 'La fuerza como estructura' },
    'pla.sub.05':          { en: 'Desire without restraint', es: 'Deseo sin contención' },
    'pla.sub.06':          { en: 'Style as assertion', es: 'El estilo como afirmación' },
    'pla.sub.07':          { en: 'Persistence in decline', es: 'Persistencia en el declive' },
    'pla.sub.08':          { en: 'The elegance of excess', es: 'La elegancia del exceso' },

    /* ─── Platasí Artworks — Descriptions ─── */
    'pla.desc.01':         { en: 'The surface seduces, but it is not enough. Something breaks outside any organic logic, revealing an interior that unsettles the idea of value. What is attractive persists, even as it begins to collapse.', es: 'La superficie seduce, pero no es suficiente. Algo se quiebra por fuera de toda lógica orgánica, revelando un interior que desestabiliza la idea de valor. Lo atractivo persiste, incluso cuando comienza a colapsar.' },
    'pla.desc.02':         { en: 'The image surrenders to the brightness of the moment. Everything expands toward enjoyment, yet its own condition suggests fragility. What radiates does not seek to last, only to intensify before fading.', es: 'La imagen se entrega al brillo del momento. Todo se expande hacia el goce, aunque su propia condición sugiere fragilidad. Lo que irradia no busca durar, solo intensificarse antes de apagarse.' },
    'pla.desc.03':         { en: 'A structure emerges in an attempt to organize. The form seeks support from something external, as if it needed guidance to sustain itself. There is a forced tenderness, a balance that has not yet become internal.', es: 'Una estructura emerge en un intento de organizar. La forma busca apoyo en algo externo, como si necesitara guía para sostenerse. Hay una ternura forzada, un equilibrio que aún no se ha vuelto interno.' },
    'pla.desc.04':         { en: 'Containment becomes more rigid. The form asserts itself through pressure, leaving a trace behind. It is no longer about care, but direction, a force that organizes while simultaneously constraining.', es: 'La contención se vuelve más rígida. La forma se impone a través de la presión, dejando una huella. Ya no se trata de cuidado, sino de dirección, una fuerza que organiza al tiempo que constriñe.' },
    'pla.desc.05':         { en: 'The image opens into a logic of excess. Everything becomes available, visible, exchangeable. Pleasure unfolds without mediation, within a space where intensity blurs the line between desire and consumption.', es: 'La imagen se abre a una lógica de exceso. Todo se vuelve disponible, visible, intercambiable. El placer se despliega sin mediación, en un espacio donde la intensidad desdibuja la línea entre deseo y consumo.' },
    'pla.desc.06':         { en: 'The form becomes a statement. What once remained implicit now appears with clarity and speed. There is a will to reveal without hesitation, where the process itself becomes surface.', es: 'La forma se convierte en declaración. Lo que antes permanecía implícito ahora aparece con claridad y velocidad. Hay una voluntad de revelar sin titubear, donde el proceso mismo se vuelve superficie.' },
    'pla.desc.07':         { en: 'The image moves through its own deterioration. What remains is not absence, but another form of presence. Between abandonment and residual shine, the material continues to speak, even when it no longer conforms.', es: 'La imagen transita su propio deterioro. Lo que queda no es ausencia, sino otra forma de presencia. Entre abandono y brillo residual, el material sigue hablando, incluso cuando ya no se conforma.' },
    'pla.desc.08':         { en: 'The form reaches an unstable synthesis. Provocation and control, beauty and solitude coexist. What is presented does not resolve, it remains suspended in its own intensity.', es: 'La forma alcanza una síntesis inestable. Provocación y control, belleza y soledad coexisten. Lo que se presenta no se resuelve, queda suspendido en su propia intensidad.' },

    /* ─── Statement ─── */
    'stmt.quote':          { en: 'My practice stems from a desire to transform experience into visual form. I work with painting — in both its hyperrealist and abstract modes — to explore how the body and feminine identity are configured as terrain for resistance, visibility, and transformation.', es: 'Mi práctica parte de una voluntad de transformar experiencia en forma visual. Trabajo con pintura —en sus modos hiperrealista y abstracto— para explorar cómo el cuerpo y la identidad femenina se configuran como terreno de resistencia, visibilidad y transformación.' },
    'stmt.p2':             { en: 'I propose an attentive contemplation, where what usually remains hidden emerges as a trace, as visual language. I believe art can operate in both institutional contexts and in settings that privilege accessibility.', es: 'Propongo una contemplación atenta, donde lo que usualmente permanece oculto emerge como huella, como lenguaje visual. Creo que el arte puede operar tanto en contextos institucionales como en escenarios que privilegian la accesibilidad.' },

    /* ─── About ─── */
    'about.title':         { en: 'About Me', es: 'Sobre mí' },
    'about.p1':            { en: 'Brenda Cisnero, born in Villa Gesell, is an independent visual artist with a degree in Arts. Her practice centers on hyperrealist and abstract painting, exploring the body, feminine identity, and transformation through a critical and contemporary gaze.', es: 'Brenda Cisnero, nacida en Villa Gesell, es artista visual independiente y licenciada en Artes. Su práctica se centra en la pintura hiperrealista y abstracta, explorando el cuerpo, la identidad femenina y la transformación a través de una mirada crítica y contemporánea.' },
    'about.p2':            { en: 'She is currently in the United States, in a process of creative expansion that includes her studies at Stanford University. From there, she deepens new tools and perspectives that enrich her practice and way of conceiving art.', es: 'Actualmente se encuentra en Estados Unidos, en un proceso de expansión creativa que incluye su formación en Stanford University. Desde allí, profundiza en nuevas herramientas y perspectivas que enriquecen su práctica y su modo de concebir el arte.' },
    'about.p3':            { en: 'With over a decade of teaching experience and work in museum spaces, Brenda consolidated her exclusive dedication to visual arts in 2024. She is the founder of Juana Perfecta, a project that integrates aesthetic sensitivity and creative vision to broaden access to contemporary art.', es: 'Con más de una década de experiencia docente y trabajo en espacios museísticos, Brenda consolidó su dedicación exclusiva a las artes visuales en 2024. Es fundadora de Juana Perfecta, proyecto que integra sensibilidad estética y visión creativa para ampliar el acceso al arte contemporáneo.' },

    /* ─── Skills ─── */
    'skill.painting':      { en: 'Painting', es: 'Pintura' },
    'skill.sculpture':     { en: 'Sculpture', es: 'Escultura' },
    'skill.digital':       { en: 'Digital Art', es: 'Arte Digital' },
    'skill.bio':           { en: 'Biomaterials', es: 'Biomateriales' },
    'skill.ai':            { en: 'AI Generative', es: 'IA Generativa' },
    'skill.video':         { en: 'Videoperformance', es: 'Videoperformance' },
    'skill.install':       { en: 'Installation', es: 'Instalación' },

    /* ─── Contact ─── */
    'contact.whatsapp':    { en: 'Send message', es: 'Enviar mensaje' },
    'contact.phone.us':    { en: 'Phone USA', es: 'Teléfono USA' },
    'contact.phone.ar':    { en: 'Phone Argentina', es: 'Teléfono Argentina' },
    'form.name':           { en: 'Name', es: 'Nombre' },
    'form.message':        { en: 'Message', es: 'Mensaje' },
    'form.submit':         { en: 'Send message', es: 'Enviar mensaje' },

    /* ─── Biomaterials transition rooms ─── */
    'process.intro.text':  { en: 'These images document biomaterial matrices created by hand and scanned during different stages of their transformation.', es: 'Estas imágenes documentan matrices de biomateriales creadas a mano y escaneadas durante distintas etapas de su transformación.' },
    'process.intro.label': { en: 'from matter to model', es: 'de la materia al modelo' },
    'video.intro.text':    { en: 'Trained on these biomaterial matrices, the model translates their visual vocabulary into motion.', es: 'Entrenado con estas matrices de biomateriales, el modelo traduce su vocabulario visual al movimiento.' },
    'video.intro.label':   { en: 'motion · generative', es: 'movimiento · generativo' },
    'bio.footer.hint':     { en: 'hover a word', es: 'pasá el cursor por una palabra' },

    /* ─── Section jump labels ─── */
    'section.matrix':      { en: 'matrix', es: 'matrices' },
    'section.generated':   { en: 'generated', es: 'generado' },
    'section.motion':      { en: 'motion', es: 'movimiento' },

    /* ─── Meta / Misc ─── */
    'meta.matrices':       { en: 'Matrices', es: 'Matrices' }
  };

  /* ── Core functions ── */

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function applyLang(lang) {
    document.documentElement.lang = lang;

    /* Swap data-i18n content (innerHTML for entries with HTML tags) */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (T[key] && T[key][lang]) {
        var value = T[key][lang];
        if (value.indexOf('<') !== -1) {
          el.innerHTML = value;
        } else {
          el.textContent = value;
        }
      }
    });

    /* Update section jump labels if visible */
    var prevLabel = document.getElementById('jump-prev-label');
    var nextLabel = document.getElementById('jump-next-label');
    var LABEL_MAP = { matrix: 'section.matrix', generated: 'section.generated', motion: 'section.motion' };
    if (prevLabel && prevLabel.dataset.section) {
      var key = LABEL_MAP[prevLabel.dataset.section];
      if (key && T[key]) prevLabel.textContent = T[key][lang];
    }
    if (nextLabel && nextLabel.dataset.section) {
      var key2 = LABEL_MAP[nextLabel.dataset.section];
      if (key2 && T[key2]) nextLabel.textContent = T[key2][lang];
    }

    /* Update toggle button aria-label */
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    }
  }

  function toggleLang() {
    var current = getLang();
    setLang(current === 'en' ? 'es' : 'en');
  }

  /* ── Init ── */
  function init() {
    var lang = getLang();
    applyLang(lang);

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', toggleLang);
    }
  }

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose for external use */
  window.I18n = { setLang: setLang, getLang: getLang, toggle: toggleLang };

})();

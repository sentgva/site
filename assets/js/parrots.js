/* Amazona — данные о птицах и генератор SVG-иллюстраций.
   Фото лежат в assets/img, авторы и лицензии указаны в поле credit (выводятся в подвале).
   parrotSVG() рисует иллюстрированного попугая-талисмана по цветам из поля c.
   Чтобы добавить птицу, допишите объект в PARROTS. */
(function () {
  'use strict';

  const PARROTS = [
    {
      id: 'ararauna', name: 'Ара сине-жёлтый', latin: 'Ara ararauna',
      size: 'large', length: 86, life: 60, talk: 3, cites: 'II',
      price: 380000, status: 'В наличии', say: 'Привет!',
      tint: '#1F6FD1',
      photo: 'assets/img/ararauna.jpg', alt: 'Сине-жёлтый ара в полёте над лесом',
      credit: { author: 'Luc Viatour', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Ara_ararauna_Luc_Viatour.jpg' },
      c: {
        body: '#1F6FD1', head: '#2B7FE0', belly: '#F5B82E', wing: '#1A60C2', tip: '#123E86',
        tail: '#1A5BB6', face: '#FFFFFF', stripes: true, forehead: '#35A35A',
        beak: '#1E1F22', beakLow: '#1E1F22', longTail: true
      }
    },
    {
      id: 'macao', name: 'Ара красный', latin: 'Ara macao',
      size: 'large', length: 85, life: 50, talk: 3, cites: 'I',
      price: 450000, status: 'Под заказ', say: 'Ррр-привет!',
      tint: '#E0352B',
      photo: 'assets/img/macao.jpg', alt: 'Красный ара сидит на ветке среди листвы',
      credit: { author: 'Charles J. Sharp', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Scarlet_macaw_(Ara_macao_cyanopterus)_Copan.jpg' },
      c: {
        body: '#E0352B', head: '#E8412F', belly: '#D92E25', wing: '#F5B82E', tip: '#1F6FD1',
        tail: '#C9281F', face: '#FBF4EC', beak: '#F1E6CF', beakLow: '#1E1F22', longTail: true
      }
    },
    {
      id: 'galerita', name: 'Какаду большой желтохохлый', latin: 'Cacatua galerita',
      size: 'large', length: 50, life: 70, talk: 2, cites: 'II',
      price: 290000, status: 'В наличии', say: 'Почеши голову',
      tint: '#F5C518',
      photo: 'assets/img/galerita.jpg', alt: 'Большой желтохохлый какаду на ветке',
      credit: { author: 'JJ Harrison', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Cacatua_galerita_Tas_2.jpg' },
      c: {
        body: '#FAF8F2', head: '#FFFFFF', belly: '#F1EEE4', wing: '#EFEBE0', tip: '#E3DDCD',
        tail: '#ECE7D8', crest: '#F5C518', beak: '#2A2B30', beakLow: '#2A2B30', outline: true
      }
    },
    {
      id: 'erithacus', name: 'Жако', latin: 'Psittacus erithacus',
      size: 'medium', length: 33, life: 50, talk: 5, cites: 'I',
      price: 210000, status: 'В наличии', say: 'Алло? Кто там?',
      tint: '#7D8A93',
      photo: 'assets/img/erithacus.jpg', alt: 'Серый попугай жако на коряге',
      credit: { author: 'Florettesokeng', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Perroquet_%C3%A0_Yampopo_Beach_-_Douala.jpg' },
      c: {
        body: '#8F979D', head: '#A2A9AE', belly: '#A9AFB4', wing: '#7B8388', tip: '#565D62',
        tail: '#D8322A', faceSmall: '#E8E8E4', iris: '#F4E9B8', beak: '#222326', beakLow: '#222326'
      }
    },
    {
      id: 'eclectus', name: 'Благородный попугай', latin: 'Eclectus roratus',
      size: 'medium', length: 40, life: 30, talk: 4, cites: 'II',
      price: 240000, status: 'В наличии', say: 'Яблочко!',
      tint: '#C8243A', feathers: ['#C8243A', '#5B3FA8', '#F5B82E', '#E0402A'],
      photo: 'assets/img/eclectus.jpg', alt: 'Самка благородного попугая на ветке',
      credit: { author: 'Selena N. B. H.', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Eclectus_roratus_-North_Carolina_Zoo,_Asheboro,_North_Carolina,_USA_-female-8a_(1).jpg' },
      c: {
        body: '#2FA24B', head: '#3AB457', belly: '#35A94F', wing: '#28903F', tip: '#1E5DB0',
        tail: '#2A9444', beak: '#F58A2E', beakLow: '#2A2A2A'
      }
    },
    {
      id: 'lorikeet', name: 'Радужный лорикет', latin: 'Trichoglossus moluccanus',
      size: 'small', length: 30, life: 20, talk: 2, cites: 'II',
      price: 95000, status: 'В наличии', say: 'Нектар есть?',
      tint: '#2F4FC9',
      photo: 'assets/img/lorikeet.jpg', alt: 'Радужный лорикет среди цветов',
      credit: { author: 'Charles J. Sharp', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Rainbow_lorikeet_(Trichoglossus_moluccanus_moluccanus)_Sydney.jpg' },
      c: {
        body: '#35A64B', head: '#2F4FC9', belly: '#F4702A', wing: '#2E9A45', tip: '#1D6B34',
        tail: '#3AAE52', beak: '#E8402A', beakLow: '#E8402A'
      }
    },
    {
      id: 'aestiva', name: 'Амазон синелобый', latin: 'Amazona aestiva',
      size: 'medium', length: 37, life: 50, talk: 4, cites: 'II',
      price: 120000, status: 'В наличии', say: 'Гулять!',
      tint: '#3FA34D',
      photo: 'assets/img/aestiva.jpg', alt: 'Синелобый амазон на сухом дереве',
      credit: { author: 'Charles J. Sharp', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Turquoise-fronted_amazon_(Amazona_aestiva)_older_adult.JPG' },
      c: {
        body: '#3FA34D', head: '#47AF55', belly: '#4DB65A', wing: '#36924A', tip: '#2A5FA8',
        tail: '#3C9F4B', face: '#F5C83A', forehead: '#3C7BD8', beak: '#2B2B2B', beakLow: '#2B2B2B'
      }
    },
    {
      id: 'solstitialis', name: 'Солнечная аратинга', latin: 'Aratinga solstitialis',
      size: 'small', length: 30, life: 25, talk: 2, cites: 'II',
      price: 45000, status: 'В наличии', say: 'Солнышко!',
      tint: '#F7A51C',
      photo: 'assets/img/solstitialis.jpg', alt: 'Две солнечные аратинги на ветке',
      credit: { author: 'Wayne Deeker', license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
        source: 'https://commons.wikimedia.org/wiki/File:Aratinga_solstitialis_-captive-two-8a.jpg' },
      c: {
        body: '#F7A51C', head: '#F9C22C', belly: '#F4851E', wing: '#F6C43C', tip: '#2F9E5B',
        tail: '#5E9E48', face: '#F47A1F', beak: '#2B2B2B', beakLow: '#2B2B2B'
      }
    }
  ];

  const r1 = (n) => Math.round(n * 10) / 10;

  // Вытянутая форма от основания (bx, by) к кончику (tx, ty) шириной w: перо хохла или листочек пальмы
  function feather(bx, by, tx, ty, w) {
    const dx = tx - bx, dy = ty - by;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * w, ny = (dx / len) * w;
    const ax = bx + dx * 0.35, ay = by + dy * 0.35;
    const cx = bx + dx * 0.78, cy = by + dy * 0.78;
    return `M${r1(bx)} ${r1(by)}C${r1(ax + nx)} ${r1(ay + ny)} ${r1(cx + nx * 0.5)} ${r1(cy + ny * 0.5)} ${r1(tx)} ${r1(ty)}` +
      `C${r1(cx - nx * 0.5)} ${r1(cy - ny * 0.5)} ${r1(ax - nx)} ${r1(ay - ny)} ${r1(bx)} ${r1(by)}Z`;
  }

  let blinkSeed = 0;

  function parrotSVG(p) {
    const c = p.c;
    const ol = c.outline ? ' stroke="rgba(16,38,30,.18)" stroke-width="1.2"' : '';
    const tail = c.longTail
      ? 'M86 186C80 220 70 248 58 276C64 279 69 278 72 274C84 248 96 222 108 192Z'
      : 'M88 188C84 206 78 220 70 232C75 237 81 238 86 234C95 221 101 207 106 193Z';
    const crest = c.crest
      ? [[106, 52, 58, 26], [110, 46, 70, 10], [116, 42, 90, 3], [123, 40, 110, 5]]
          .map(([a, b, x, y]) => `<path d="${feather(a, b, x, y, 7)}" fill="${c.crest}"${ol}/>`).join('')
      : '';
    const forehead = c.forehead
      ? `<path d="M126 40C138 42 147 50 150 60C142 56 134 54 124 55C121 49 122 44 126 40Z" fill="${c.forehead}"/>` : '';
    const face = c.face
      ? `<path d="M110 58C120 46 142 50 147 62C150 76 141 89 127 89C114 88 106 76 110 58Z" fill="${c.face}"/>` : '';
    const faceSmall = c.faceSmall
      ? `<ellipse cx="126" cy="63" rx="12" ry="10" fill="${c.faceSmall}"/>` : '';
    const stripes = c.stripes
      ? '<g fill="none" stroke="#1E1F22" stroke-width="1.4" stroke-linecap="round" opacity=".55">' +
        '<path d="M116 72C122 74 128 74 135 72"/><path d="M118 78C124 80 130 80 137 78"/><path d="M122 84C126 85 130 85 134 84"/></g>'
      : '';
    const blink = -((blinkSeed++ * 1.7) % 5.5);

    return `<svg class="parrot-svg" viewBox="0 0 200 280" role="img" aria-label="${p.name}" style="--blink:${blink.toFixed(1)}s">
  <path d="${tail}" fill="${c.tail}"${ol}/>
  <path d="M120 80C146 92 152 132 140 168C132 192 114 204 98 200C82 196 76 164 80 132C84 106 98 86 120 80Z" fill="${c.body}"${ol}/>
  <path d="M136 104C148 128 146 162 134 184C126 196 114 200 104 198C118 176 126 140 136 104Z" fill="${c.belly}"/>
  <path d="M80 132C84 106 98 86 120 80C102 96 92 130 96 168C98 186 100 196 98 200C82 196 76 164 80 132Z" fill="#000" opacity=".08"/>
  <g class="pt-wing">
    <path d="M100 98C120 104 126 140 116 172C108 196 94 214 80 226C74 204 72 166 76 136C78 116 88 100 100 98Z" fill="${c.wing}"${ol}/>
    <path d="M116 170C108 196 94 214 80 226C76 210 76 190 78 172C92 178 104 177 116 170Z" fill="${c.tip}"/>
    <g fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.6" stroke-linecap="round"><path d="M81 128C92 134 106 134 119 128"/><path d="M78 150C91 156 106 156 121 149"/></g>
  </g>
  <path d="M-160 216C-60 208 40 204 110 205C190 206 270 198 360 192" fill="none" stroke="#6E4629" stroke-width="11" stroke-linecap="round"/>
  <path d="M20 208C44 205 66 204 88 205" fill="none" stroke="#9A6A42" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
  <path d="M176 201C182 186 194 180 204 181C200 194 190 202 176 201Z" fill="#3E9B57"/>
  <g fill="#8B8F94"><ellipse cx="104" cy="203" rx="7.5" ry="5"/><ellipse cx="120" cy="202" rx="7.5" ry="5"/></g>
  <g class="pt-head">
    <g class="pt-crest">${crest}</g>
    <circle cx="122" cy="68" r="30" fill="${c.head}"${ol}/>
    ${forehead}${face}${faceSmall}${stripes}
    <g class="pt-eye"><circle cx="126" cy="62" r="6.5" fill="${c.iris || '#FFFFFF'}" stroke="rgba(0,0,0,.25)" stroke-width="1"/><g class="pt-pupil"><circle cx="126" cy="62" r="3.6" fill="#15171A"/><circle cx="127.4" cy="60.6" r="1.2" fill="#FFFFFF"/></g></g>
    <path d="M141 76C150 76 157 83 155 91C149 94 143 92 140 86Z" fill="${c.beakLow}"/>
    <path d="M142 56C158 54 168 68 164 86C162 94 157 96 154 92C156 82 152 74 142 74C139 68 139 61 142 56Z" fill="${c.beak}"/>
    <path d="M147 60C155 60 160 66 161 74" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`;
  }

  window.AMAZONA = { PARROTS, parrotSVG, feather };
})();

// ============================================================
// QuizRush - SVG Avatar System
// 16 cute, modern, flat-design animal avatars
// ============================================================

const AVATARS = [
  {
    id: 'fox',
    name: 'Fox',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FF6B35"/>
      <polygon points="20,35 30,5 42,30" fill="#FF8C5A"/>
      <polygon points="80,35 70,5 58,30" fill="#FF8C5A"/>
      <polygon points="20,35 30,5 42,30" fill="none" stroke="#E5552A" stroke-width="2"/>
      <polygon points="80,35 70,5 58,30" fill="none" stroke="#E5552A" stroke-width="2"/>
      <ellipse cx="35" cy="52" rx="14" ry="12" fill="#FFF5E6"/>
      <ellipse cx="65" cy="52" rx="14" ry="12" fill="#FFF5E6"/>
      <path d="M42 68 Q50 78 58 68" fill="#FFF5E6" stroke="#FFF5E6" stroke-width="1"/>
      <circle cx="38" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="62" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="40" cy="42" r="2" fill="white"/>
      <circle cx="64" cy="42" r="2" fill="white"/>
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#2D1B0E"/>
      <path d="M50 65.5 L50 70 Q50 74 46 74" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
      <path d="M50 65.5 L50 70 Q50 74 54 74" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'cat',
    name: 'Cat',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#9B72CF"/>
      <polygon points="18,38 25,4 40,32" fill="#B48DE0"/>
      <polygon points="82,38 75,4 60,32" fill="#B48DE0"/>
      <polygon points="18,38 25,4 40,32" fill="none" stroke="#7E55B2" stroke-width="2"/>
      <polygon points="82,38 75,4 60,32" fill="none" stroke="#7E55B2" stroke-width="2"/>
      <circle cx="36" cy="46" r="7" fill="#FFE066"/>
      <circle cx="64" cy="46" r="7" fill="#FFE066"/>
      <circle cx="36" cy="46" r="4" fill="#2D1B0E"/>
      <circle cx="64" cy="46" r="4" fill="#2D1B0E"/>
      <circle cx="38" cy="44" r="1.5" fill="white"/>
      <circle cx="66" cy="44" r="1.5" fill="white"/>
      <ellipse cx="50" cy="60" rx="4" ry="3" fill="#FFB6C1"/>
      <path d="M46 64 Q50 70 54 64" fill="none" stroke="#2D1B0E" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="18" y1="52" x2="34" y2="56" stroke="#7E55B2" stroke-width="1.5"/>
      <line x1="18" y1="58" x2="34" y2="58" stroke="#7E55B2" stroke-width="1.5"/>
      <line x1="82" y1="52" x2="66" y2="56" stroke="#7E55B2" stroke-width="1.5"/>
      <line x1="82" y1="58" x2="66" y2="58" stroke="#7E55B2" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: 'dog',
    name: 'Dog',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#C4915E"/>
      <ellipse cx="24" cy="36" rx="14" ry="20" fill="#A0724A" transform="rotate(-15,24,36)"/>
      <ellipse cx="76" cy="36" rx="14" ry="20" fill="#A0724A" transform="rotate(15,76,36)"/>
      <ellipse cx="50" cy="62" rx="18" ry="14" fill="#F5E6D3"/>
      <circle cx="38" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="62" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="40" cy="42" r="2" fill="white"/>
      <circle cx="64" cy="42" r="2" fill="white"/>
      <ellipse cx="50" cy="58" rx="6" ry="4.5" fill="#2D1B0E"/>
      <ellipse cx="50" cy="57" rx="3" ry="2" fill="#8B6B52"/>
      <path d="M44 66 Q50 74 56 66" fill="#E86B6B" stroke="none"/>
    </svg>`
  },
  {
    id: 'lion',
    name: 'Lion',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#DAA520"/>
      <circle cx="50" cy="52" r="38" fill="#F4C430"/>
      <circle cx="15" cy="35" r="10" fill="#DAA520"/>
      <circle cx="85" cy="35" r="10" fill="#DAA520"/>
      <circle cx="20" cy="55" r="9" fill="#DAA520"/>
      <circle cx="80" cy="55" r="9" fill="#DAA520"/>
      <circle cx="25" cy="20" r="9" fill="#DAA520"/>
      <circle cx="75" cy="20" r="9" fill="#DAA520"/>
      <circle cx="40" cy="12" r="8" fill="#DAA520"/>
      <circle cx="60" cy="12" r="8" fill="#DAA520"/>
      <circle cx="38" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="62" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="40" cy="42" r="2" fill="white"/>
      <circle cx="64" cy="42" r="2" fill="white"/>
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#2D1B0E"/>
      <path d="M45 63 Q50 70 55 63" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'frog',
    name: 'Frog',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="54" r="44" fill="#4CAF50"/>
      <circle cx="32" cy="22" r="16" fill="#66BB6A"/>
      <circle cx="68" cy="22" r="16" fill="#66BB6A"/>
      <circle cx="32" cy="22" r="10" fill="white"/>
      <circle cx="68" cy="22" r="10" fill="white"/>
      <circle cx="34" cy="22" r="5" fill="#2D1B0E"/>
      <circle cx="70" cy="22" r="5" fill="#2D1B0E"/>
      <circle cx="35" cy="20" r="2" fill="white"/>
      <circle cx="71" cy="20" r="2" fill="white"/>
      <path d="M30 58 Q50 72 70 58" fill="none" stroke="#2D1B0E" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="42" cy="56" rx="4" ry="2.5" fill="#FF8A80"/>
      <ellipse cx="58" cy="56" rx="4" ry="2.5" fill="#FF8A80"/>
    </svg>`
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="52" r="46" fill="#F8BBD0"/>
      <polygon points="50,0 44,30 56,30" fill="#FFD54F"/>
      <polygon points="50,0 44,30 56,30" fill="none" stroke="#FFC107" stroke-width="1.5"/>
      <ellipse cx="28" cy="30" rx="10" ry="16" fill="#F48FB1" transform="rotate(-20,28,30)"/>
      <ellipse cx="72" cy="30" rx="10" ry="16" fill="#F48FB1" transform="rotate(20,72,30)"/>
      <circle cx="38" cy="48" r="5" fill="#7B1FA2"/>
      <circle cx="62" cy="48" r="5" fill="#7B1FA2"/>
      <circle cx="40" cy="46" r="2" fill="white"/>
      <circle cx="64" cy="46" r="2" fill="white"/>
      <path d="M44 64 Q50 70 56 64" fill="none" stroke="#AD1457" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="30" cy="60" rx="6" ry="4" fill="#FF80AB" opacity="0.5"/>
      <ellipse cx="70" cy="60" rx="6" ry="4" fill="#FF80AB" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'penguin',
    name: 'Penguin',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#37474F"/>
      <ellipse cx="50" cy="58" rx="28" ry="30" fill="#ECEFF1"/>
      <circle cx="38" cy="40" r="5" fill="white"/>
      <circle cx="62" cy="40" r="5" fill="white"/>
      <circle cx="39" cy="41" r="3" fill="#2D1B0E"/>
      <circle cx="63" cy="41" r="3" fill="#2D1B0E"/>
      <circle cx="40" cy="39" r="1.2" fill="white"/>
      <circle cx="64" cy="39" r="1.2" fill="white"/>
      <polygon points="50,50 42,58 50,64 58,58" fill="#FF9800"/>
      <ellipse cx="22" cy="55" rx="8" ry="15" fill="#455A64" transform="rotate(-10,22,55)"/>
      <ellipse cx="78" cy="55" rx="8" ry="15" fill="#455A64" transform="rotate(10,78,55)"/>
    </svg>`
  },
  {
    id: 'panda',
    name: 'Panda',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="white"/>
      <circle cx="26" cy="28" r="14" fill="#2D1B0E"/>
      <circle cx="74" cy="28" r="14" fill="#2D1B0E"/>
      <ellipse cx="36" cy="44" rx="12" ry="10" fill="#2D1B0E"/>
      <ellipse cx="64" cy="44" rx="12" ry="10" fill="#2D1B0E"/>
      <circle cx="36" cy="43" r="5" fill="white"/>
      <circle cx="64" cy="43" r="5" fill="white"/>
      <circle cx="37" cy="42" r="2.5" fill="#2D1B0E"/>
      <circle cx="65" cy="42" r="2.5" fill="#2D1B0E"/>
      <circle cx="38" cy="41" r="1" fill="white"/>
      <circle cx="66" cy="41" r="1" fill="white"/>
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#2D1B0E"/>
      <path d="M45 64 Q50 70 55 64" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'owl',
    name: 'Owl',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#795548"/>
      <polygon points="38,8 50,20 42,20" fill="#A1887F"/>
      <polygon points="62,8 50,20 58,20" fill="#A1887F"/>
      <circle cx="36" cy="44" r="14" fill="#FFF8E1"/>
      <circle cx="64" cy="44" r="14" fill="#FFF8E1"/>
      <circle cx="36" cy="44" r="8" fill="#FF8F00"/>
      <circle cx="64" cy="44" r="8" fill="#FF8F00"/>
      <circle cx="36" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="64" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="38" cy="42" r="2" fill="white"/>
      <circle cx="66" cy="42" r="2" fill="white"/>
      <polygon points="50,56 46,62 54,62" fill="#FF8F00"/>
      <ellipse cx="50" cy="72" rx="16" ry="8" fill="#A1887F"/>
      <path d="M38 72 Q50 82 62 72" fill="#BCAAA4" stroke="none"/>
    </svg>`
  },
  {
    id: 'wolf',
    name: 'Wolf',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#78909C"/>
      <polygon points="20,40 28,6 40,34" fill="#90A4AE"/>
      <polygon points="80,40 72,6 60,34" fill="#90A4AE"/>
      <polygon points="20,40 28,6 40,34" fill="none" stroke="#607D8B" stroke-width="2"/>
      <polygon points="80,40 72,6 60,34" fill="none" stroke="#607D8B" stroke-width="2"/>
      <ellipse cx="50" cy="62" rx="16" ry="12" fill="#CFD8DC"/>
      <circle cx="38" cy="44" r="4.5" fill="#FFC107"/>
      <circle cx="62" cy="44" r="4.5" fill="#FFC107"/>
      <circle cx="38" cy="44" r="2.5" fill="#2D1B0E"/>
      <circle cx="62" cy="44" r="2.5" fill="#2D1B0E"/>
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#2D1B0E"/>
      <path d="M44 66 Q50 72 56 66" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="56" r="42" fill="#F5F5F5"/>
      <ellipse cx="36" cy="20" rx="8" ry="24" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1.5"/>
      <ellipse cx="64" cy="20" rx="8" ry="24" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1.5"/>
      <ellipse cx="36" cy="20" rx="4" ry="16" fill="#FFB6C1"/>
      <ellipse cx="64" cy="20" rx="4" ry="16" fill="#FFB6C1"/>
      <circle cx="38" cy="50" r="4.5" fill="#E91E63"/>
      <circle cx="62" cy="50" r="4.5" fill="#E91E63"/>
      <circle cx="38" cy="50" r="2.5" fill="#2D1B0E"/>
      <circle cx="62" cy="50" r="2.5" fill="#2D1B0E"/>
      <circle cx="39.5" cy="48.5" r="1" fill="white"/>
      <circle cx="63.5" cy="48.5" r="1" fill="white"/>
      <ellipse cx="50" cy="62" rx="3.5" ry="2.5" fill="#FFB6C1"/>
      <path d="M46 66 L50 70 L54 66" fill="none" stroke="#2D1B0E" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="34" cy="64" rx="8" ry="5" fill="#FFE0E6" opacity="0.6"/>
      <ellipse cx="66" cy="64" rx="8" ry="5" fill="#FFE0E6" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'bear',
    name: 'Bear',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="52" r="46" fill="#6D4C41"/>
      <circle cx="24" cy="24" r="14" fill="#6D4C41" stroke="#5D4037" stroke-width="2"/>
      <circle cx="76" cy="24" r="14" fill="#6D4C41" stroke="#5D4037" stroke-width="2"/>
      <circle cx="24" cy="24" r="8" fill="#8D6E63"/>
      <circle cx="76" cy="24" r="8" fill="#8D6E63"/>
      <circle cx="38" cy="46" r="5" fill="#2D1B0E"/>
      <circle cx="62" cy="46" r="5" fill="#2D1B0E"/>
      <circle cx="40" cy="44" r="2" fill="white"/>
      <circle cx="64" cy="44" r="2" fill="white"/>
      <ellipse cx="50" cy="62" rx="14" ry="10" fill="#8D6E63"/>
      <ellipse cx="50" cy="58" rx="5" ry="4" fill="#2D1B0E"/>
      <path d="M44 65 Q50 72 56 65" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'koala',
    name: 'Koala',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="52" r="44" fill="#9E9E9E"/>
      <circle cx="20" cy="32" r="16" fill="#9E9E9E"/>
      <circle cx="80" cy="32" r="16" fill="#9E9E9E"/>
      <circle cx="20" cy="32" r="10" fill="#E0E0E0"/>
      <circle cx="80" cy="32" r="10" fill="#E0E0E0"/>
      <circle cx="38" cy="48" r="4" fill="#2D1B0E"/>
      <circle cx="62" cy="48" r="4" fill="#2D1B0E"/>
      <circle cx="39.5" cy="46.5" r="1.5" fill="white"/>
      <circle cx="63.5" cy="46.5" r="1.5" fill="white"/>
      <ellipse cx="50" cy="60" rx="8" ry="5" fill="#2D1B0E"/>
      <ellipse cx="50" cy="59" rx="4" ry="2" fill="#616161"/>
    </svg>`
  },
  {
    id: 'tiger',
    name: 'Tiger',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FF9800"/>
      <ellipse cx="26" cy="26" rx="12" ry="14" fill="#FFB74D"/>
      <ellipse cx="74" cy="26" rx="12" ry="14" fill="#FFB74D"/>
      <ellipse cx="26" cy="26" rx="7" ry="8" fill="#FFF3E0"/>
      <ellipse cx="74" cy="26" rx="7" ry="8" fill="#FFF3E0"/>
      <path d="M30 18 L40 28" stroke="#2D1B0E" stroke-width="3" stroke-linecap="round"/>
      <path d="M50 10 L50 24" stroke="#2D1B0E" stroke-width="3" stroke-linecap="round"/>
      <path d="M70 18 L60 28" stroke="#2D1B0E" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="#FFF3E0"/>
      <circle cx="38" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="62" cy="44" r="5" fill="#2D1B0E"/>
      <circle cx="40" cy="42" r="2" fill="white"/>
      <circle cx="64" cy="42" r="2" fill="white"/>
      <ellipse cx="50" cy="56" rx="4.5" ry="3" fill="#E65100"/>
      <path d="M44 63 Q50 70 56 63" fill="none" stroke="#2D1B0E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'monkey',
    name: 'Monkey',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#8D6E63"/>
      <circle cx="14" cy="46" r="12" fill="#8D6E63"/>
      <circle cx="86" cy="46" r="12" fill="#8D6E63"/>
      <circle cx="14" cy="46" r="8" fill="#FFCC80"/>
      <circle cx="86" cy="46" r="8" fill="#FFCC80"/>
      <ellipse cx="50" cy="56" rx="22" ry="18" fill="#FFCC80"/>
      <circle cx="40" cy="42" r="4" fill="#2D1B0E"/>
      <circle cx="60" cy="42" r="4" fill="#2D1B0E"/>
      <circle cx="41.5" cy="40.5" r="1.5" fill="white"/>
      <circle cx="61.5" cy="40.5" r="1.5" fill="white"/>
      <ellipse cx="50" cy="56" rx="8" ry="5" fill="#D7A86E"/>
      <path d="M44 62 Q50 68 56 62" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'alien',
    name: 'Alien',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="52" rx="42" ry="46" fill="#69F0AE"/>
      <ellipse cx="34" cy="42" rx="12" ry="8" fill="#1B5E20" transform="rotate(-10,34,42)"/>
      <ellipse cx="66" cy="42" rx="12" ry="8" fill="#1B5E20" transform="rotate(10,66,42)"/>
      <ellipse cx="34" cy="42" rx="8" ry="5" fill="#B9F6CA"/>
      <ellipse cx="66" cy="42" rx="8" ry="5" fill="#B9F6CA"/>
      <circle cx="36" cy="42" r="3" fill="#2D1B0E"/>
      <circle cx="68" cy="42" r="3" fill="#2D1B0E"/>
      <circle cx="37" cy="41" r="1.2" fill="#69F0AE"/>
      <circle cx="69" cy="41" r="1.2" fill="#69F0AE"/>
      <path d="M42 66 Q50 72 58 66" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round"/>
      <circle cx="50" cy="10" r="3" fill="#69F0AE"/>
      <line x1="50" y1="13" x2="50" y2="8" stroke="#4CAF50" stroke-width="2"/>
    </svg>`
  }
];

/**
 * Get avatar SVG by index
 * @param {number} index
 * @returns {string} SVG string
 */
function getAvatarSVG(index) {
  const avatar = AVATARS[index % AVATARS.length];
  return avatar ? avatar.svg : AVATARS[0].svg;
}

/**
 * Get avatar by ID
 * @param {string} id
 * @returns {Object} Avatar object
 */
function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}

/**
 * Get avatar name by index
 * @param {number} index
 * @returns {string} Avatar name
 */
function getAvatarName(index) {
  return AVATARS[index % AVATARS.length]?.name || 'Fox';
}

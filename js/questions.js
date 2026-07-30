// ============================================================
// QuizRush - Question Bank
// 60 pertanyaan dalam Bahasa Indonesia
// Kategori: Pengetahuan Umum, Sains & Teknologi, Sejarah,
//           Geografi, Budaya & Seni
// Difficulty: easy, medium, hard
// ============================================================

const QUESTION_BANK = [

  // ==========================================
  //  PENGETAHUAN UMUM (12 soal)
  // ==========================================
  {
    category: "Pengetahuan Umum",
    difficulty: "easy",
    question: "Planet apa yang dikenal sebagai 'Planet Merah'?",
    options: ["Venus", "Mars", "Jupiter", "Saturnus"],
    correct: 1
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "easy",
    question: "Hewan apa yang menjadi lambang negara Indonesia?",
    options: ["Harimau", "Komodo", "Garuda", "Elang Jawa"],
    correct: 2
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "easy",
    question: "Berapa warna yang terdapat pada pelangi?",
    options: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "easy",
    question: "Apa mata uang resmi Jepang?",
    options: ["Won", "Yen", "Yuan", "Ringgit"],
    correct: 1
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "medium",
    question: "Siapa penemu telepon?",
    options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"],
    correct: 2
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "medium",
    question: "Bahasa apa yang paling banyak digunakan di dunia berdasarkan jumlah penutur?",
    options: ["Inggris", "Hindi", "Mandarin", "Spanyol"],
    correct: 2
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "medium",
    question: "Vitamin apa yang dihasilkan tubuh saat terkena sinar matahari?",
    options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    correct: 3
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "medium",
    question: "Negara mana yang memiliki garis pantai terpanjang di dunia?",
    options: ["Indonesia", "Australia", "Kanada", "Rusia"],
    correct: 2
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "hard",
    question: "Berapa kecepatan cahaya dalam meter per detik?",
    options: ["300.000 m/s", "300.000.000 m/s", "3.000.000 m/s", "30.000.000 m/s"],
    correct: 1
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "hard",
    question: "Siapa ilmuwan yang merumuskan teori relativitas?",
    options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Niels Bohr"],
    correct: 1
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "hard",
    question: "Apa nama unsur kimia dengan simbol 'Au'?",
    options: ["Perak", "Aluminium", "Emas", "Tembaga"],
    correct: 2
  },
  {
    category: "Pengetahuan Umum",
    difficulty: "hard",
    question: "Organ manusia apa yang paling besar?",
    options: ["Hati", "Paru-paru", "Otak", "Kulit"],
    correct: 3
  },

  // ==========================================
  //  SAINS & TEKNOLOGI (12 soal)
  // ==========================================
  {
    category: "Sains & Teknologi",
    difficulty: "easy",
    question: "Gas apa yang kita hirup saat bernapas?",
    options: ["Nitrogen", "Oksigen", "Karbon Dioksida", "Hidrogen"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "easy",
    question: "Apa rumus kimia air?",
    options: ["CO2", "H2O", "NaCl", "O2"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "easy",
    question: "Berapa jumlah tulang dalam tubuh manusia dewasa?",
    options: ["186", "206", "226", "256"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "easy",
    question: "Siapa pendiri Microsoft?",
    options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "medium",
    question: "Apa nama galaksi tempat Bumi berada?",
    options: ["Andromeda", "Bima Sakti", "Sombrero", "Triangulum"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "medium",
    question: "Proses apa yang digunakan tumbuhan untuk menghasilkan makanan?",
    options: ["Fermentasi", "Respirasi", "Fotosintesis", "Osmosis"],
    correct: 2
  },
  {
    category: "Sains & Teknologi",
    difficulty: "medium",
    question: "Apa satuan internasional untuk gaya?",
    options: ["Joule", "Watt", "Newton", "Pascal"],
    correct: 2
  },
  {
    category: "Sains & Teknologi",
    difficulty: "medium",
    question: "Bahasa pemrograman apa yang paling populer untuk pengembangan web front-end?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correct: 2
  },
  {
    category: "Sains & Teknologi",
    difficulty: "hard",
    question: "Berapa suhu mutlak nol dalam Celsius?",
    options: ["-100°C", "-273.15°C", "-373.15°C", "-173.15°C"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "hard",
    question: "Apa nama partikel subatom yang bermuatan negatif?",
    options: ["Proton", "Neutron", "Elektron", "Positron"],
    correct: 2
  },
  {
    category: "Sains & Teknologi",
    difficulty: "hard",
    question: "Apa nama teori yang menjelaskan asal-usul alam semesta?",
    options: ["Teori String", "Teori Big Bang", "Teori Kuantum", "Teori Steady State"],
    correct: 1
  },
  {
    category: "Sains & Teknologi",
    difficulty: "hard",
    question: "Berapa kecepatan suara di udara pada suhu 20°C?",
    options: ["234 m/s", "343 m/s", "443 m/s", "543 m/s"],
    correct: 1
  },

  // ==========================================
  //  SEJARAH (12 soal)
  // ==========================================
  {
    category: "Sejarah",
    difficulty: "easy",
    question: "Kapan Indonesia merdeka?",
    options: ["17 Agustus 1945", "17 Agustus 1944", "17 Agustus 1946", "17 Agustus 1943"],
    correct: 0
  },
  {
    category: "Sejarah",
    difficulty: "easy",
    question: "Siapa presiden pertama Indonesia?",
    options: ["Soeharto", "Soekarno", "B.J. Habibie", "Megawati"],
    correct: 1
  },
  {
    category: "Sejarah",
    difficulty: "easy",
    question: "Apa nama kerajaan Hindu tertua di Indonesia?",
    options: ["Majapahit", "Sriwijaya", "Kutai", "Tarumanegara"],
    correct: 2
  },
  {
    category: "Sejarah",
    difficulty: "easy",
    question: "Perang Dunia II berakhir pada tahun berapa?",
    options: ["1943", "1944", "1945", "1946"],
    correct: 2
  },
  {
    category: "Sejarah",
    difficulty: "medium",
    question: "Siapa yang menulis naskah proklamasi kemerdekaan Indonesia?",
    options: ["Mohammad Hatta", "Soekarno", "Ahmad Soebardjo", "Soekarno dan Hatta"],
    correct: 3
  },
  {
    category: "Sejarah",
    difficulty: "medium",
    question: "Tahun berapa Tembok Berlin runtuh?",
    options: ["1987", "1988", "1989", "1990"],
    correct: 2
  },
  {
    category: "Sejarah",
    difficulty: "medium",
    question: "Kerajaan Majapahit mencapai puncak kejayaan di bawah pemerintahan siapa?",
    options: ["Raden Wijaya", "Hayam Wuruk", "Tribhuwana", "Jayanegara"],
    correct: 1
  },
  {
    category: "Sejarah",
    difficulty: "medium",
    question: "Siapa penemu benua Amerika?",
    options: ["Ferdinand Magellan", "Vasco da Gama", "Christopher Columbus", "Amerigo Vespucci"],
    correct: 2
  },
  {
    category: "Sejarah",
    difficulty: "hard",
    question: "Perjanjian apa yang mengakhiri perang antara Belanda dan Indonesia?",
    options: ["Perjanjian Linggarjati", "Perjanjian Renville", "Konferensi Meja Bundar", "Perjanjian Roem-Royen"],
    correct: 2
  },
  {
    category: "Sejarah",
    difficulty: "hard",
    question: "Pada tahun berapa VOC (Vereenigde Oost-Indische Compagnie) didirikan?",
    options: ["1598", "1600", "1602", "1604"],
    correct: 2
  },
  {
    category: "Sejarah",
    difficulty: "hard",
    question: "Siapa Panglima besar pada masa perang Diponegoro?",
    options: ["Sultan Agung", "Pangeran Diponegoro", "Tuanku Imam Bonjol", "Teuku Umar"],
    correct: 1
  },
  {
    category: "Sejarah",
    difficulty: "hard",
    question: "Apa nama organisasi pergerakan nasional pertama di Indonesia?",
    options: ["Sarekat Islam", "Budi Utomo", "Muhammadiyah", "Indische Partij"],
    correct: 1
  },

  // ==========================================
  //  GEOGRAFI (12 soal)
  // ==========================================
  {
    category: "Geografi",
    difficulty: "easy",
    question: "Apa gunung tertinggi di dunia?",
    options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "easy",
    question: "Benua apa yang terbesar di dunia?",
    options: ["Afrika", "Amerika", "Asia", "Eropa"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "easy",
    question: "Sungai terpanjang di dunia adalah?",
    options: ["Amazon", "Nil", "Yangtze", "Mississippi"],
    correct: 1
  },
  {
    category: "Geografi",
    difficulty: "easy",
    question: "Pulau terbesar di Indonesia adalah?",
    options: ["Sumatera", "Jawa", "Kalimantan", "Sulawesi"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "medium",
    question: "Negara mana yang memiliki jumlah pulau terbanyak di dunia?",
    options: ["Filipina", "Indonesia", "Swedia", "Finlandia"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "medium",
    question: "Danau terbesar di Indonesia adalah?",
    options: ["Danau Toba", "Danau Sentani", "Danau Maninjau", "Danau Singkarak"],
    correct: 0
  },
  {
    category: "Geografi",
    difficulty: "medium",
    question: "Gurun terluas di dunia adalah?",
    options: ["Gobi", "Kalahari", "Sahara", "Arabian"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "medium",
    question: "Selat apa yang memisahkan pulau Jawa dan Sumatera?",
    options: ["Selat Malaka", "Selat Sunda", "Selat Karimata", "Selat Bali"],
    correct: 1
  },
  {
    category: "Geografi",
    difficulty: "hard",
    question: "Negara mana yang memiliki zona waktu terbanyak?",
    options: ["Rusia", "Amerika Serikat", "Prancis", "Australia"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "hard",
    question: "Apa nama titik terdalam di samudra?",
    options: ["Tonga Trench", "Mariana Trench", "Java Trench", "Philippine Trench"],
    correct: 1
  },
  {
    category: "Geografi",
    difficulty: "hard",
    question: "Berapa jumlah negara di benua Afrika?",
    options: ["44", "48", "54", "58"],
    correct: 2
  },
  {
    category: "Geografi",
    difficulty: "hard",
    question: "Garis lintang 0 derajat disebut juga?",
    options: ["Garis Khatulistiwa", "Garis Balik Utara", "Garis Balik Selatan", "Meridian"],
    correct: 0
  },

  // ==========================================
  //  BUDAYA & SENI (12 soal)
  // ==========================================
  {
    category: "Budaya & Seni",
    difficulty: "easy",
    question: "Tari Kecak berasal dari provinsi mana?",
    options: ["Jawa Tengah", "Jawa Timur", "Bali", "NTB"],
    correct: 2
  },
  {
    category: "Budaya & Seni",
    difficulty: "easy",
    question: "Alat musik tradisional 'Angklung' berasal dari daerah mana?",
    options: ["Jawa Tengah", "Jawa Barat", "Sumatera Barat", "Bali"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "easy",
    question: "Siapa pelukis terkenal yang melukis 'Mona Lisa'?",
    options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Vincent van Gogh"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "easy",
    question: "Wayang kulit paling terkenal berasal dari pulau mana?",
    options: ["Sumatera", "Kalimantan", "Jawa", "Sulawesi"],
    correct: 2
  },
  {
    category: "Budaya & Seni",
    difficulty: "medium",
    question: "Batik Indonesia diakui UNESCO sebagai warisan budaya pada tahun berapa?",
    options: ["2007", "2008", "2009", "2010"],
    correct: 2
  },
  {
    category: "Budaya & Seni",
    difficulty: "medium",
    question: "Rumah adat 'Tongkonan' berasal dari suku apa?",
    options: ["Suku Dayak", "Suku Toraja", "Suku Batak", "Suku Bugis"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "medium",
    question: "Candi Borobudur terletak di provinsi mana?",
    options: ["Jawa Timur", "Jawa Tengah", "DI Yogyakarta", "Jawa Barat"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "medium",
    question: "Lagu 'Bengawan Solo' diciptakan oleh siapa?",
    options: ["Ibu Sud", "Gesang", "W.R. Supratman", "Ismail Marzuki"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "hard",
    question: "Seni pertunjukan 'Reog' berasal dari daerah mana?",
    options: ["Ponorogo", "Banyuwangi", "Malang", "Surabaya"],
    correct: 0
  },
  {
    category: "Budaya & Seni",
    difficulty: "hard",
    question: "Siapa penulis novel 'Bumi Manusia'?",
    options: ["Chairil Anwar", "Pramoedya Ananta Toer", "Andrea Hirata", "Tere Liye"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "hard",
    question: "Tarian Saman dari Aceh biasanya ditarikan oleh berapa penari?",
    options: ["Genap", "Ganjil", "Bebas", "Minimal 12"],
    correct: 1
  },
  {
    category: "Budaya & Seni",
    difficulty: "hard",
    question: "Alat musik 'Sasando' berasal dari daerah mana?",
    options: ["Papua", "Maluku", "NTT (Rote)", "NTB"],
    correct: 2
  }
];

/**
 * Get filtered and shuffled questions
 * @param {number} count - Number of questions to return
 * @param {string} category - Category filter ('all' for all categories)
 * @param {string} difficulty - Difficulty filter ('all' for all difficulties)
 * @returns {Array} Shuffled array of questions
 */
function getQuestions(count, category = 'all', difficulty = 'all') {
  let filtered = [...QUESTION_BANK];

  if (category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }

  if (difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // Shuffle using Fisher-Yates algorithm
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  // Also shuffle options for each question
  const result = filtered.slice(0, count).map(q => {
    const optionPairs = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correct }));
    
    // Shuffle options
    for (let i = optionPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionPairs[i], optionPairs[j]] = [optionPairs[j], optionPairs[i]];
    }

    return {
      ...q,
      options: optionPairs.map(p => p.text),
      correct: optionPairs.findIndex(p => p.isCorrect)
    };
  });

  return result;
}

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
function getCategories() {
  return [...new Set(QUESTION_BANK.map(q => q.category))];
}

/**
 * Get question counts per category
 * @returns {Object} Object with category names as keys and counts as values
 */
function getQuestionCounts() {
  const counts = {};
  QUESTION_BANK.forEach(q => {
    counts[q.category] = (counts[q.category] || 0) + 1;
  });
  counts['Semua Kategori'] = QUESTION_BANK.length;
  return counts;
}

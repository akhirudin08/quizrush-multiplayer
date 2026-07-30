# 🚀 Panduan Setup Multiplayer QuizRush (Firebase & GitHub Pages)

Untuk mengaktifkan fitur **Multiplayer Real-time**, QuizRush menggunakan Firebase Realtime Database. Fitur ini gratis dan sangat mudah disetup!

---

## 🛠️ Langkah 1: Buat Project Firebase

1. Buka browser dan pergi ke **[Firebase Console](https://console.firebase.google.com/)**
2. Login dengan akun Google kamu.
3. Klik tombol **"Create a project"** (atau "Add project").
4. Masukkan nama project (misalnya: `quizrush-multiplayer`).
5. Matikan opsi "Google Analytics" (tidak wajib).
6. Klik **"Create project"** dan tunggu sampai selesai.

---

## 📦 Langkah 2: Daftarkan Aplikasi Web

1. Di halaman dashboard Firebase kamu, cari icon **`</>` (Web)** lalu klik.
2. Beri nama aplikasi (misalnya: `QuizRush Web`).
3. Centang opsi **"Also set up Firebase Hosting"** (jika kamu mau hosting di Firebase), atau biarkan kosong jika ingin pakai GitHub Pages.
4. Klik **"Register app"**.
5. Kamu akan melihat blok kode berisikan `firebaseConfig`. **Copy kode tersebut!** 

Bentuknya seperti ini:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDOCX...",
  authDomain: "quizrush-123.firebaseapp.com",
  databaseURL: "https://quizrush-123-default-rtdb.firebaseio.com",
  projectId: "quizrush-123",
  storageBucket: "quizrush-123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 🔗 Langkah 3: Paste Config ke QuizRush

1. Buka folder `quizrush/js/` di komputermu.
2. Buka file **`firebase-config.js`** menggunakan teks editor (Notepad, VS Code, dll).
3. Cari bagian konfigurasi dan **Ganti `firebaseConfig`** dengan kode yang kamu copy dari Firebase tadi.
4. Simpan file.

---

## 🗄️ Langkah 4: Aktifkan Realtime Database

1. Kembali ke [Firebase Console](https://console.firebase.google.com/).
2. Di menu sebelah kiri, buka **Build > Realtime Database**.
3. Klik tombol **"Create Database"**.
4. Pilih lokasi server terdekat (contoh: Singapore/Asia Tenggara).
5. Pada pilihan mode keamanan, pilih **"Start in test mode"** (ini akan mengizinkan read/write tanpa login sementara waktu).
6. Klik **"Enable"**.

> **⚠️ Keamanan**: Karena kita menggunakan "Test Mode", database akan terbuka selama 30 hari. Untuk jangka panjang, ubah *Rules* database menjadi `".read": true, ".write": true` jika ini hanya untuk project pribadi.

---

## 🌐 Langkah 5: Hosting di GitHub Pages

Agar semua orang bisa bermain, folder kuis kamu harus di-online-kan. Cara termudah adalah **GitHub Pages** (Gratis).

1. Buka **[GitHub](https://github.com/)** dan buat akun jika belum punya.
2. Klik **"+" > "New Repository"**.
3. Beri nama `quizrush` (atau apapun).
4. Pastikan diset ke **Public**.
5. Klik **"Create repository"**.
6. Klik tulisan *"uploading an existing file"* (atau upload manual).
7. Drag and drop **semua isi folder `quizrush`** milikmu (termasuk folder `js` dan file `index.html`) ke halaman GitHub tersebut.
8. Klik **"Commit changes"**.
9. Pergi ke tab **"Settings"** di repository kamu.
10. Di menu sebelah kiri, cari bagian **"Pages"**.
11. Di bagian *Source*, ubah *None* menjadi **`main`** (atau `master`).
12. Klik **"Save"**.
13. Selesai! Link kuis kamu akan muncul (contoh: `https://username.github.io/quizrush/`).

Sekarang, bagikan link tersebut! Kamu bisa membuat kuis, lalu meng-copy **Link Arena / Room Code** untuk dimainkan bersama teman-temanmu secara real-time! 🎉

# Hefi Task Manager

Aplikasi manajemen tugas berbasis web yang dirancang untuk membantu pengguna mencatat, mengatur, dan memantau tugas harian dalam satu tempat.

## Demo

https://todo-list-web-amber.vercel.app/

## Fitur

- Menambah tugas baru
- Menghapus tugas
- Menandai tugas selesai
- Mengatur kategori tugas
- Mengatur prioritas tugas (Low, Medium, High)
- Menentukan deadline tugas
- Statistik jumlah tugas
- Sorting tugas
- Pencarian tugas selesai
- Tampilan kalender untuk melihat jadwal dan deadline
- Penyimpanan data online menggunakan Supabase
- Tampilan responsif untuk berbagai perangkat

## Tech Stack

### Frontend
- HTML
- CSS
- Vanilla JavaScript

### Backend
- Node.js

### Database
- Supabase

### Deployment
- Vercel

## Struktur Proyek

```text
Todolist/
│
├── data/                  # Penyimpanan data tugas
├── public/                # Frontend aplikasi
│   ├── components/        # Logika JavaScript
│   ├── css/               # Styling aplikasi
│   ├── index.html         # Halaman utama
│   └── calendar.html      # Halaman kalender
│
├── server.js              # Backend server
├── package.json           # Dependensi proyek
├── vercel.json            # Konfigurasi deployment Vercel
└── README.md
```

## Menjalankan Secara Lokal

1. Clone repository

```bash
git clone https://github.com/hefikristianto/todo-list-web.git
```

2. Install dependencies

```bash
npm install
```

3. Buat file `.env`

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

4. Jalankan server

```bash
npm start
```

5. Buka browser

```text
http://localhost:3000
```

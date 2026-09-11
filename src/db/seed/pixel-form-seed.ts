import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { forms, type FormSection } from '../schema';

export const PIXEL_FORM_SLUG = 'pixel-analisis-kondisi-2025';

const pixelFormSections: FormSection[] = [
  {
    id: 'identitas',
    title: 'Identitas',
    questions: [
      {
        id: 'q1',
        label: 'Hai dengan siapa di sini?',
        type: 'text',
      },
      {
        id: 'q2',
        label: 'Mau tau nim kamu dong',
        type: 'text',
      },
      {
        id: 'q3',
        label: 'Dari angkatan mana nih?',
        type: 'radio',
        options: ['Cipher', 'Proxy', "IF/STI '25"],
      },
      {
        id: 'q4',
        label: 'Jurusan IF/STI deh?',
        type: 'radio',
        options: ['IF', 'STI'],
      },
      {
        id: 'q5',
        label: 'Kelas berapa tuh?',
        type: 'radio',
        options: ['Kelas 1', 'Kelas 2', 'Kelas 3'],
      },
    ],
  },
  {
    id: 'kegiatan-suka',
    title: 'Biasanya kamu suka kegiatan apa?',
    questions: [
      {
        id: 'q6',
        label: 'Saat waktu luang, kegiatan apa yang paling kamu suka?',
        type: 'checkbox',
        options: [
          'Main game',
          'Menonton film atau serial',
          'Mendengarkan musik',
          'Olahraga',
          'Membaca',
          'Jalan-jalan',
          'Istirahat',
          'Other',
        ],
      },
      {
        id: 'q7',
        label:
          'Kegiatan apa yang biasanya kamu lakukan saat santai bareng teman?',
        type: 'checkbox',
        options: [
          'Nongkrong atau ngobrol',
          'Makan bareng',
          'Main game bareng',
          'Olahraga',
          'Karaoke',
          'Nonton bioskop',
          'Nugas bareng',
          'Jarang atau tidak pernah berkegiatan santai bareng teman',
          'Other',
        ],
      },
      {
        id: 'q8',
        label:
          'Selama ikut kegiatan HMIF atau SPARTA, kegiatan atau momen apa yang paling kamu suka?',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'kegiatan-santai-hmif',
    title: 'Kegiatan santai bareng HMIF',
    questions: [
      {
        id: 'q9',
        label:
          'Apa yang bikin kamu nantinya tertarik ikut kegiatan santai HMIF?',
        type: 'checkbox',
        options: [
          'Kegiatannya sesuai minat',
          'Ada teman yang ikut',
          'Ingin kenal warga HMIF lain',
          'Waktunya cocok',
          'Tempatnya mudah dijangkau',
          'Biayanya terjangkau',
          'Belum tertarik ikut :<',
          'Other',
        ],
      },
      {
        id: 'q10',
        label:
          'Supaya kamu nyaman, kegiatan santai HMIF sebaiknya dibuat seperti apa?',
        type: 'textarea',
      },
      {
        id: 'q11',
        label: 'Apa yang kamu harapkan dari kegiatan santai bareng HMIF?',
        type: 'checkbox',
        options: [
          'Bisa refreshing',
          'Makin akrab dengan teman',
          'Kenal teman baru',
          'Merasa lebih dekat dengan HMIF',
          'Menikmati kegiatan yang aku suka',
          'Tidak ada harapan khusus',
          'Other',
        ],
      },
      {
        id: 'q12',
        label:
          'Kapan kamu biasanya punya waktu untuk ikut kegiatan santai HMIF?',
        type: 'textarea',
      },
    ],
  },
  {
    id: 'jalan-jalan-hmif',
    title: 'Jalan-jalan bareng HMIF',
    questions: [
      {
        id: 'q13',
        label: 'Kalau jalan-jalan, kegiatan seperti apa yang paling kamu suka?',
        type: 'checkbox',
        options: [
          'Menikmati pemandangan alam',
          'Melakukan aktivitas di alam seperti hiking',
          'Jalan-jalan di kota',
          'Wisata kuliner',
          'Bermain di tempat rekreasi',
          'Bersantai di penginapan',
          'Kurang tertarik jalan-jalan',
          'Other',
        ],
      },
      {
        id: 'q14',
        label: 'Apa yang bikin kamu tertarik ikut jalan-jalan bareng HMIF?',
        type: 'checkbox',
        options: [
          'Tempat tujuannya menarik',
          'Kegiatannya sesuai minat',
          'Ada teman yang ikut',
          'Ingin kenal warga HMIF lain',
          'Biayanya terjangkau',
          'Waktunya cocok',
          'Transportasinya diurus panitia',
          'Belum tertarik ikut',
          'Other',
        ],
      },
      {
        id: 'q15',
        label: 'Setelah ikut jalan-jalan bareng HMIF, apa yang kamu harapkan?',
        type: 'checkbox',
        options: [
          'Pikiran lebih segar',
          'Makin akrab dengan teman',
          'Punya teman baru',
          'Mendapat pengalaman baru',
          'Merasa lebih dekat dengan HMIF',
          'Tidak ada harapan khusus',
          'Other',
        ],
      },
      {
        id: 'q16',
        label:
          'Kalau jalan-jalan bareng HMIF diadakan setelah libur semester, apakah kamu tertarik ikut?',
        type: 'radio',
        options: ['Tertarik', 'Belum bisa memastikan', 'Tidak tertarik'],
      },
      {
        id: 'q17',
        label: 'Jika tidak tertarik, kenapa?',
        type: 'textarea',
        // Only relevant (and required) when Q16 = "Tidak tertarik" — see
        // plan's judgment call #1 (forcing everyone to answer "why not
        // interested" would be a logical fallacy).
        dependsOn: { questionId: 'q16', value: 'Tidak tertarik' },
      },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runPixelFormSeed(db: PostgresJsDatabase<any>) {
  const existing = await db
    .select({ id: forms.id })
    .from(forms)
    .where(eq(forms.slug, PIXEL_FORM_SLUG));

  if (existing.length > 0) {
    console.log('⏭️  PIXEL form already seeded, skipping');
    return;
  }

  await db.insert(forms).values({
    slug: PIXEL_FORM_SLUG,
    title: 'Form Analisis Kondisi PIXEL',
    description:
      'Bantu HMIF kenalan lebih dekat sama kamu, angkatan 2025 — biar kegiatan santai & jalan-jalan bareng HMIF makin pas sama yang kamu suka!',
    eligibleAngkatan: [2025],
    sections: pixelFormSections,
    opensAt: new Date('2026-09-12T13:00:00+07:00'),
    isActive: true,
    order: 0,
  });

  console.log('✅ Inserted PIXEL form into database!');
}

import nodemailer from 'nodemailer';
import { env } from '~/configs/env.config';

// Konfigurasi transporter email menggunakan Nodemailer
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST, 
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE, 
  auth: {
    user: env.SMTP_USER, 
    pass: env.SMTP_PASS, 
  },
});

// Interface untuk data email
export interface EmailOptions {
  to: string | string[]; // Penerima, bisa satu atau beberapa
  subject: string; // Subjek email
  text?: string; // Pesan plain text
  html?: string; // Pesan HTML
  attachments?: Array<{
    filename: string;
    path: string; // Path file atau URL
  }>; // Daftar attachment
}

/**
 * Fungsi untuk mengirim email dengan attachment
 * @param emailOptions - Opsi email seperti penerima, subjek, pesan, dan attachment
 * @returns Promise hasil pengiriman email
 */
export async function sendEmail(emailOptions: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: env.SMTP_USER, // Alamat email pengirim
      to: emailOptions.to,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html,
      attachments: emailOptions.attachments,
    };

    // Kirim email menggunakan Nodemailer
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email berhasil dikirim: ${info.messageId}`);
  } catch (error) {
    console.error(`Gagal mengirim email: ${error}`);
    throw error;
  }
}

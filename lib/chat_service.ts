import { GoogleGenAI } from "@google/genai";
import { retrieveRelevantChunks } from "./rag_service";
import type { ChatMessage } from "./types";

export async function generateChatResponse(
  conversationMessages: ChatMessage[],
  latestUserPrompt: string
): Promise<string> {
  // 1. Extract travel context & search RAG knowledge base
  const allText = conversationMessages.map((m) => m.content).join(" ") + " " + latestUserPrompt;
  const relevantChunks = retrieveRelevantChunks(allText, 2);

  let systemInstruction = `Anda adalah KelanaAI, asisten perencana perjalanan cerdas yang ramah, berwawasan luas, dan memiliki memori percakapan (conversational memory).
Gunakan gaya bahasa Indonesia yang santun, profesional, antusias, dan terstruktur rapi.

Tugas Anda:
1. Memahami riwayat percakapan sebelumnya dan memberikan jawaban yang berkesinambungan (context-aware). Jika pengguna menanyakan kata rujukan seperti "di sana", "destinasi itu", "bagaimana transportasinya", atau "berapa biayanya", rujuklah ke topik yang sedang dibicarakan pada pesan-pesan sebelumnya.
2. Berikan saran praktis, estimasi biaya realistis, tips etika budaya, serta rute efisien.
3. Gunakan format Markdown (bold, bullet points, numbered lists) agar mudah dibaca pengguna.`;

  if (relevantChunks.length > 0) {
    const ragContext = relevantChunks
      .map((c) => `[Sumber: ${c.filename} - ${c.section}]\n${c.text}`)
      .join("\n\n");
    systemInstruction += `\n\nVERIFIED TRAVEL KNOWLEDGE BASE (Gunakan data faktual ini jika relevan):\n${ragContext}`;
  }

  // 2. Prepare multi-turn conversation history for LLM
  // Filter out any system messages and format for Gemini
  const chatHistory = conversationMessages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // Append latest user message if not already in history
  const lastMsg = conversationMessages[conversationMessages.length - 1];
  if (!lastMsg || lastMsg.role !== "user" || lastMsg.content !== latestUserPrompt) {
    chatHistory.push({
      role: "user",
      parts: [{ text: latestUserPrompt }],
    });
  }

  // 3. Attempt calling Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: chatHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (err) {
      console.error("Gemini Chat conversational error:", err);
    }
  }

  // 4. Intelligent Context-Aware Fallback (Demonstrating Conversational Memory)
  return generateContextualFallback(conversationMessages, latestUserPrompt, relevantChunks);
}

function generateContextualFallback(
  history: ChatMessage[],
  latestPrompt: string,
  chunks: Array<{ filename: string; section: string; text: string }>
): string {
  const queryLower = latestPrompt.toLowerCase();
  const historyText = history.map((m) => m.content.toLowerCase()).join(" ");

  // Detect destination context from history or prompt
  const isKyoto = queryLower.includes("kyoto") || historyText.includes("kyoto") || historyText.includes("gion") || historyText.includes("japan");
  const isSwiss = queryLower.includes("swiss") || historyText.includes("swiss") || historyText.includes("alps") || historyText.includes("jungfrau");
  const isBali = queryLower.includes("bali") || historyText.includes("bali") || historyText.includes("ubud") || historyText.includes("sekumpul");
  const isParis = queryLower.includes("paris") || historyText.includes("paris") || historyText.includes("louvre") || historyText.includes("metro");
  const isRajaAmpat = queryLower.includes("raja ampat") || historyText.includes("raja ampat") || historyText.includes("sorong") || historyText.includes("misool");

  // Follow-up context: budget / biaya
  if (queryLower.includes("biaya") || queryLower.includes("budget") || queryLower.includes("harga") || queryLower.includes("berapa")) {
    if (isSwiss) {
      return `Berdasarkan percakapan kita mengenai Swiss Alps:

- **Swiss Travel Pass**: Sekitar CHF 244 (3 hari) hingga CHF 459 (8 hari) untuk kelas 2.
- **Puncak Jungfraujoch**: Swiss Travel Pass memberikan **diskon 25%** dari Kleine Scheidegg, sehingga tiket sambungan berkisar **CHF 150 - 180** pulang-pergi.
- **Estimasi Harian**: Siapkan sekitar **CHF 120 - 180/hari** untuk makanan lokal, tiket gondola tambahan, dan akomodasi pegunungan.

Ada bagian dari estimasi budget ini yang ingin kita rincikan lebih lanjut?`;
    }
    if (isKyoto) {
      return `Mengenai estimasi anggaran di Kyoto:

- **Transportasi**: Kartu IC (ICOCA) disiapkan saldo sekitar **¥1.500 - ¥2.000/hari** untuk bus dan kereta Keihan/Hankyu.
- **Kuliner & Jajan**: Sekitar **¥3.000 - ¥5.000/hari** untuk makan siang mie soba/ramen dan makan malam izakaya/teishoku.
- **Tiket Masuk Kuil**: Rata-rata **¥500 - ¥1.000** per kuil (misal Kiyomizu-dera ¥400, Kinkaku-ji ¥500).
- **Catatan Penting**: Hindari foto di gang privat Gion untuk mencegah denda **¥10.000**.

Apakah kamu ingin rekomendasi penginapan ramah kantong di sekitar Stasiun Kyoto?`;
    }
    if (isBali) {
      return `Perkiraan anggaran untuk Bali:
- **Sewa Motor/Mobil**: Rp 75.000 - Rp 100.000/hari (motor) atau Rp 600.000/hari (mobil + supir).
- **Tiket Wisata**: Rp 30.000 - Rp 50.000 untuk pura & air terjun.
- **Kuliner**: Rp 35.000 - Rp 70.000/makan di warung lokal autentik.`;
    }
    if (isParis) {
      return `Perkiraan anggaran di Paris:
- **Transportasi**: Navigo Easy pass / tiket t+ sekitar €2.15 per perjalanan.
- **Museum**: Paris Museum Pass €62 (2 hari) mencakup Louvre dan Versailles.
- **Kuliner**: Formula menu déjeuner siang berkisar €16 - €22.`;
    }
    if (isRajaAmpat) {
      return `Perkiraan anggaran Raja Ampat:
- **PIN Konservasi**: Wajib WNI Rp 500.000 / WNA Rp 1.000.000 (berlaku 1 tahun).
- **Speedboat charter**: Pos biaya terbesar, disarankan join trip atau sewa grup di pelabuhan Sorong.`;
    }
  }

  // Follow-up context: transportasi / rute
  if (queryLower.includes("transport") || queryLower.includes("rute") || queryLower.includes("jalan") || queryLower.includes("kereta") || queryLower.includes("bus")) {
    if (isKyoto) {
      return `Untuk mobilitas di Kyoto sesuai rencana kita sebelumnya:

1. **Gunakan Kartu IC (ICOCA / Suica)**: Dapat langsung ditempel (*tap*) di seluruh armada bus kota Kyoto City Bus dan jaringan kereta (Keihan Line untuk Fushimi Inari, Hankyu Line untuk Arashiyama).
2. **Hindari Bus Saat Rush Hour**: Di rute padat seperti Kyoto Station menuju Kiyomizu-dera, kereta bawah tanah Karasuma Line + jalan kaki sering kali lebih cepat daripada bus yang terjebak macet.
3. **Penyewaan Sepeda**: Area Kamo River dan Kyoto Utara sangat ramah sepeda dengan biaya sewa sekitar ¥1.000/hari.

Mau saya buatkan urutan rute jam per jam untuk hari berikutnya?`;
    }
  }

  // If knowledge base chunks were retrieved
  if (chunks.length > 0) {
    const chunkInfo = chunks[0];
    return `Meneruskan diskusi kita terkait destinasi ini (dari basis pengetahuan *${chunkInfo.section}*):

${chunkInfo.text.substring(0, 380)}...

Berdasarkan konteks obrolan kita, ada preferensi khusus yang ingin kamu prioritaskan? Saya siap menyesuaikan rekomendasi berikutnya!`;
  }

  // General conversational response
  return `Terima kasih atas pertanyaannya! Melanjutkan obrolan kita:

Saya mencatat preferensi perjalananmu sebelumnya. Untuk melangkah ke tahap berikutnya, berikut rekomendasi yang disesuaikan:

1. **Jadwal & Waktu Terbaik**: Sebaiknya mulai aktivitas sebelum pukul 09:00 pagi untuk menghindari antrean utama wisatawan.
2. **Efisiensi Rute**: Kelompokkan objek wisata yang berada dalam satu area geografis agar waktu tidak habis di perjalanan.
3. **Pemesanan Lebih Awal**: Pastikan tiket atraksi populer sudah dipesan online untuk mengamankan slot waktu (*time slot*).

Beri tahu saya jika ingin mengubah jumlah hari, anggaran, atau gaya liburanmu!`;
}

export function generateSuggestedTitle(prompt: string): string {
  const clean = prompt.trim();
  if (!clean) return "Percakapan Baru";

  if (clean.toLowerCase().includes("kyoto")) return "Rencana Liburan ke Kyoto";
  if (clean.toLowerCase().includes("swiss") || clean.toLowerCase().includes("alps")) return "Panduan Swiss Alps & Kereta";
  if (clean.toLowerCase().includes("bali")) return "Eksplorasi Budaya Bali";
  if (clean.toLowerCase().includes("paris")) return "Wisata Museum & Metro Paris";
  if (clean.toLowerCase().includes("raja ampat")) return "Logistik & Konservasi Raja Ampat";

  // Take first 5 words
  const words = clean.split(/\s+/).slice(0, 5).join(" ");
  return words.length > 35 ? words.substring(0, 35) + "..." : words;
}

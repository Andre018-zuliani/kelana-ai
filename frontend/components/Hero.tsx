import Image from "next/image";

/**
 * Hero section — homepage KelanaAI.
 * Menampilkan gambar destinasi besar di bagian atas halaman (hero image)
 * dengan overlay judul & tagline. Tinggi hero menyesuaikan layar
 * (responsive) lewat class Tailwind h-[...] per breakpoint.
 */
export default function Hero() {
  return (
    <section className="relative h-[38vh] min-h-[260px] w-full overflow-hidden sm:h-[46vh] md:h-[52vh]">
      <Image
        src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80"
        alt="Pemandangan Gunung Fuji dan pagoda di Jepang saat senja"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* overlay gradient supaya teks tetap terbaca di atas foto */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-950/10" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-start justify-end px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
        <span className="mb-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/20">
          ✦ Powered by Amazon Bedrock
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          KelanaAI
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
          Rencanakan perjalanan impian Anda dalam hitungan detik — cukup
          isi tujuan, anggaran, dan gaya liburan Anda.
        </p>
      </div>
    </section>
  );
}

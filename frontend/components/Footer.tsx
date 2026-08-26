/**
 * Footer sederhana: copyright + tautan navigasi.
 * Link disusun horizontal di desktop, stack vertikal-rapi di mobile
 * lewat flex-col/flex-row responsif Tailwind.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p>© {year} KelanaAI. All rights reserved.</p>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a href="#" className="transition hover:text-slate-900">
            About
          </a>
          <a href="#" className="transition hover:text-slate-900">
            Privacy Policy
          </a>
          <a href="#" className="transition hover:text-slate-900">
            Terms of Service
          </a>
          <a
            href="https://github.com/Andre018-zuliani/kelana-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-slate-900"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}

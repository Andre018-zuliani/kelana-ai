interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

/**
 * Pesan error yang ramah pengguna (bukan stack trace teknis),
 * lengkap dengan tombol coba lagi.
 */
export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center sm:p-6">
      <p className="font-medium text-rose-800">Unable to generate itinerary.</p>
      <p className="mt-1 text-sm text-rose-600">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
      >
        Try Again
      </button>
    </div>
  );
}

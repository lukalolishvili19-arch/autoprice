"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-xl font-extrabold mb-2">შეცდომა</h1>
      <p className="text-slate-400 text-sm mb-4">გვერდის ჩატვირთვა ვერ მოხერხდა.</p>
      <button onClick={reset} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold">
        თავიდან
      </button>
    </div>
  );
}

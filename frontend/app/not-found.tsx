import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold mb-2">ვერ მოიძებნა</h1>
      <p className="text-slate-400 mb-4">ეს გვერდი არ არსებობს.</p>
      <Link href="/" className="text-teal-600 font-bold">მთავარზე</Link>
    </div>
  );
}

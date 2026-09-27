import Link from "next/link";

export const metadata = { title: "შესვლა" };

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold mb-2">ანგარიშში შესვლა</h1>
        <p className="text-sm text-slate-400 mb-6">ფავორიტები ამ მოწყობილობაზე ინახება (X-Client-Key). სრული ავტორიზაცია მოგვიანებით დაემატება.</p>
        <form className="space-y-3">
          <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="ელფოსტა" />
          <input type="password" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" placeholder="პაროლი" />
          <button className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl">შესვლა</button>
        </form>
        <Link href="/dashboard" className="block text-center text-sm text-teal-600 mt-4 font-semibold">
          გაგრძელება სტუმრად
        </Link>
      </div>
    </div>
  );
}

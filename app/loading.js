export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20" aria-busy="true">
      <section className="container mx-auto px-4 pt-8">
        <div className="h-48 animate-pulse rounded-[2rem] bg-slate-200" />
      </section>
      <section className="container mx-auto px-4 pt-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-96 animate-pulse rounded-[2rem] bg-slate-200" />
          ))}
        </div>
      </section>
    </main>
  );
}

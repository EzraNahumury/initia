"use client";

export function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
      <div className="rounded-3xl bg-neutral-950 p-10 md:p-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute right-[-40px] top-[-40px] w-[280px] h-[280px] rounded-full border border-neutral-800 opacity-40" />
        <div className="absolute right-[0px] top-[0px] w-[200px] h-[200px] rounded-full border border-neutral-800 opacity-30" />
        <div className="absolute right-[40px] top-[40px] w-[120px] h-[120px] rounded-full border border-neutral-800 opacity-20" />

        <div className="relative z-10 max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Smart DeFi Router
            <br />
            on Initia
          </h1>
          <p className="text-neutral-400 text-[15px] mt-4 leading-relaxed max-w-md">
            Otomatis temukan jalur swap tercepat dan termurah di seluruh ekosistem Initia. Satu klik, route terbaik.
          </p>
        </div>
      </div>
    </div>
  );
}

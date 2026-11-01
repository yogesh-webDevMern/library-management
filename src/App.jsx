import { useState, useEffect } from "react";

/* ====== EDIT THESE ====== */
const PHONE = "916367891848"; // country code + number, no + or spaces
const ADDRESS = "Your address here, Jaipur";
// Put your photo URLs here (or import them). Empty ones show a placeholder.
const IMAGES = ["https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SVQnVgYzi43i5LLqgTy9SrR5utFNd1hCpy2Yf_4qKVq3YVoy67kETdN6zlDeUhs7eSCYd1WqFphgJJRvF7oZg8vxunUtRUBmSaBeyDsQ00dIDFUl2kt6K9ZuUsZqQFBorCjnpXPvx9qbVH=s1360-w1360-h1020-rw", "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Qv-3t9yOvCOG6v4Rbxq0JCptJ27ByoZIraN3SJu11b9Ctg1_YUg-r7sCxW36TViuguGd-37UCpOgrkou9sZr5GncConQd-sgK6bpERVBc9HwQ9RiJIhj0DFeEo-4lzFNa4ohPPDaT1riE=s1360-w1360-h1020-rw", "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9S202JJukg8Y_QqBZugDlpm5Ehnhd-PP_sJXcUUsIWcT--g45aLyDWii8Uyva9drkB_Z4xasarkuW4LixnIiu0_hkNCWHWCw5Iv4deJ2-pMtK-x9mWtzZxx5woNrzgEyqLHId5fnD7_5yU=s1360-w1360-h1020-rw", "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TF7Ph1clFxIveugzuIBe7PWp1sIX47QdT6ff_e977N8qiHj1puOvGswiwQK9yVteJZFlr9w-KDFMAVOqNHC8YW8R5Ud6S0xpg-g1yRMu6Z6er_3yBf6yc-K-ypVg2AHGYL5leQuLJUa3Jw=s1360-w1360-h1020-rw", "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9S18jU1p8l_MBWQMfR6htB9-iUKb6Su5eNlZao_z_PLLzPpZZOoHxHgdcSWSoP4KSyrJfM78huuA2dWqjYP2hq7hR9v354VvmlLPhQTJAsJhUVgcvxz-vcO_3_AxDUT7l0NbtpPKODgsqh9=s1360-w1360-h1020-rw", "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Q9hVm3JD3SW-9sNXGnuZtFkef1IK1TmgfLtydAd2ncwg4YdDkFmAJ0EZTVxhTR8lsofp7C4ekewT5JMOU5KUvICi_UzJyFERCn4EKuxewQaegpnsNw6X0TcLLZgmq00s1Qpya-x3jqdWrP=s1360-w1360-h1020-rw"];
const OPEN_HOUR = 7, CLOSE_HOUR = 23; // 7 am to 11 pm
/* ======================== */

const BOOKS = [
  // Add your own photo of each book cover in `img` (e.g. img: "/books/rich-dad.jpg"). Empty = coloured cover.
  { t: "Rich Dad Poor Dad", a: "Robert Kiyosaki", c: ["#34D399", "#065F46"], img: "https://miro.medium.com/v2/1*2ez6OvjmVh6-04uM87NlsQ.png" },
  { t: "Atomic Habits", a: "James Clear", c: ["#FBBF24", "#B45309"], img: "https://images.squarespace-cdn.com/content/v1/5a4b6d1f9f07f5d01c10f2b6/e9b992f6-72bf-4cb8-8be5-19bde83e566a/352707224_10159200474907341_8781875447665972430_n.jpg" },
  { t: "Deep Work", a: "Cal Newport", c: ["#60A5FA", "#1E3A8A"], img: "https://imgv2-2-f.scribdassets.com/img/document/729698862/original/ee3f2df024/1?v=1" },
  { t: "Wings of Fire", a: "A. P. J. Abdul Kalam", c: ["#F472B6", "#9D174D"], img: "https://i.pinimg.com/736x/12/cb/21/12cb21593ee0bc12adb4a6ce4721954d.jpg" },
  { t: "Ikigai", a: "Garcia & Miralles", c: ["#2DD4BF", "#115E59"], img: "https://i.pinimg.com/736x/9d/92/af/9d92afdcadd5fd130cf07512a4813c8c.jpg" },
  { t: "The Alchemist", a: "Paulo Coelho", c: ["#A78BFA", "#4C1D95"], img: "https://i.pinimg.com/736x/4a/e1/78/4ae178d0cd354d0616813878e42251ee.jpg" },
  { t: "Think and Grow Rich", a: "Napoleon Hill", c: ["#FB923C", "#9A3412"], img: "https://i.pinimg.com/1200x/98/55/45/985545170d9b56983eb37eb8a68fd2db.jpg" },
  { t: "The Power of Now", a: "Eckhart Tolle", c: ["#F87171", "#7F1D1D"], img: "https://i.pinimg.com/736x/4a/26/42/4a2642bdecddc5ade1e5463c8996e543.jpg" },
  { t: "The Psychology of Money", a: "Morgan Housel", c: ["#38BDF8", "#075985"], img: "https://i.pinimg.com/736x/09/ff/ff/09ffff7341fb0e30fb67aaff99d61b77.jpg" },
  { t: "Zero to One", a: "Peter Thiel", c: ["#C084FC", "#6B21A8"], img: "https://i.pinimg.com/736x/41/96/a1/4196a1aaed346e8260bac7c3728cbfc0.jpg" },
  { t: "The 7 Habits", a: "Stephen Covey", c: ["#4ADE80", "#166534"], img: "https://i.pinimg.com/736x/0b/28/21/0b2821cecd347df4eb32784ae0e1900c.jpg" },
  { t: "Mindset", a: "Carol Dweck", c: ["#FCD34D", "#92400E"], img: "https://i.pinimg.com/1200x/40/36/ba/4036ba72b1f14c5e620108c736a0cda6.jpg" },
];

const QUOTES = [
  ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
  ["The future depends on what you do today.", "Mahatma Gandhi"],
  ["Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", "A. P. J. Abdul Kalam"],
  ["Once you learn to read, you will be forever free.", "Frederick Douglass"],
  ["It always seems impossible until it is done.", "Nelson Mandela"],
];

const AMENITIES = [
  ["Comfortable chairs", "Cushioned, back-supported seats made for long study hours.", "#FBBF24"],
  ["Silent study zone", "Strict silence so your focus never breaks.", "#8B5CF6"],
  ["Air conditioned", "Cool, fresh air through summer and exam season.", "#2DD4BF"],
  ["High-speed WiFi", "Fast internet for online classes and research.", "#60A5FA"],
  ["Charging points", "A power socket at every seat.", "#F472B6"],
  ["Reading lamps", "Bright desk light that is easy on your eyes.", "#FB923C"],
  ["Safe and clean", "CCTV, clean washrooms and drinking water.", "#34D399"],
  ["Your own desk", "A fixed seat and desk space just for you.", "#F87171"],
];

function Cover({ b, className = "" }) {
  if (b.img) {
    return (
      <div className={`relative rounded-r-xl rounded-l-sm overflow-hidden ${className}`} style={{ boxShadow: "inset 8px 0 0 rgba(0,0,0,.25)" }}>
        <img src={b.img} alt={`${b.t} by ${b.a}`} className="w-full h-full object-cover" />
        <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent" />
      </div>
    );
  }
  return (
    <div className={`relative rounded-r-xl rounded-l-sm p-4 flex flex-col justify-between text-white overflow-hidden ${className}`}
      style={{ background: `linear-gradient(145deg, ${b.c[0]}, ${b.c[1]})`, boxShadow: "inset 10px 0 0 rgba(0,0,0,.22), inset -2px 0 0 rgba(255,255,255,.25)" }}>
      <span className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/25 blur-2xl" />
      <span className="disp text-base md:text-lg leading-tight relative">{b.t}</span>
      <span className="text-sm text-white/85 relative">{b.a}</span>
    </div>
  );
}

function Plan({ name, price, note, perks, hot }) {
  const [s, setS] = useState({ x: 0, y: 0 });
  return (
    <div className="[perspective:900px]"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setS({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 }); }}
      onMouseLeave={() => setS({ x: 0, y: 0 })}>
      <div className={`relative rounded-3xl p-8 border transition-transform duration-200 ${hot ? "border-[#FBBF24] bg-gradient-to-b from-[#FBBF24]/20 to-white/[0.05]" : "border-white/15 bg-white/[0.06]"}`}
        style={{ transform: `rotateY(${s.x * 7}deg) rotateX(${-s.y * 7}deg)` }}>
        {hot && <span className="absolute -top-4 left-8 disp text-xs bg-[#FBBF24] text-[#070B1F] px-4 py-2 rounded-full">Most popular</span>}
        <p className="disp text-xl">{name}</p>
        <p className="mt-4 flex items-end gap-2"><span className="disp text-6xl grad-text">₹{price}</span><span className="text-white/70 text-lg pb-2">per month</span></p>
        <p className="mt-2 text-white/70 text-lg">{note}</p>
        <ul className="mt-6 space-y-3 text-lg">
          {perks.map((p) => <li key={p} className="flex gap-3"><span className="mt-2 w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0" />{p}</li>)}
        </ul>
        <a href="#book" className={`mt-8 block text-center disp text-sm py-4 rounded-full transition-transform hover:scale-[1.03] ${hot ? "bg-[#FBBF24] text-[#070B1F]" : "border border-white/35 hover:bg-white/10"}`}>Book this seat</a>
      </div>
    </div>
  );
}

export default function YashLibrary() {
  const [qi, setQi] = useState(0);
  const [tick, setTick] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 20 });
  const [form, setForm] = useState({ name: "", phone: "", plan: "Full day" });
  const [open, setOpen] = useState(false);

const OPEN_HOUR = 6;
const CLOSE_HOUR = 23;

useEffect(() => {
  const updateOpenStatus = () => {
    const d = new Date();

    const isLastSunday =
      d.getDay() === 0 &&
      d.getDate() + 7 > new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0
      ).getDate();

    setOpen(
      !isLastSunday &&
      d.getHours() >= OPEN_HOUR &&
      d.getHours() < CLOSE_HOUR
    );
  };

  updateOpenStatus();

  const id = setInterval(updateOpenStatus, 60000);

  return () => clearInterval(id);
}, []);

  const go = (n) => { setQi((i) => (i + n + QUOTES.length) % QUOTES.length); setTick((t) => t + 1); };
  const send = () => {
    if (!form.name || form.phone.length < 10) return;
    const msg = `Hello Amaraya    Library, I am ${form.name} (${form.phone}). I want to book a ${form.plan} seat.`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen text-white antialiased overflow-x-hidden" style={{ background: "#070B1F", fontFamily: "'Newsreader', Georgia, serif" }}
      onMouseMove={(e) => setPos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 })}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;1,400&display=swap');
        .disp { font-family:'Unbounded', system-ui, sans-serif; font-weight:800; letter-spacing:-0.04em; }
        .grad-text { background:linear-gradient(90deg,#FBBF24,#F472B6,#8B5CF6,#2DD4BF,#FBBF24); background-size:300% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation: flow 8s linear infinite; }
        @keyframes flow { to { background-position:300% 0; } }
        .ring { transform-style:preserve-3d; animation: spin 36s linear infinite; }
        .stage:hover .ring { animation-play-state:paused; }
        @keyframes spin { to { transform: rotateY(-360deg); } }
        .slot { --z: var(--zd); } @media (max-width:640px){ .slot { --z: var(--zm); } }
        .qin { animation: qin .9s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes qin { from { opacity:0; transform: translateY(24px) scale(.98); filter: blur(8px);} }
        .bar { transform-origin:left; animation: prog 6s linear both; }
        @keyframes prog { from { transform: scaleX(0);} }
        .slide { animation: slide 40s linear infinite; }
        @keyframes slide { to { transform: translateX(-50%);} }
        .star { position:absolute; width:3px; height:3px; border-radius:9999px; background:#fff; animation: tw 3s ease-in-out infinite; }
        @keyframes tw { 50% { opacity:.1; transform:scale(.4);} }
        .pulse { animation: pl 1.8s ease-out infinite; }
        @keyframes pl { 0% { box-shadow:0 0 0 0 currentColor; } 100% { box-shadow:0 0 0 12px transparent; } }
        button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible { outline:3px solid #FBBF24; outline-offset:3px; }
        @media (prefers-reduced-motion: reduce){ .ring,.grad-text,.slide,.star,.qin,.bar,.pulse { animation:none !important; } }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,.22), transparent 60%)` }} />

      <header className="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-[#070B1F]/60 border-b border-white/10">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
          <span className="disp text-lg">Amaraya    Library</span>
          <div className="hidden md:flex gap-8 text-lg text-white/75">
            <a href="#books" className="hover:text-white">Books</a>
            <a href="#plans" className="hover:text-white">Plans</a>
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#gallery" className="hover:text-white">Gallery</a>
            <a href="#book" className="hover:text-white">Contact</a>
          </div>
          <a href="#book" className="disp text-xs px-5 py-3 rounded-full text-[#070B1F] bg-[#FBBF24] hover:scale-105 transition-transform">Book seat</a>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 pt-28 pb-10 overflow-hidden">
        {Array.from({ length: 28 }).map((_, i) => <span key={i} className="star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%`, animationDelay: `${(i % 7) * 0.4}s` }} aria-hidden="true" />)}
        <div className="relative max-w-6xl mx-auto px-5 text-center">
          <p className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-lg ${open ? "text-[#2DD4BF]" : "text-[#F87171]"}`}>
            <span className="pulse w-2.5 h-2.5 rounded-full bg-current" />
            <span className="text-white/90">{open ? "Open now, seats available" : "Closed now. Opens 7 am, Monday to Saturday"}</span>
          </p>
          <h1 className="disp mt-6 text-4xl sm:text-6xl md:text-7xl leading-[1.02]">
            Your seat to <span className="grad-text">success</span><br />is waiting.
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            A calm, comfortable self-study library with your own desk, from 7 am to 11 pm. Study without distraction and reach your goal.
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <a href="#plans" className="disp text-sm px-7 py-4 rounded-full text-[#070B1F] bg-[#FBBF24] hover:scale-105 transition-transform">See plans from ₹499</a>
            <a href={`tel:+${PHONE}`} className="disp text-sm px-7 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-colors">Call us</a>
          </div>
        </div>
        <div className="stage relative mt-6 h-[400px] md:h-[470px] [perspective:1400px] flex items-center justify-center" aria-label="Rotating featured books">
          <div className="ring relative w-40 h-56 md:w-48 md:h-64" style={{ "--zd": `${Math.round((BOOKS.length * 230) / (2 * Math.PI))}px`, "--zm": `${Math.round((BOOKS.length * 190) / (2 * Math.PI))}px` }}>
            {BOOKS.map((b, i) => (
              <div key={b.t} className="slot absolute inset-0" style={{ transform: `rotateY(${i * (360 / BOOKS.length)}deg) translateZ(var(--z))` }}>
                <Cover b={b} className="w-full h-full shadow-[0_30px_60px_rgba(0,0,0,.6)]" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 w-[70%] h-10 rounded-[50%] bg-[#8B5CF6]/40 blur-2xl" aria-hidden="true" />
        </div>
      </section>

      <div className="relative z-10 overflow-hidden border-y border-white/10 py-4" aria-hidden="true">
        <div className="slide flex w-max disp text-2xl text-white/25 gap-10 whitespace-nowrap">
          {[0, 1].map((k) => <span key={k} className="flex gap-10">{["UPSC", "RPSC", "NEET", "JEE", "CA", "SSC", "Banking", "Board exams", "University"].map((w) => <span key={w + k}>{w}</span>)}</span>)}
        </div>
      </div>

      {/* BOOK COLLECTION */}
      <section id="books" className="relative z-10 max-w-6xl mx-auto px-5 py-24">
        <h2 className="disp text-3xl md:text-5xl leading-tight max-w-2xl">Books that build better minds</h2>
        <p className="mt-4 text-xl text-white/70 max-w-xl">Read in a quiet corner after your study hours. Our shelf grows every month.</p>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-10">
          {BOOKS.map((b) => (
            <div key={b.t} className="group">
              <div className="[perspective:700px]">
                <Cover b={b} className="aspect-[2/3] w-full shadow-[0_20px_40px_rgba(0,0,0,.55)] transition-transform duration-500 group-hover:[transform:rotateY(-14deg)_translateY(-10px)]" />
              </div>
              <p className="mt-4 disp text-sm leading-tight">{b.t}</p>
              <p className="text-white/60">{b.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="relative z-10 max-w-5xl mx-auto px-5 py-24">
        <h2 className="disp text-3xl md:text-5xl leading-tight text-center">Simple prices. No hidden charges.</h2>
        <div className="mt-14 grid md:grid-cols-2 gap-8">
          <Plan name="Half day" price="499" note="Morning or evening shift" perks={["Fixed comfortable seat", "AC and WiFi included", "Silent study zone"]} />
          <Plan hot name="Full day" price="799" note="7 am to 11 pm, all day" perks={["Fixed comfortable seat", "AC, WiFi and charging point", "Silent study zone", "Stay as long as you like"]} />
        </div>
        <p className="mt-8 text-center text-white/60 text-lg">Open Monday to Saturday. Closed every Sunday.</p>
      </section>

      {/* AMENITIES */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-5 pb-24">
        <h2 className="disp text-3xl md:text-5xl leading-tight max-w-2xl">Everything you need to focus</h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AMENITIES.map(([t, d, c]) => (
            <div key={t} className="group rounded-3xl p-6 bg-white/[0.06] border border-white/10 hover:-translate-y-2 hover:border-white/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl mb-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" style={{ background: c }} />
              <h3 className="disp text-lg">{t}</h3>
              <p className="mt-2 text-white/70 text-lg leading-snug">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTES */}
      <section className="relative z-10 px-5 py-24" style={{ background: "linear-gradient(180deg, transparent, rgba(139,92,246,.2), transparent)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <div key={qi} className="qin" aria-live="polite">
            <p className="disp text-2xl sm:text-4xl md:text-5xl leading-tight">“{QUOTES[qi][0]}”</p>
            <p className="mt-6 text-xl italic text-[#FBBF24]">{QUOTES[qi][1]}</p>
          </div>
          <div className="mt-10 mx-auto max-w-xs h-1 bg-white/15 rounded-full overflow-hidden"><div key={`${qi}-${tick}`} className="bar h-full bg-[#FBBF24]" /></div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => go(-1)} className="px-5 py-2 rounded-full border border-white/30 hover:bg-white/10">Previous</button>
            <button onClick={() => go(1)} className="px-5 py-2 rounded-full border border-white/30 hover:bg-white/10">Next quote</button>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="relative z-10 max-w-6xl mx-auto px-5 py-24">
        <h2 className="disp text-3xl md:text-5xl leading-tight">Take a look inside</h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
          {IMAGES.map((src, i) => (
            <div key={i} className={`group relative overflow-hidden rounded-3xl border border-white/10 ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-[4/3]" : "aspect-[4/3]"}`}>
              {src ? (
                <img src={src} alt={`Amaraya    Library photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-lg text-center p-4" style={{ background: `linear-gradient(135deg, ${BOOKS[i].c[1]}, #070B1F)` }}>
                  Add your library photo here
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOOK */}
      <section id="book" className="relative z-10 px-5 pb-24">
        <div className="max-w-4xl mx-auto rounded-[2rem] p-8 md:p-14 border border-white/15" style={{ background: "linear-gradient(135deg, rgba(139,92,246,.35), rgba(244,114,182,.2), rgba(45,212,191,.2))" }}>
          <h2 className="disp text-3xl md:text-5xl leading-tight text-center">Reserve your seat today</h2>
          <p className="mt-3 text-xl text-white/80 text-center">Fill this in and we will continue the chat on WhatsApp.</p>
          <div className="mt-8 grid md:grid-cols-3 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" aria-label="Your name"  aria-label="Plan"
  className="rounded-full bg-black px-6 py-4 text-lg text-white " />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} placeholder="Mobile number" inputMode="numeric" aria-label="Mobile number"  aria-label="Plan"
  className="rounded-full bg-black px-6 py-4 text-lg text-white "  />
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} aria-label="Plan"   aria-label="Plan"
  className="rounded-full bg-black px-6 py-4 text-lg text-white ">
              <option className="">Full day</option><option>Half day</option>
            </select>
          </div>
          <button onClick={send} className="mt-6 w-full disp text-sm py-4 rounded-full text-white bg-[#FBBF24] hover:scale-[1.02] transition-transform">Send on WhatsApp</button>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-center text-lg text-white/80">
            <p><span className="block disp text-white text-base">Timing</span>6 am to 11 pm</p>
            <p><span className="block disp text-white text-base">Off</span>Last Sunday</p>
            <p><span className="block disp text-white text-base">Address</span>{ADDRESS}</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 text-center text-white/55 pb-10 px-5">
        <p className="disp text-white text-lg">Amaraya    Library</p>
        <p className="mt-2">Study hard. Stay focused. Make it happen.</p>
      </footer>
    </div>
  );
}

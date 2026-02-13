import Image from "next/image";

const missionTypes = ["Point Capture", "Route Capture", "Area Scan (coming soon)"];

const targetUsers = [
  "Real estate developers",
  "Construction project managers",
  "Insurance surveyors",
  "Infrastructure operators",
  "Agriculture monitoring",
  "Remote asset owners",
];

const reasons = [
  {
    title: "Precision First",
    text: "Coordinate-based scheduling for repeatable and auditable missions.",
  },
  {
    title: "Compliant by Design",
    text: "Airspace verification and licensed operators in local jurisdictions.",
  },
  {
    title: "Scalable Infrastructure",
    text: "Built for recurring capture tasks across distributed locations.",
  },
  {
    title: "No Ownership Required",
    text: "No drone fleet, no pilot hiring, no operations overhead on your side.",
  },
];

const pricingFactors = [
  "Deployment base fee",
  "Travel distance",
  "Airspace risk level",
  "Capture complexity",
  "Data processing requirements",
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_45%)]" />

      <header className="relative z-10 border-b border-white/15 bg-black/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="abandon.ai logo" width={152} height={36} className="h-7 w-auto object-contain md:h-8 border border-white" priority />
            <div className="text-2xl font-bold">abandon.ai</div>
          </div>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.15em] text-white md:flex">
            <a href="#what-we-do" className="transition hover:opacity-80">
              What We Do
            </a>
            <a href="#how-it-works" className="transition hover:opacity-80">
              How It Works
            </a>
            <a href="#webapp-v1" className="transition hover:opacity-80">
              WebApp
            </a>
            <a href="#pricing" className="transition hover:opacity-80">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-14 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pt-20">
        <div className="space-y-7">
          <p className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
            Remote Drone Mission Scheduling Platform
          </p>
          <h1 className="max-w-xl text-4xl leading-[1.05] tracking-[0.04em] md:text-6xl">
            On-Demand Drone Capture, Anywhere.
          </h1>
          <p className="max-w-lg text-sm leading-7 text-white md:text-base">
            Schedule aerial capture at any coordinate. Select time, altitude, and output format. We deploy certified operators.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.15em]">
            <button className="rounded-md border border-white bg-transparent px-4 py-3 text-white transition hover:bg-white/10">
              Schedule a Location
            </button>
            <button className="rounded-md border border-white/40 bg-white/5 px-4 py-3 text-white transition hover:bg-white/10">
              View Demo Map
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-[#050505] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="h-[340px] rounded-xl border border-white/20 bg-gradient-to-br from-[#111111] via-[#202020] to-[#3a3a3a] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Image Placeholder</p>
            <p className="mt-4 max-w-sm text-xs leading-6 text-white">
              Prompt: cinematic topographic terrain map with drone mission pins, natural earth tones, atmospheric haze, high-detail satellite texture.
            </p>
          </div>
        </div>
      </section>

      <section id="what-we-do" className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="grid gap-8 rounded-2xl border border-white/15 bg-[#050505] p-6 md:grid-cols-[1fr_0.95fr] md:p-8">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.17em] text-white">What We Do</p>
            <h2 className="text-2xl tracking-[0.03em] md:text-3xl">Aerial Capture as a Service</h2>
            <p className="text-sm leading-7 text-white">
              abandon.ai enables remote scheduling of drone missions through an interactive 3D map interface.
            </p>
            <div className="grid gap-5 text-sm md:grid-cols-2">
              <div className="rounded-xl border border-white/15 bg-black p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white">Users Can</p>
                <ul className="space-y-2 text-white">
                  <li>Select precise GPS coordinates</li>
                  <li>Define capture time windows</li>
                  <li>Specify altitude and camera angle</li>
                  <li>Request photos, video, or area scans</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/15 bg-black p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-white">We Handle</p>
                <ul className="space-y-2 text-white">
                  <li>Licensed drone operators</li>
                  <li>Airspace compliance</li>
                  <li>Mission execution</li>
                  <li>Data delivery</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-gradient-to-br from-[#0d0d0d] via-[#1c1c1c] to-[#343434] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Image Placeholder</p>
            <p className="mt-4 text-xs leading-6 text-white">
              Prompt: wide-angle drone flying above mountain valleys and infrastructure corridor, muted green and bronze palette, premium product website composition.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <p className="text-xs uppercase tracking-[0.17em] text-white">How It Works</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-white/15 bg-[#050505] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Step 1</p>
            <h3 className="mt-3 text-lg">Choose a Location</h3>
            <p className="mt-3 text-sm leading-6 text-white">Use our 3D terrain map to pinpoint coordinates or draw a flight path.</p>
          </article>
          <article className="rounded-xl border border-white/15 bg-[#050505] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Step 2</p>
            <h3 className="mt-3 text-lg">Define Mission Parameters</h3>
            <p className="mt-3 text-sm leading-6 text-white">Select capture time, altitude, and output format.</p>
          </article>
          <article className="rounded-xl border border-white/15 bg-[#050505] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Step 3</p>
            <h3 className="mt-3 text-lg">We Deploy</h3>
            <p className="mt-3 text-sm leading-6 text-white">Certified local operators execute the mission.</p>
          </article>
          <article className="rounded-xl border border-white/15 bg-[#050505] p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Step 4</p>
            <h3 className="mt-3 text-lg">Receive Data</h3>
            <p className="mt-3 text-sm leading-6 text-white">Secure delivery within 24-72 hours.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.95fr_1.05fr] md:px-10">
        <div className="rounded-2xl border border-white/15 bg-[#050505] p-6">
          <p className="text-xs uppercase tracking-[0.17em] text-white">Who It&apos;s For</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {targetUsers.map((item) => (
              <div key={item} className="rounded-lg border border-white/15 bg-black p-3 text-sm text-white">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-[#050505] p-6">
          <p className="text-xs uppercase tracking-[0.17em] text-white">Why abandon.ai</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reasons.map((reason) => (
              <article key={reason.title} className="rounded-lg border border-white/15 bg-black p-4">
                <h3 className="text-sm uppercase tracking-[0.15em] text-white">{reason.title}</h3>
                <p className="mt-3 text-xs leading-6 text-white">{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="webapp-v1" className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10">
        <div className="rounded-2xl border border-white/15 bg-[#050505] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.17em] text-white">WebApp V1 Structure</p>
          <h2 className="mt-3 text-2xl tracking-[0.03em] md:text-3xl">Functional Screens Preview</h2>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-white/15 bg-black p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white">Dashboard</p>
              <h3 className="mt-3 text-xl">Schedule a New Mission</h3>
              <button className="mt-4 rounded-md border border-white bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-white/10">
                New Capture
              </button>
            </article>

            <article className="rounded-xl border border-white/15 bg-black p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white">Review Page</p>
              <h3 className="mt-3 text-xl">Mission Summary</h3>
              <ul className="mt-4 space-y-2 text-sm text-white">
                <li>Location</li>
                <li>Date &amp; Time</li>
                <li>Estimated Delivery</li>
                <li>Estimated Cost</li>
              </ul>
              <p className="mt-4 text-xs uppercase tracking-[0.15em] text-white">Cost: Base Deployment Fee + Distance Adjustment + Complexity Adjustment</p>
            </article>
          </div>

          <article className="mt-4 rounded-xl border border-white/15 bg-black p-5">
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.15em] text-white">
              <span className="rounded-full border border-white/25 px-3 py-1">Map Page</span>
              {missionTypes.map((type) => (
                <span key={type} className="rounded-full border border-white/25 px-3 py-1">
                  {type}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-white/15 bg-[#030303] p-4 text-sm text-white">
                <p className="text-xs uppercase tracking-[0.15em] text-white">Left Parameter Panel</p>
                <ul className="mt-3 space-y-2">
                  <li>Location: Selected Coordinates (Lat/Lng)</li>
                  <li>Schedule: Date + Time Window</li>
                  <li>Altitude (m), Camera Angle</li>
                  <li>Output Type: Photo / Video / Both</li>
                  <li>Weather Advisory: Auto-check before confirmation</li>
                </ul>
              </div>
              <div className="rounded-lg border border-white/20 bg-gradient-to-br from-[#0e0e0e] via-[#202020] to-[#383838] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white">Map Placeholder</p>
                <p className="mt-3 max-w-md text-xs leading-6 text-white">
                  Prompt: interactive 3D terrain map with mission path drawing UI, subtle contour lines, cinematic top-down style, muted outdoors palette.
                </p>
                <p className="mt-6 text-sm text-white">Click on the map to select a capture point, or draw a route.</p>
              </div>
            </div>
          </article>

          <article className="mt-4 rounded-xl border border-white/15 bg-black p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white">Confirmation</p>
            <h3 className="mt-3 text-xl">Mission Submitted.</h3>
            <p className="mt-3 text-sm leading-6 text-white">You will receive confirmation after airspace validation.</p>
          </article>
        </div>
      </section>

      <section id="pricing" className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-14 md:grid-cols-2 md:px-10">
        <article className="rounded-2xl border border-white/15 bg-[#050505] p-6">
          <p className="text-xs uppercase tracking-[0.17em] text-white">Pricing Structure</p>
          <p className="mt-4 text-sm leading-7 text-white">Our pricing is calculated based on:</p>
          <ul className="mt-4 space-y-2 text-sm text-white">
            {pricingFactors.map((factor) => (
              <li key={factor}>- {factor}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white">Custom enterprise plans available.</p>
        </article>

        <article className="rounded-2xl border border-white/15 bg-[#050505] p-6">
          <p className="text-xs uppercase tracking-[0.17em] text-white">Legal & Disclaimer</p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-white">
            <p>All missions are subject to local aviation regulations. Execution depends on weather conditions and airspace approval.</p>
            <p>Operators are licensed in their respective jurisdictions.</p>
            <p>abandon.ai acts as a coordination platform between clients and certified operators.</p>
          </div>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10 md:px-10">
        <div className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#040404] via-[#101010] to-[#1c1c1c] p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.17em] text-white">Early Access</p>
          <h2 className="mt-3 text-2xl tracking-[0.03em] md:text-3xl">Limited regional operations are now open.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white">Request early access to schedule your first mission.</p>
          <button className="mt-6 rounded-md border border-white bg-transparent px-4 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-white/10">
            Request Access
          </button>
        </div>
      </section>
    </main>
  );
}

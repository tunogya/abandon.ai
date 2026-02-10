import MatrixBackground from "./components/MatrixBackground";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <MatrixBackground message="404" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="text-xs tracking-[0.4em] text-white/60">NOT FOUND</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="font-pixel-circle text-4xl">
          Pixel Circle
          Abandon Inc.
        </h1>
        <h1 className="font-pixel-triangle text-4xl">
          Pixel Triangle
          Abandon Inc.
        </h1> 
        <h1 className="font-pixel-line font-bold text-4xl">
          Pixel Line
          Abandon Inc.
        </h1> 
        <h1 className="font-pixel-square text-4xl">
          Pixel Square
          Abandon Inc.
        </h1>
        <h1 className="font-pixel-grid text-4xl">
          font-pixel-grid
          Abandon Inc.
        </h1>
      </main>
    </div>
  );
}

export function LandingBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.8)_1px,transparent_1.5px)] [background-size:35px_35px]" />
      <div className="pointer-events-none absolute -left-14 top-[52%] size-40 rounded-full bg-[#fc63c1] sm:size-56" />
      <div className="pointer-events-none absolute -right-7 top-20 size-20 rounded-full bg-[#fc63c1] sm:right-[12%] sm:size-28" />
      <div className="pointer-events-none absolute -right-16 top-[-8%] h-72 w-24 rotate-45 rounded-full bg-gradient-to-b from-[#d095ff] to-[#ef75cb] opacity-80 sm:h-[30rem] sm:w-32" />
      <div className="pointer-events-none absolute -left-24 bottom-8 h-64 w-20 rotate-45 rounded-full bg-gradient-to-b from-[#d095ff] to-[#ef75cb] opacity-75 sm:h-96 sm:w-28" />
      <div className="pointer-events-none absolute left-[13%] top-[37%] h-4 w-52 -rotate-[14deg] rounded-full bg-secondary/0 sm:h-7 sm:w-64" />
      <div className="pointer-events-none absolute right-[5%] top-[54%] h-3 w-28 rotate-[24deg] rounded-full bg-secondary/0 sm:w-44" />
    </>
  );
}

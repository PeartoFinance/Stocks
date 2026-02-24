export default function FullScreenLayout({ children }: { children: React.ReactNode }) {
  return (
    /* fixed inset-0: Stretches the div to all 4 corners of the browser.
       z-[9999]: Places this layer above the Header and Sidebar.
       bg-black: Ensures the content underneath is hidden.
    */
    <main className="fixed inset-0 z-[9999] h-screen w-screen bg-black overflow-hidden">
      {children}
    </main>
  );
}
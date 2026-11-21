/** Full-screen hold shown while the app resolves whether a session exists. */
export default function AuthLoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
    </div>
  );
}
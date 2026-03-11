export default function Footer() {
  return (
    <footer className="relative py-16 px-6">
      <div className="section-divider mb-16" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
              <span className="text-accent font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Agented<span className="text-accent">In</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-white/30">
            <span>agentedin.ai</span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span>
              Built by{" "}
              <span className="text-white/50 font-medium">TheAIGNC</span>
            </span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span>
              <span className="text-white/50 font-medium">Avant Media</span>
            </span>
          </div>
        </div>

        <div className="mt-12 text-center text-white/15 text-xs">
          &copy; {new Date().getFullYear()} AgentedIn. Where agents do business.
        </div>
      </div>
    </footer>
  );
}

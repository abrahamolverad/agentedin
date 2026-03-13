import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative py-16 px-6">
      <div className="section-divider mb-16" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center">
              <span className="text-[#0A66C2] font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Agented<span className="text-[#0A66C2]">In</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/feed" className="hover:text-white transition-colors">
              Platform
            </Link>
            <Link href="/swarms" className="hover:text-white transition-colors">
              Swarms
            </Link>
            <Link href="/api/agents" className="hover:text-white transition-colors">
              API
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-12 text-center text-white/15 text-xs">
          &copy; {new Date().getFullYear()} AgentedIn. The professional network for AI agents.
        </div>
      </div>
    </footer>
  );
}

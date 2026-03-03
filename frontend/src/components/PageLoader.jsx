import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--t-bg-dark,#0a1628)] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Tether" className="w-10 h-10 drop-shadow-lg" />
          <span className="text-2xl font-bold text-white tracking-tight">Tether</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-400">
          <LoaderIcon className="animate-spin size-4" />
          <span className="text-sm font-medium">Connecting...</span>
        </div>
      </div>
    </div>
  );
};
export default PageLoader;

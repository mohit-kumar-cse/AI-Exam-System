// src/components/ui/VerifyBadge.jsx
export default function VerifyBadge({ status }) {
  if (!status) return null;

  if (status.secure) {
    return (
      <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-500/10 border border-green-500/20 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-green-400 text-xs font-medium whitespace-nowrap">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
        <span className="hidden xs:inline">Verified </span>Secure
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-red-500/10 border border-red-500/20 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-red-400 text-xs font-medium whitespace-nowrap">
      <span className="shrink-0">⚠</span>
      <span className="hidden xs:inline">Tampered</span>
      <span className="xs:hidden">!</span>
    </div>
  );
}
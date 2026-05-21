// C:\AI-Exam-System\frontend\src\components\ui\VerifyBadge.jsx
export default function VerifyBadge({ status }) {
  if (!status) return null;

  if (status.secure) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-green-400 text-xs font-medium">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        Verified Secure
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-red-400 text-xs font-medium">
      ⚠ Tampered
    </div>
  );
}
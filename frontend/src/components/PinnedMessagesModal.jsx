import { XIcon } from "lucide-react";

function PinnedMessagesModal({ pinnedMessages, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--t-surface-2,#162236)] rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-white/[0.08]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Pinned Messages</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/[0.06] rounded-lg">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* MESSAGES LIST */}
        <div className="px-6 py-3 max-h-96 overflow-y-auto">
          {pinnedMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-b-0">
              <img
                src={msg.user.image}
                alt={msg.user.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-200 mb-0.5">{msg.user.name}</div>
                <div className="text-sm text-slate-300 whitespace-pre-line break-words">{msg.text}</div>
              </div>
            </div>
          ))}

          {pinnedMessages.length === 0 && (
            <div className="text-center text-slate-500 py-10 text-sm">No pinned messages yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PinnedMessagesModal;

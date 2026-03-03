import { XIcon } from "lucide-react";

function MembersModal({ members, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--t-surface-2,#162236)] rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-white/[0.08]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Channel Members</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/[0.06] rounded-lg">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* MEMBERS LIST */}
        <div className="px-6 py-3 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.user.id}
              className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-b-0"
            >
              {member.user?.image ? (
                <img
                  src={member.user.image}
                  alt={member.user.name}
                  className="size-8 rounded-full object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="size-8 rounded-full bg-blue-600/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-300">
                    {(member.user.name || member.user.id).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="text-sm font-medium text-slate-200">
                {member.user.name || member.user.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MembersModal;

import { HashIcon, LockIcon, UsersIcon, PinIcon, VideoIcon, Trash2Icon, MoreVerticalIcon } from "lucide-react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";
import InviteModal from "./InviteModal";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const { user } = useUser();
  const [_, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const memberCount = Object.keys(channel.state.members).length;

  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showDeleteChannel, setShowDeleteChannel] = useState(false);
  const [showChannelOptions, setShowChannelOptions] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const optionsRef = useRef(null);

  const otherUser = Object.values(channel.state.members).find(
    (member) => member.user.id !== user.id
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowChannelOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");

  const handleShowPinned = async () => {
    const channelState = await channel.query();
    setPinnedMessages(channelState.pinned_messages);
    setShowPinnedMessages(true);
  };

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      await channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
    }
  };

  const handleDeleteChannel = async () => {
    try {
      // Delete the channel from Stream
      await channel.delete();
      
      // Close the modal first
      setShowDeleteChannel(false);
      
      // Clear the channel from URL parameters - this will trigger HomePage to clear activeChannel
      setSearchParams({});
      
      // Show success message
      toast.success("Channel deleted successfully");
      
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error("Failed to delete channel");
    }
  };

  // Check if user can delete channel (channel creator or admin)
  const canDeleteChannel = () => {
    const currentMember = channel.state.members[user.id];
    const isCreator = channel.data?.created_by_id === user.id;
    const isAdmin = currentMember?.role === 'admin' || currentMember?.role === 'owner';
    
    // Don't allow deletion of DM channels
    if (isDM) return false;
    
    return isCreator || isAdmin;
  };

  return (
    <div className="h-14 border-b border-white/[0.06] flex items-center px-4 justify-between bg-[var(--t-surface-1,#0f1d32)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {channel.data?.private ? (
            <LockIcon className="size-4 text-slate-400" />
          ) : (
            <HashIcon className="size-4 text-slate-400" />
          )}

          {isDM && otherUser?.user?.image && (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name || otherUser.user.id}
              className="size-7 rounded-full object-cover ring-1 ring-white/10 mr-1"
            />
          )}

          <span className="font-semibold text-sm text-white">
            {isDM ? otherUser?.user?.name || otherUser?.user?.id : channel.data?.id}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          className="flex items-center gap-1.5 hover:bg-white/[0.06] py-1.5 px-2.5 rounded-lg transition-colors"
          onClick={() => setShowMembers(true)}
        >
          <UsersIcon className="size-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400">{memberCount}</span>
        </button>

        <button
          className="hover:bg-white/[0.06] p-1.5 rounded-lg transition-colors"
          onClick={handleVideoCall}
          title="Start Video Call"
        >
          <VideoIcon className="size-4 text-blue-400" />
        </button>

        {channel.data?.private && (
          <button className="btn btn-primary btn-small" onClick={() => setShowInvite(true)}>
            Invite
          </button>
        )}

        <button className="hover:bg-white/[0.06] p-1.5 rounded-lg transition-colors" onClick={handleShowPinned}>
          <PinIcon className="size-4 text-slate-400" />
        </button>

        {/* Channel Options Dropdown */}
        {!isDM && (
          <div className="relative" ref={optionsRef}>
            <button
              className="hover:bg-white/[0.06] p-1.5 rounded-lg transition-colors"
              onClick={() => setShowChannelOptions(!showChannelOptions)}
              title="Channel Options"
            >
              <MoreVerticalIcon className="size-4 text-slate-400" />
            </button>

            {showChannelOptions && (
              <div className="absolute right-0 top-full mt-1.5 bg-[var(--t-surface-2,#162236)] border border-white/[0.08] rounded-xl shadow-xl py-1 z-50 min-w-[160px]">
                {canDeleteChannel() && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setShowDeleteChannel(true);
                      setShowChannelOptions(false);
                    }}
                  >
                    <Trash2Icon className="size-4" />
                    Delete Channel
                  </button>
                )}
                {!canDeleteChannel() && (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    No options available
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showMembers && (
        <MembersModal
          members={Object.values(channel.state.members)}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
        />
      )}

      {showInvite && <InviteModal channel={channel} onClose={() => setShowInvite(false)} />}
      
      {showDeleteChannel && (
        <DeleteChannelModal
          channel={channel}
          onConfirm={handleDeleteChannel}
          onCancel={() => setShowDeleteChannel(false)}
        />
      )}
    </div>
  );
};

const DeleteChannelModal = ({ channel, onConfirm, onCancel }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  const channelName = channel.data?.id || channel.id;
  const isConfirmationValid = confirmText === channelName;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--t-surface-2,#162236)] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-white/[0.08]">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-full">
            <Trash2Icon className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Channel
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-medium text-slate-200">#{channelName}</span> channel and all its messages.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type <span className="font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-200">{channelName}</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
            placeholder={channelName}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium text-sm"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {isDeleting ? "Deleting..." : "Delete Channel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomChannelHeader;

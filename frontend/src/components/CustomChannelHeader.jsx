import { HashIcon, LockIcon, UsersIcon, PinIcon, VideoIcon, Trash2Icon, MoreVerticalIcon } from "lucide-react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";
import InviteModal from "./InviteModal";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const { user } = useUser();
  const [_, setSearchParams] = useSearchParams();

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
      // Delete the channel
      await channel.delete();
      toast.success("Channel deleted successfully");
      setShowDeleteChannel(false);
      // Navigate back to home (clear channel from URL)
      setSearchParams({});
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
    <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between bg-white">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {channel.data?.private ? (
            <LockIcon className="size-4 text-[#616061]" />
          ) : (
            <HashIcon className="size-4 text-[#616061]" />
          )}

          {isDM && otherUser?.user?.image && (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name || otherUser.user.id}
              className="size-7 rounded-full object-cover mr-1"
            />
          )}

          <span className="font-medium text-[#1D1C1D]">
            {isDM ? otherUser?.user?.name || otherUser?.user?.id : channel.data?.id}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 hover:bg-[#F8F8F8] py-1 px-2 rounded"
          onClick={() => setShowMembers(true)}
        >
          <UsersIcon className="size-5 text-[#616061]" />
          <span className="text-sm text-[#616061]">{memberCount}</span>
        </button>

        <button
          className="hover:bg-[#F8F8F8] p-1 rounded"
          onClick={handleVideoCall}
          title="Start Video Call"
        >
          <VideoIcon className="size-5 text-[#1264A3]" />
        </button>

        {channel.data?.private && (
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
            Invite
          </button>
        )}

        <button className="hover:bg-[#F8F8F8] p-1 rounded" onClick={handleShowPinned}>
          <PinIcon className="size-4 text-[#616061]" />
        </button>

        {/* Channel Options Dropdown */}
        {!isDM && (
          <div className="relative" ref={optionsRef}>
            <button
              className="hover:bg-[#F8F8F8] p-1 rounded"
              onClick={() => setShowChannelOptions(!showChannelOptions)}
              title="Channel Options"
            >
              <MoreVerticalIcon className="size-4 text-[#616061]" />
            </button>

            {showChannelOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[150px]">
                {canDeleteChannel() && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                  <div className="px-3 py-2 text-sm text-gray-500">
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2Icon className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Channel
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-medium">#{channelName}</span> channel and all its messages.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="font-mono bg-gray-100 px-1 rounded">{channelName}</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder={channelName}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isDeleting ? "Deleting..." : "Delete Channel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomChannelHeader;

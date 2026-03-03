import { HashIcon } from "lucide-react";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const isActive = activeChannel && activeChannel.id === channel.id;
  const isDM = channel.data.member_count === 2 && channel.data.id.includes("user_");

  if (isDM) return null;

  const unreadCount = channel.countUnread();

  return (
    <button
      onClick={() => setActiveChannel(channel)}
      className={`str-chat__channel-preview-messenger ${
        isActive ? "str-chat__channel-preview-messenger--active" : ""
      }`}
    >
      <HashIcon className="w-4 h-4 opacity-40 mr-2 flex-shrink-0" />
      <span className="str-chat__channel-preview-messenger-name flex-1 truncate">{channel.data.id}</span>

      {unreadCount > 0 && (
        <span className="flex items-center justify-center ml-auto min-w-5 h-5 px-1 text-[10px] font-bold rounded-full bg-red-500 text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
};
export default CustomChannelPreview;

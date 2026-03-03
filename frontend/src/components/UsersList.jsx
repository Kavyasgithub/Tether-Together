import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useChatContext } from "stream-chat-react";

import * as Sentry from "@sentry/react";
import { CircleIcon } from "lucide-react";

const UsersList = ({ activeChannel }) => {
  const { client } = useChatContext();
  const [_, setSearchParams] = useSearchParams();

  const fetchUsers = useCallback(async () => {
    if (!client?.user) return;

    const response = await client.queryUsers(
      { id: { $ne: client.user.id } },
      { name: 1 },
      { limit: 20 }
    );

    const usersOnly = response.users.filter((user) => !user.id.startsWith("recording-"));

    return usersOnly;
  }, [client]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users-list", client?.user?.id],
    queryFn: fetchUsers,
    enabled: !!client?.user,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // staleTime
  // what it does: tells React Query the data is "fresh" for 5 minutes
  // behavior: during these 5 minutes, React Query WON'T refetch the data automatically

  const startDirectMessage = async (targetUser) => {
    if (!targetUser || !client?.user) return;

    try {
      //  bc stream does not allow channelId to be longer than 64 chars
      const channelId = [client.user.id, targetUser.id].sort().join("-").slice(0, 64);
      const channel = client.channel("messaging", channelId, {
        members: [client.user.id, targetUser.id],
      });
      await channel.watch();
      setSearchParams({ channel: channel.id });
    } catch (error) {
      console.log("Error creating DM", error),
        Sentry.captureException(error, {
          tags: { component: "UsersList" },
          extra: {
            context: "create_direct_message",
            targetUserId: targetUser?.id,
          },
        });
    }
  };

  if (isLoading) return <div className="team-channel-list__message">Loading users...</div>;
  if (isError) return <div className="team-channel-list__message">Failed to load users</div>;
  if (!users.length) return <div className="team-channel-list__message">No other users found</div>;

  return (
    <div className="team-channel-list__users">
      {users.map((user) => {
        const channelId = [client.user.id, user.id].sort().join("-").slice(0, 64);
        const channel = client.channel("messaging", channelId, {
          members: [client.user.id, user.id],
        });
        const unreadCount = channel.countUnread();
        const isActive = activeChannel && activeChannel.id === channelId;

        return (
          <button
            key={user.id}
            onClick={() => startDirectMessage(user)}
            className={`str-chat__channel-preview-messenger ${
              isActive ? "str-chat__channel-preview-messenger--active" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 w-full">
              <div className="relative flex-shrink-0">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || user.id}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-300">
                      {(user.name || user.id).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <CircleIcon
                  className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--t-bg-dark,#0a1628)] rounded-full ${
                    user.online ? "text-emerald-400 fill-emerald-400" : "text-slate-500 fill-slate-500"
                  }`}
                />
              </div>

              <span className="str-chat__channel-preview-messenger-name truncate flex-1">
                {user.name || user.id}
              </span>

              {unreadCount > 0 && (
                <span className="flex items-center justify-center ml-auto min-w-5 h-5 px-1 text-[10px] font-bold rounded-full bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UsersList;

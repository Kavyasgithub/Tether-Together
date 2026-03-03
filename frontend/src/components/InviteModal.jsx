import { useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { XIcon } from "lucide-react";

const InviteModal = ({ channel, onClose }) => {
  const { client } = useChatContext();

  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // we could have done this with tanstack query, but to keep it simple, we're using useEffect here...
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setError("");

      try {
        const members = Object.keys(channel.state.members);
        const res = await client.queryUsers({ id: { $nin: members } }, { name: 1 }, { limit: 30 });
        setUsers(res.users);
      } catch (error) {
        console.log("Error fetching users", error);
        setError("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [channel, client]);

  const handleInvite = async () => {
    if (selectedMembers.length === 0) return;

    setIsInviting(true);
    setError("");

    try {
      await channel.addMembers(selectedMembers);
      onClose();
    } catch (error) {
      setError("Failed to invite users");
      console.log("Error inviting users:", error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        {/* HEADER */}
        <div className="create-channel-modal__header">
          <h2>Invite Users</h2>
          <button onClick={onClose} className="create-channel-modal__close">
            <XIcon className="size-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="create-channel-modal__form">
          {isLoadingUsers && <p>Loading users...</p>}
          {error && <p className="form-error">{error}</p>}
          {users.length === 0 && !isLoadingUsers && <p>No users found</p>}

          {users.length > 0 &&
            users.map((user) => {
              const isChecked = selectedMembers.includes(user.id);

              return (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                    isChecked
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm accent-blue-500"
                    value={user.id}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedMembers([...selectedMembers, user.id]);
                      else setSelectedMembers(selectedMembers.filter((id) => id !== user.id));
                    }}
                  />

                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="size-8 rounded-full object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-blue-600/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-300">
                        {(user.name || user.id).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <span className="font-medium text-slate-200 text-sm">
                    {user.name || user.id}
                  </span>
                </label>
              );
            })}

          {/* ACTIONS */}
          <div className="create-channel-modal__actions mt-4">
            <button className="btn btn-secondary" onClick={onClose} disabled={isInviting}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleInvite}
              disabled={!selectedMembers.length || isInviting}
            >
              {isInviting ? "Inviting..." : "Invite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;

import { useState } from "react";
import { 
  MessageSimple,
  useMessageContext,
  useChannelStateContext,
  useChatContext
} from "stream-chat-react";
import { useUser } from "@clerk/clerk-react";
import { Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";

const CustomMessage = (props) => {
  const { message } = useMessageContext();
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isMyMessage = message.user?.id === user?.id;

  // Don't render deleted messages
  if (message.type === 'deleted') {
    return null;
  }

  const handleDeleteForMe = async () => {
    try {
      // Use Stream's hide message functionality
      await message.hide();
      toast.success("Message hidden for you");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error hiding message:", error);
      toast.error("Failed to hide message");
    }
  };

  const handleDeleteForEveryone = async () => {
    try {
      // Use Stream's delete message functionality - soft delete (recoverable)
      await client.deleteMessage(message.id, { hard: false });
      toast.success("Message deleted for everyone");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  // Custom delete action handler
  const handleDeleteAction = () => {
    setShowDeleteModal(true);
  };

  // Override message actions to include delete for all messages
  const customMessageActions = ['react', 'reply', 'pin', 'mark-unread'];
  
  // Add edit for own messages only
  if (isMyMessage) {
    customMessageActions.push('edit');
  }
  
  // Add flag and mute for other users' messages
  if (!isMyMessage) {
    customMessageActions.push('flag', 'mute');
  }
  
  // Add delete for ALL messages
  customMessageActions.push('delete');

  return (
    <>
      <MessageSimple 
        {...props}
        messageActions={customMessageActions}
        handleAction={(name, event, message) => {
          if (name === 'delete') {
            event?.preventDefault();
            setShowDeleteModal(true);
            return;
          }
          // Let other actions pass through
          if (props.handleAction) {
            props.handleAction(name, event, message);
          }
        }}
      />
      
      {showDeleteModal && (
        <DeleteConfirmationModal
          isMyMessage={isMyMessage}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
};

const DeleteConfirmationModal = ({ 
  isMyMessage, 
  onDeleteForMe, 
  onDeleteForEveryone, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--t-surface-2,#162236)] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-white/[0.08]">
        <h3 className="text-lg font-semibold mb-4 text-white">Delete Message</h3>
        
        <div className="space-y-2.5">
          {/* Hide for me option - available for all users */}
          <button
            onClick={onDeleteForMe}
            className="w-full text-left p-3 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] transition-colors flex items-start gap-3"
          >
            <Trash2Icon className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-slate-200 text-sm">Hide for me</div>
              <div className="text-xs text-slate-400 mt-0.5">
                This message will be hidden from your view only
              </div>
            </div>
          </button>

          {/* Delete for everyone - available for ALL users and ALL messages */}
          <button
            onClick={onDeleteForEveryone}
            className="w-full text-left p-3 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors flex items-start gap-3"
          >
            <Trash2Icon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-red-400 text-sm">Delete for everyone</div>
              <div className="text-xs text-red-400/70 mt-0.5">
                This message will be deleted for all participants
              </div>
            </div>
          </button>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomMessage;
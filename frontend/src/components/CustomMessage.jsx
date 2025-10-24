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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Delete Message</h3>
        
        <div className="space-y-3">
          {/* Hide for me option - available for all users */}
          <button
            onClick={onDeleteForMe}
            className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors flex items-start gap-3"
          >
            <Trash2Icon className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-900">Hide for me</div>
              <div className="text-sm text-gray-500">
                This message will be hidden from your view only
              </div>
            </div>
          </button>

          {/* Delete for everyone - available for ALL users and ALL messages */}
          <button
            onClick={onDeleteForEveryone}
            className="w-full text-left p-3 rounded-lg border hover:bg-red-50 border-red-200 transition-colors flex items-start gap-3"
          >
            <Trash2Icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-red-600">Delete for everyone</div>
              <div className="text-sm text-red-500">
                This message will be deleted for all participants
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomMessage;
// src/hooks/useChannel.ts - Update your existing hook
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCallback } from "react";

export function useChannel(channelId?: Id<"channels">) {
  const messages = useQuery(
    api.chat.listMessages,
    channelId ? { channelId } : "skip",
  );

  const userProfiles = useQuery(
    api.chat.getUsersInChannel,
    channelId ? { channelId } : "skip",
  );

  const sendMessage = useMutation(api.chat.sendMessage);
  const addReaction = useMutation(api.chat.addReaction);      // ✅ You already have this
  const removeReaction = useMutation(api.chat.removeReaction); // ✅ You already have this
  const editMessage = useMutation(api.chat.editMessage);
  const deleteMessage = useMutation(api.chat.deleteMessage);

  const send = useCallback(
    (text: string, parentId?: Id<"messages">) => {
      if (!channelId) return Promise.resolve();
      return sendMessage({ channelId, text, parentId });
    },
    [channelId, sendMessage],
  );

  const edit = useCallback(
    (messageId: Id<"messages">, newText: string) =>
      editMessage({ messageId, newText }),
    [editMessage],
  );

  const deleteMsg = useCallback(
    (messageId: Id<"messages">) => deleteMessage({ messageId }),
    [deleteMessage],
  );

  const react = useCallback(
    (messageId: Id<"messages">, emoji: string) =>
      addReaction({ messageId, emoji }),
    [addReaction],
  );

  const unreact = useCallback(
    (messageId: Id<"messages">, emoji: string) =>
      removeReaction({ messageId, emoji }),
    [removeReaction],
  );

  return { messages, userProfiles, send, edit, deleteMsg, react, unreact };
}

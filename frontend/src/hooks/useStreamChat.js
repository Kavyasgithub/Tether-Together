import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import * as Sentry from "@sentry/react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// this hook is used to connect the current user to the Stream Chat API
// so that users can see each other's messages, send messages to each other, get realtime updates, etc.
// it also handles  the disconnection when the user leaves the page

export const useStreamChat = () => {
  const { user } = useUser();
  // getToken is called directly here to avoid a race condition where the
  // AuthProvider's useEffect (which attaches the Axios interceptor) runs
  // AFTER useQuery fires its first request — causing a 401 on first load.
  const { getToken } = useAuth();
  const [chatClient, setChatClient] = useState(null);
  const [connectError, setConnectError] = useState(null);

  // fetch stream token using react-query
  // query key includes user.id so each user has an isolated cache entry
  const {
    data: tokenData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["streamToken", user?.id],
    queryFn: async () => {
      // Fetch the auth token directly — bypasses the interceptor so the
      // very first request always has an Authorization header.
      const authToken = await getToken();
      const response = await axiosInstance.get("/chat/token", {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      return response.data;
    },
    enabled: !!user?.id, // only run when user is loaded
    retry: 1,           // one retry is enough; persistent failure = real error
    staleTime: 5 * 60 * 1000, // 5 min — avoid refetching on every re-render
  });

  // init stream chat client
  useEffect(() => {
    if (!tokenData?.token || !user?.id || !STREAM_API_KEY) return;

    const client = StreamChat.getInstance(STREAM_API_KEY);
    let cancelled = false;

    const connect = async () => {
      try {
        await client.connectUser(
          {
            id: user.id,
            name:
              user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? user.id,
            image: user.imageUrl ?? undefined,
          },
          tokenData.token
        );
        if (!cancelled) {
          setChatClient(client);
        }
      } catch (error) {
        console.log("Error connecting to stream", error);
        if (!cancelled) setConnectError(error);
        Sentry.captureException(error, {
          tags: { component: "useStreamChat" },
          extra: {
            context: "stream_chat_connection",
            userId: user?.id,
            streamApiKey: STREAM_API_KEY ? "present" : "missing",
          },
        });
      }
    };

    connect();

    // cleanup
    return () => {
      cancelled = true;
      setChatClient(null);
      setConnectError(null);
      client.disconnectUser();
    };
  }, [tokenData?.token, user?.id]);

  return { chatClient, isLoading, error: queryError || connectError, refetch };
};

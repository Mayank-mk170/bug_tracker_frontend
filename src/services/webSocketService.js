
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/ws";

let stompClient = null;

// Connect to Spring Boot WebSocket
export const connectWebSocket = (onConnected, onError) => {
  if (stompClient?.active) {
    return stompClient;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(SOCKET_URL),

    reconnectDelay: 5000,

    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: () => {
      console.log("WebSocket connected successfully");

      if (onConnected) {
        onConnected();
      }
    },

    onStompError: (frame) => {
      console.error(
        "WebSocket STOMP error:",
        frame.headers["message"],
        frame.body
      );

      if (onError) {
        onError(frame);
      }
    },

    onWebSocketError: (error) => {
      console.error("WebSocket connection error:", error);

      if (onError) {
        onError(error);
      }
    },

    onDisconnect: () => {
      console.log("WebSocket disconnected");
    },
  });

  stompClient.activate();

  return stompClient;
};

// Subscribe to project issue updates
export const subscribeToProjectIssues = (
  projectId,
  callback
) => {
  if (!stompClient?.connected) {
    console.error("WebSocket is not connected yet.");
    return null;
  }

  return stompClient.subscribe(
    `/topic/projects/${projectId}/issues`,
    (message) => {
      try {
        const event = JSON.parse(message.body);

        console.log("Received issue update:", event);

        callback(event);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  );
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

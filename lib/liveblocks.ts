import { createClient, LiveMap, IUserInfo, ResolveRoomsInfoArgs } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { RoomData, RoomInfo } from "@liveblocks/node";
import type { BaseRoomInfo, Json, Awaitable } from "@liveblocks/core";

// Define the shape of our presence - what users share with others in the room
export type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
  isTyping: boolean;
};

// Define the shape of our storage - persisted data shared by all users
export type Storage = {
  canvasObjects: LiveMap<string, any>;
  version: number;
};

// Define custom events that can be broadcasted to all users
export type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
};

export type RoomEvent = 
  | { type: "element:update"; element: any }
  | { type: "element:delete"; elementId: string }
  | { type: "connection:create"; connection: any }
  | { type: "connection:delete"; sourceId: string; targetId: string };

// Create a Liveblocks client
export const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  throttle: 16,
  async resolveUsers({ userIds }) {
    return userIds.map(id => ({
      name: id,
      avatar: undefined,
      color: undefined
    } as unknown as IUserInfo));
  },
  resolveRoomsInfo({ roomIds }: ResolveRoomsInfoArgs): Awaitable<(BaseRoomInfo | undefined)[] | undefined> {
    if (!roomIds.length) return undefined;
    return Promise.resolve(roomIds.map(id => {
      const room: BaseRoomInfo = {
        id,
        defaultAccesses: ["room:write"],
        metadata: {},
        groupsAccesses: {},
        usersAccesses: {},
        createdAt: new Date().toISOString() as Json
      };
      return room;
    }));
  },
});

// Helper function to generate an access token
async function generateAccessToken(room: string, userId: string) {
  const token = await fetch("/api/liveblocks-auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ room, userId }),
  }).then((response) => response.json());

  return {
    token,
    userInfo: { name: userId }
  };
}

// Create a RoomContext for components to consume
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useErrorListener,
  useStorage,
  useBatch,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useMutation,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client); 
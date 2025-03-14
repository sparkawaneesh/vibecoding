import { Liveblocks } from "@liveblocks/node";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { users } from "@clerk/clerk-sdk-node"; // Import Clerk's users API

// Create a Liveblocks instance
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Get user authentication info from Clerk
    const authSession = getAuth(request);
    if (!authSession?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user details
    const user = await users.getUser(authSession.userId);

    // Get room info from request body
    const { room } = await request.json();
    if (!room) {
      return new NextResponse("Room is required", { status: 400 });
    }

    // Create a Liveblocks session
    const session = liveblocks.prepareSession(authSession.userId, {
      userInfo: {
        name: user.firstName || "Anonymous",
        avatar: user.imageUrl || "",
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      },
    });

    // Give access to the room
    session.allow(room, ["room:write", "room:read", "room:presence:write"]);

    // Get the access token
    const token = await session.authorize();
    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

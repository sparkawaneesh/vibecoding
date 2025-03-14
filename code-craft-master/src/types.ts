import { Id } from "../convex/_generated/dataModel";

export interface Snippet {
  _id: Id<"snippets">;
  _creationTime: number;
  userId: string;
  title: string;
  language: string;
  code: string;
  userName: string;
} 
export type ActivityType = "post" | "comment" | "file" | "question" | "like";

type ActivityAttachment = {
  id: string;
  type: "image" | "video" | "document";
  label: string;
};

export type CommunityPost = {
  id: string;
  groupId: string;
  title: string;
  body: string;
  type: ActivityType;
  category: string;
  author: string;
  role: "Admin" | "Member" | "Expert" | "Agent";
  createdAt: string;
  likes: number;
  replies: number;
  attachments?: ActivityAttachment[];
};

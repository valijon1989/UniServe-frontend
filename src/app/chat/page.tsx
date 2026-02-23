import { Suspense } from "react";
import { ChatClient } from "@/components/chat/ChatClient.client";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-4xl px-4 py-10 text-center text-sm text-slate-500">
          Loading chat…
        </div>
      }
    >
      <ChatClient />
    </Suspense>
  );
}

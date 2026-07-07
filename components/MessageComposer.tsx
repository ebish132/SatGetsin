"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { sendMessage } from "@/app/mesajlar/actions";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
    >
      Göndər
    </button>
  );
}

export default function MessageComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await sendMessage(formData);
        formRef.current?.reset();
      }}
      className="flex gap-2 border-t border-gray-200 bg-white p-3"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <input
        name="content"
        required
        autoComplete="off"
        placeholder="Mesaj yazın..."
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-green-600 focus:outline-none"
      />
      <SendButton />
    </form>
  );
}

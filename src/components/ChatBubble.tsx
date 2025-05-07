import { MessageResponse } from "@/lib/apiClient/schemas/message";

type Props = {
  message: MessageResponse
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${isUser
          ? "bg-blue-500 text-white rounded-br-none"
          : "bg-gray-200 text-gray-800 rounded-bl-none"
          }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
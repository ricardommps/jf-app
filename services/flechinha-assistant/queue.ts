import {
  FlechinhaAssistantMessage,
  FlechinhaAssistantPersistedState,
  FlechinhaAssistantQueue,
} from "@/types/flechinha-assistant";

const HIDDEN_STATUSES = new Set(["dismissed", "clicked"]);

const toTimestamp = (value?: string | null) => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const createEmptyFlechinhaAssistantState =
  (): FlechinhaAssistantPersistedState => ({
    version: 1,
    messages: {},
  });

export const shouldHideFlechinhaMessage = (
  messageId: string,
  state: FlechinhaAssistantPersistedState,
) => {
  const status = state.messages[messageId]?.status;
  return status ? HIDDEN_STATUSES.has(status) : false;
};

export const buildFlechinhaAssistantQueue = (
  messages: FlechinhaAssistantMessage[],
  state: FlechinhaAssistantPersistedState,
): FlechinhaAssistantQueue => {
  const queuedMessages = [...messages]
    .filter((message) => !shouldHideFlechinhaMessage(message.id, state))
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      const createdAtDiff =
        toTimestamp(right.createdAt) - toTimestamp(left.createdAt);

      if (createdAtDiff !== 0) {
        return createdAtDiff;
      }

      return left.id.localeCompare(right.id);
    });

  return {
    activeMessage: queuedMessages[0] ?? null,
    queuedMessages,
  };
};

import {
  FlechinhaAssistantMessageState,
  FlechinhaAssistantPersistedState,
  FlechinhaAssistantStatus,
} from "@/types/flechinha-assistant";
import { createEmptyFlechinhaAssistantState } from "./queue";

const STATUS_PRIORITY: Record<FlechinhaAssistantStatus, number> = {
  seen: 1,
  dismissed: 2,
  clicked: 3,
};

const sessionStateByUser = new Map<string, FlechinhaAssistantPersistedState>();

let mutationQueue: Promise<unknown> = Promise.resolve();

const enqueueMutation = <T>(mutation: () => Promise<T>): Promise<T> => {
  const run = mutationQueue.then(mutation, mutation);

  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
};

const buildSessionKey = (userId?: number | null) =>
  userId ? `user-${userId}` : "guest";

const cloneState = (
  state: FlechinhaAssistantPersistedState,
): FlechinhaAssistantPersistedState => ({
  version: 1,
  messages: { ...state.messages },
});

const readStateFromSession = (userId?: number | null) => {
  const sessionKey = buildSessionKey(userId);
  const existingState = sessionStateByUser.get(sessionKey);

  if (!existingState) {
    return createEmptyFlechinhaAssistantState();
  }

  return cloneState(existingState);
};

const persistState = async (
  userId: number | null | undefined,
  state: FlechinhaAssistantPersistedState,
) => {
  sessionStateByUser.set(buildSessionKey(userId), cloneState(state));
  return cloneState(state);
};

const mergeMessageState = (
  currentState: FlechinhaAssistantMessageState | undefined,
  nextStatus: FlechinhaAssistantStatus,
): FlechinhaAssistantMessageState => {
  if (
    currentState &&
    STATUS_PRIORITY[currentState.status] > STATUS_PRIORITY[nextStatus]
  ) {
    return currentState;
  }

  return {
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
};

export const getFlechinhaAssistantState = async (userId?: number | null) => {
  return readStateFromSession(userId);
};

export const saveFlechinhaAssistantState = async (
  userId: number | null | undefined,
  state: FlechinhaAssistantPersistedState,
) => {
  return enqueueMutation(() => persistState(userId, state));
};

export const syncFlechinhaAssistantState = async (
  userId: number | null | undefined,
  activeMessageIds: string[],
) => {
  return enqueueMutation(async () => {
    const currentState = readStateFromSession(userId);
    const allowedIds = new Set(activeMessageIds);
    const nextMessages = Object.fromEntries(
      Object.entries(currentState.messages).filter(([messageId]) =>
        allowedIds.has(messageId),
      ),
    );

    const nextState: FlechinhaAssistantPersistedState = {
      version: 1,
      messages: nextMessages,
    };

    return persistState(userId, nextState);
  });
};

export const updateFlechinhaAssistantMessageStatus = async (
  userId: number | null | undefined,
  messageId: string,
  status: FlechinhaAssistantStatus,
) => {
  return enqueueMutation(async () => {
    const currentState = readStateFromSession(userId);
    const currentMessageState = currentState.messages[messageId];

    const nextState: FlechinhaAssistantPersistedState = {
      version: 1,
      messages: {
        ...currentState.messages,
        [messageId]: mergeMessageState(currentMessageState, status),
      },
    };

    return persistState(userId, nextState);
  });
};

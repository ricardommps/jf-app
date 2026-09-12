import { useIsFocused } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSession } from "@/contexts/Authentication";
import { useStravaStatus } from "@/hooks/useConnectStrava/useConnectStrava";
import {
  buildFlechinhaAssistantQueue,
  createEmptyFlechinhaAssistantState,
} from "@/services/flechinha-assistant/queue";
import { buildFlechinhaAssistantMessages } from "@/services/flechinha-assistant/sources";
import {
  consumeWeeklyGreeting,
  getFlechinhaWeekKey,
  isFlechinhaWeekend,
} from "@/services/flechinha-assistant/weekly";
import {
  getFlechinhaAssistantState,
  syncFlechinhaAssistantState,
  updateFlechinhaAssistantMessageStatus,
} from "@/services/flechinha-assistant/storage";
import { getMyInvoices } from "@/services/invoice.service";
import { getNotificationsV2 } from "@/services/notification-v2.service";
import { runnerProgram } from "@/services/program.services";
import { getWeeklyRunningWorkouts, getWorkouts } from "@/services/workouts.service";
import {
  FlechinhaAssistantMessage,
  FlechinhaAssistantPersistedState,
} from "@/types/flechinha-assistant";
import { Invoice } from "@/types/invoice";
import { NotificationV2 } from "@/types/notification-v2";
import { Workout } from "@/types/workout";

type RunnerProgramSummary = {
  id: number;
};

type StravaStatus = {
  connected?: boolean;
};

type UseFlechinhaAssistantOptions = {
  enabled?: boolean;
};

type UseFlechinhaAssistantReturn = {
  activeMessage: FlechinhaAssistantMessage | null;
  queuedMessages: FlechinhaAssistantMessage[];
  persistedState: FlechinhaAssistantPersistedState;
  isLoading: boolean;
  error: Error | null;
  markMessageSeen: (messageId: string) => Promise<void>;
  dismissMessage: (messageId: string) => Promise<void>;
  clickMessage: (messageId: string) => Promise<void>;
  refetchAssistant: () => Promise<void>;
};

export const useFlechinhaAssistant = ({
  enabled = true,
}: UseFlechinhaAssistantOptions = {}): UseFlechinhaAssistantReturn => {
  const { getProfile } = useSession();
  const isFocused = useIsFocused();
  const profile = getProfile();
  const userId = profile?.id ?? null;

  const [persistedState, setPersistedState] =
    useState<FlechinhaAssistantPersistedState>(
      createEmptyFlechinhaAssistantState(),
    );
  const [isStateLoading, setIsStateLoading] = useState(enabled);
  const [showWeeklyGreeting, setShowWeeklyGreeting] = useState(false);
  const [showWeekendGreeting, setShowWeekendGreeting] = useState(false);
  const weeklyGreetingCheckKey = useRef<string | null>(null);
  const [stateError, setStateError] = useState<Error | null>(null);

  const {
    data: invoices,
    isLoading: isInvoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useQuery<Invoice[], Error>({
    queryKey: ["flechinha-assistant", "invoices", userId],
    queryFn: getMyInvoices,
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery<NotificationV2[], Error>({
    queryKey: ["flechinha-assistant", "notifications", userId],
    queryFn: getNotificationsV2,
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const {
    data: runnerPrograms,
    isLoading: isRunnerProgramLoading,
    error: runnerProgramError,
    refetch: refetchRunnerProgram,
  } = useQuery<RunnerProgramSummary[], Error>({
    queryKey: ["flechinha-assistant", "runner-program", userId],
    queryFn: runnerProgram,
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const runnerProgramId = runnerPrograms?.[0]?.id ?? null;

  const {
    data: workouts,
    isLoading: isWorkoutsLoading,
    error: workoutsError,
    refetch: refetchWorkouts,
  } = useQuery<Workout[], Error>({
    queryKey: ["flechinha-assistant", "workouts", runnerProgramId],
    queryFn: () => getWorkouts(runnerProgramId as number, 1),
    enabled: enabled && !!runnerProgramId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const {
    data: weeklyCompletion,
    isLoading: isWeeklyCompletionLoading,
    error: weeklyCompletionError,
    refetch: refetchWeeklyCompletion,
  } = useQuery<boolean, Error>({
    queryKey: ["flechinha-assistant", "weekly-completion", runnerProgramId],
    queryFn: () => getWeeklyRunningWorkouts(runnerProgramId as number),
    enabled: enabled && !!runnerProgramId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const {
    data: stravaStatus,
    isLoading: isStravaStatusLoading,
    error: stravaStatusError,
    refetch: refetchStravaStatus,
  } = useStravaStatus({
    enabled: enabled && !!runnerProgramId,
  }) as {
    data: StravaStatus | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
  };

  const loadPersistedState = useCallback(async () => {
    if (!enabled) {
      setPersistedState(createEmptyFlechinhaAssistantState());
      setShowWeeklyGreeting(false);
      setShowWeekendGreeting(false);
      weeklyGreetingCheckKey.current = null;
      setIsStateLoading(false);
      setStateError(null);
      return;
    }

    setIsStateLoading(true);

    try {
      const nextState = await getFlechinhaAssistantState(userId);
      setPersistedState(nextState);
      const weeklyGreetingUserKey = String(userId ?? "guest") + ":" + getFlechinhaWeekKey();
      if (weeklyGreetingCheckKey.current !== weeklyGreetingUserKey) {
        weeklyGreetingCheckKey.current = weeklyGreetingUserKey;
        setShowWeeklyGreeting(await consumeWeeklyGreeting(userId));
      }
      setShowWeekendGreeting(isFlechinhaWeekend());
      setStateError(null);
    } catch (error) {
      setPersistedState(createEmptyFlechinhaAssistantState());
      setStateError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsStateLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    void loadPersistedState();
  }, [loadPersistedState]);

  const messages = useMemo(
    () =>
      buildFlechinhaAssistantMessages({
        invoices,
        notifications,
        runnerProgramId,
        showWeeklyGreeting,
        showWeeklyCompletion: weeklyCompletion === true,
        showWeekendGreeting,
        workouts,
        stravaConnected: stravaStatus?.connected ?? null,
      }),
    [
      invoices,
      notifications,
      runnerProgramId,
      showWeeklyGreeting,
      weeklyCompletion,
      showWeekendGreeting,
      stravaStatus?.connected,
      workouts,
    ],
  );

  const areMessageSourcesReady =
    !enabled ||
    (!isInvoicesLoading &&
      !isNotificationsLoading &&
      !isRunnerProgramLoading &&
      (!runnerProgramId || (!isStravaStatusLoading && !isWorkoutsLoading && !isWeeklyCompletionLoading)));

  useEffect(() => {
    if (!enabled || isStateLoading || !areMessageSourcesReady) {
      return;
    }

    let isMounted = true;

    void syncFlechinhaAssistantState(
      userId,
      messages.map((message) => message.id),
    ).then((nextState) => {
      if (isMounted) {
        setPersistedState(nextState);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    areMessageSourcesReady,
    enabled,
    isStateLoading,
    messages,
    userId,
  ]);

  useEffect(() => {
    if (!enabled || !isFocused) {
      return;
    }

    void loadPersistedState();
    void refetchInvoices();
    void refetchNotifications();
    void refetchRunnerProgram();
    void refetchStravaStatus();

    if (runnerProgramId) {
      void refetchWorkouts();
      void refetchWeeklyCompletion();
    }
  }, [
    enabled,
    isFocused,
    loadPersistedState,
    refetchInvoices,
    refetchNotifications,
    refetchRunnerProgram,
    refetchStravaStatus,
    refetchWorkouts,
    refetchWeeklyCompletion,
    runnerProgramId,
  ]);

  const updateMessageStatus = useCallback(
    async (messageId: string, status: "seen" | "dismissed" | "clicked") => {
      const nextState = await updateFlechinhaAssistantMessageStatus(
        userId,
        messageId,
        status,
      );
      setPersistedState(nextState);
    },
    [userId],
  );

  const queue = useMemo(
    () => buildFlechinhaAssistantQueue(messages, persistedState),
    [messages, persistedState],
  );

  const error =
    stateError ||
    invoicesError ||
    notificationsError ||
    runnerProgramError ||
    stravaStatusError ||
    workoutsError ||
    weeklyCompletionError ||
    null;

  const isLoading =
    isStateLoading ||
    isInvoicesLoading ||
    isNotificationsLoading ||
    isRunnerProgramLoading ||
    (!!runnerProgramId && isStravaStatusLoading) ||
    (!!runnerProgramId && isWorkoutsLoading) ||
    (!!runnerProgramId && isWeeklyCompletionLoading);

  const refetchAssistant = useCallback(async () => {
    await loadPersistedState();
    await Promise.all([
      refetchInvoices(),
      refetchNotifications(),
      refetchRunnerProgram(),
      refetchStravaStatus(),
      runnerProgramId ? refetchWorkouts() : Promise.resolve(),
      runnerProgramId ? refetchWeeklyCompletion() : Promise.resolve(),
    ]);
  }, [
    loadPersistedState,
    refetchInvoices,
    refetchNotifications,
    refetchRunnerProgram,
    refetchStravaStatus,
    refetchWorkouts,
    refetchWeeklyCompletion,
    runnerProgramId,
  ]);

  return {
    activeMessage: queue.activeMessage,
    queuedMessages: queue.queuedMessages,
    persistedState,
    isLoading,
    error,
    markMessageSeen: (messageId: string) => updateMessageStatus(messageId, "seen"),
    dismissMessage: (messageId: string) =>
      updateMessageStatus(messageId, "dismissed"),
    clickMessage: (messageId: string) => updateMessageStatus(messageId, "clicked"),
    refetchAssistant,
  };
};

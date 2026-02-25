import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";

import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";

interface StopwatchTimerProps {
  resetSeconds?: string | number;
}

const parseSeconds = (value?: string | number): number | null => {
  if (!value) return null;
  const num = parseInt(String(value).replace(/\D/g, ""), 10);
  return isNaN(num) ? null : num;
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const StopwatchTimer = ({ resetSeconds }: StopwatchTimerProps) => {
  const totalSeconds = parseSeconds(resetSeconds);
  const isCountdown = totalSeconds !== null;

  const [time, setTime] = useState(isCountdown ? totalSeconds! : 0);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // 🔊 Carrega som
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/beep.mp3"),
          { shouldPlay: false, volume: 1.0 },
        );
        soundRef.current = sound;
      } catch (e) {
        console.warn("Erro ao carregar beep:", e);
      }
    };

    loadSound();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playBeep = async () => {
    try {
      if (!soundRef.current) return;
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
    } catch (e) {
      console.warn("Erro ao reproduzir beep:", e);
    }
  };

  // ⏱ Timer
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (isCountdown) {
          const next = prev - 1;

          // últimos 5 segundos
          if (next <= 5 && next > 0) {
            playBeep();
          }

          // terminou
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            playBeep();

            // volta para tempo inicial pausado
            return totalSeconds!;
          }

          return next;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handlePlay = () => setRunning(true);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTime(isCountdown ? totalSeconds! : 0);
  };

  const isLastFive = isCountdown && time <= 5 && time > 0 && running;

  return (
    <VStack className="w-full px-4 py-2">
      {/* Linha principal */}
      <HStack className="items-center justify-between">
        {/* Tempo + descrição */}
        <HStack className="items-center gap-2">
          <Text
            className={`
              text-3xl font-bold
              ${isLastFive ? "text-red-500" : "text-white"}
            `}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {formatTime(time)}
          </Text>

          <Text className="text-zinc-400 text-base">
            (Descanso entre séries)
          </Text>
        </HStack>

        {/* Ícones */}
        <HStack className="items-center gap-5">
          {/* Play aparece quando NÃO está rodando */}
          {!running && (
            <Ionicons
              name="play"
              size={28}
              color="white"
              onPress={handlePlay}
            />
          )}

          {/* Stop aparece somente quando rodando */}
          {running && (
            <Ionicons
              name="stop"
              size={28}
              color="white"
              onPress={handleStop}
            />
          )}

          {/* Reset sempre visível */}
          <Ionicons
            name="refresh"
            size={26}
            color="white"
            onPress={handleReset}
          />
        </HStack>
      </HStack>
    </VStack>
  );
};

export default StopwatchTimer;

import { Workout } from "@/types/workout";

interface MarkedDate {
  selected: boolean;
  selectedColor: string;
  selectedTextColor: string;
  dotColor?: string;
  marked?: boolean;
}

export const processWorkoutDates = (
  workouts: Workout[]
): { [key: string]: MarkedDate } => {
  const marked: { [key: string]: MarkedDate } = {};
  const today = new Date().toISOString().split("T")[0];

  workouts.forEach((workout) => {
    if (!workout.datePublished) return;

    // Converter datePublished para formato YYYY-MM-DD
    const workoutDate = new Date(workout.datePublished)
      .toISOString()
      .split("T")[0];

    // Determinar a cor baseada nas condições
    let color = "";

    if (workout.finished && !workout.unrealized) {
      // Finalizado e não não-realizado = Verde
      color = "#4ADE80"; // verde
    } else if (workout.finished && workout.unrealized) {
      // Finalizado mas não-realizado = Laranja
      color = "#FB923C"; // laranja
    } else if (!workout.finished && workoutDate < today) {
      // Não finalizado e data passada = Vermelho
      color = "#EF4444"; // vermelho
    } else if (workoutDate === today) {
      // Data de hoje = Azul
      color = "#1E40AF"; // azul escuro
    } else {
      // Data futura não finalizada = Cinza claro
      color = "#94A3B8"; // cinza
    }

    marked[workoutDate] = {
      selected: true,
      selectedColor: color,
      selectedTextColor: "#ffffff",
      marked: true,
      dotColor: color,
    };
  });

  return marked;
};

export const getWorkoutStatusColor = (workout: Workout): string => {
  const today = new Date().toISOString().split("T")[0];
  const workoutDate = new Date(workout.datePublished)
    .toISOString()
    .split("T")[0];

  if (workout.finished && !workout.unrealized) {
    return "#4ADE80"; // verde - concluído
  } else if (workout.finished && workout.unrealized) {
    return "#FB923C"; // laranja - não realizado
  } else if (!workout.finished && workoutDate < today) {
    return "#EF4444"; // vermelho - perdido
  } else if (workoutDate === today) {
    return "#1E40AF"; // azul - hoje
  } else {
    return "#94A3B8"; // cinza - futuro
  }
};

export const getWorkoutStatusText = (workout: Workout): string => {
  const today = new Date().toISOString().split("T")[0];
  const workoutDate = new Date(workout.datePublished)
    .toISOString()
    .split("T")[0];

  if (workout.finished && !workout.unrealized) {
    return "Concluído";
  } else if (workout.finished && workout.unrealized) {
    return "Não realizado";
  } else if (!workout.finished && workoutDate < today) {
    return "Perdido";
  } else if (workoutDate === today) {
    return "Hoje";
  } else {
    return "Agendado";
  }
};

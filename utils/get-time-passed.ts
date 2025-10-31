export const getTimePassedText = (executionDay: string): string => {
  const executionDate = new Date(executionDay);
  const now = new Date();
  const diffInMs = now.getTime() - executionDate.getTime();

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? "Agora" : `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}sem`;
  } else {
    return `${Math.floor(diffInDays / 30)}m`;
  }
};

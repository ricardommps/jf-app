import { createContext, useContext, useState, ReactNode } from "react";

interface WorkoutContextProps {
  checkList: number[];
  handleCheckList: (value: number) => void;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(
  undefined
);

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [checkList, setCheckList] = useState<number[]>([]);

  const handleCheckList = (value: number) => {
    setCheckList((prev) =>
      prev.includes(value)
        ? prev.filter((id) => id !== value)
        : [...prev, value]
    );
  };

  return (
    <WorkoutContext.Provider value={{ checkList, handleCheckList }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouut = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkouut deve ser usado dentro de um WorkoutProvider");
  }
  return context;
};

export type CalendarEvent = {
  id: string;
  day: number;
  month: number;
  year: number;
  name: string;
  color: string;
};

export type SubSubTask = {
  id: string;
  label: string;
  done: boolean;
};

export type SubTask = {
  id: string;
  label: string;
  done: boolean;
  subTasks: SubSubTask[];
};

export type Task = {
  id: string;
  label: string;
  done: boolean;
  dateKey: string;
  subTasks: SubTask[];
};

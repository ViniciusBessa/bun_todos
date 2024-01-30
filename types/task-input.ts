export interface GetTaskInput {
  id: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  completed: boolean;
  userId: string;
}

export interface UpdateTaskInput {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface TodoItem {
  completed: boolean;
  contents: string;
}
export interface TodoDoc {
  items: TodoItem[]
}

export interface InputNode<T extends object = {}> {
  id: string;
  data?: T;
}

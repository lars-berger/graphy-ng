export interface TransformedNode<T extends object = {}> {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  transform: string;
  isVisible: boolean;
  data?: T;
}

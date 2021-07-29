export interface TransformedNode<T = {}> {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  transform: string;
  isVisible: boolean;
  data: T;
}

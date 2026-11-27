export interface SuiIconPath {
  readonly kind: 'path';
  readonly d: string;
}

export interface SuiIconCircle {
  readonly kind: 'circle';
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

export interface SuiIconRect {
  readonly kind: 'rect';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rx: number;
}

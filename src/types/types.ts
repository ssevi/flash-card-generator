// types.ts
export type GridLayoutType = '2x2' | '2x3' | '3x2' | '3x3';
export type PageSizeType = 'a4' | 'letter' | 'legal';
export type OrientationType = 'portrait' | 'landscape';
export type DisplayModeType = 'both' | 'text-only' | 'image-only';
export type LayoutModeType = 'grid' | 'fixed-size';

export interface CardSize {
  width: number;
  height: number;
}

export interface PDFSettings {
  pageSize: PageSizeType;
  orientation: OrientationType;
  margin: number;
  displayMode: DisplayModeType;
  layoutMode: LayoutModeType;
  gridLayout: GridLayoutType | null;
  cardSize: CardSize | null;
}

export interface GridLayout {
  rows: number;
  cols: number;
  label: string;
}

export interface Photo {
  _id: string;
  url: string;
  title: string;
  description?: string;
}

export const GRID_LAYOUTS: Record<GridLayoutType, GridLayout> = {
  '2x2': { rows: 2, cols: 2, label: '4 cards per page (2×2)' },
  '2x3': { rows: 2, cols: 3, label: '6 cards per page (2×3)' },
  '3x2': { rows: 3, cols: 2, label: '6 cards per page (3×2)' },
  '3x3': { rows: 3, cols: 3, label: '9 cards per page (3×3)' }
};
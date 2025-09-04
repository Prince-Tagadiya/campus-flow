declare module 'react-grid-layout' {
  import * as React from 'react';

  export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    static?: boolean;
  }

  export interface ResponsiveProps {
    className?: string;
    layouts?: Record<string, LayoutItem[]>;
    cols?: Record<string, number>;
    breakpoints?: Record<string, number>;
    rowHeight?: number;
    margin?: [number, number];
    isDraggable?: boolean;
    isResizable?: boolean;
    useCSSTransforms?: boolean;
    preventCollision?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
    draggableHandle?: string;
    draggableCancel?: string;
    isBounded?: boolean;
    measureBeforeMount?: boolean;
    onLayoutChange?: (layout: LayoutItem[], layouts: Record<string, LayoutItem[]>) => void;
    onDragStop?: (layout: LayoutItem[], oldItem?: any, newItem?: any, placeholder?: any, e?: any, element?: any) => void;
    onResizeStop?: (layout: LayoutItem[], oldItem?: any, newItem?: any, placeholder?: any, e?: any, element?: any) => void;
    children?: React.ReactNode;
  }

  export class Responsive extends React.Component<ResponsiveProps> {}
  export function WidthProvider<P>(component: React.ComponentType<P>): React.ComponentType<P>;
}



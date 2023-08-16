export interface W extends Window {
    DataVision: any
}

export type UnknownObj = {
    [key: string]: any;
}

export type State = {
    [key: string]: any;
    clientX: number;
    clientY: number;
    isTooltip: boolean;
    openTables: string[]
}

export type XyState = State & {
}

export type XyStateObject = {
    parent: HTMLDivElement;
    svg: SVGElement;
    dataset: XyDatasetItem[];
    max: number;
    min: number;
    maxSeries: number;
    drawingArea: DrawingArea;
    slot: number;
    barSlot: number;
    config: Config;
    relativeZero: number;
    absoluteMax: number;
}

export type Config = {
    [key: string]: any;
    width: number;
    height: number;
    padding: Padding;
    toolkit: UnknownObj;
}

export type XyDatasetItem = {
    [key: string]: any;
    name: string;
    type: "bar" | "line" | "plot";
    showLabels?: boolean;
    showProgression: boolean;
    values: number[];
    color: string;
    linearProgression: LinearProgression
    plots: XyTypes[];
    bars: XyTypes[];
    datasetId: string;
}

export type Padding = {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type DrawingArea = {
    top: number,
    right: number;
    bottom: number;
    left: number;
    height: number;
    width: number;
    fullHeight: number;
    fullWidth: number;
}

export type LinearProgression = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    slope: number;
    trend: number;
}

export type XyTypes = {
    x: number;
    y: number;
    value: number;
    color?: string;
}

export type Line = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
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

export type XyState = State & {}
export type DonutState = State & {}
export type VerticalState = State & {}
export type GaugeState = State & {}
export type RadialBarState = State & {}
export type WaffleState = State & {}
export type SkeletonState = UnknownObj & {}

export type SkeletonStateObj = {
    parent: HTMLDivElement;
    svg: SVGElement;
    config: Config;
    drawingArea: DrawingArea;
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

export type RadialBarStateObject = {
    parent: HTMLDivElement;
    svg: SVGElement;
    config: Config;
    dataset: RadialBarDatasetItem[];
    total: number;
    average: number;
    drawingArea: DrawingArea;
}

export type WaffleStateObject = {
    parent: HTMLDivElement;
    svg: SVGElement;
    config: Config;
    dataset: WaffleDatasetItem[];
    drawingArea: DrawingArea;
    total: number;
    average: number;
}

export type DonutStateObject = {
    parent: HTMLDivElement;
    svg: SVGElement;
    config: Config;
    dataset: DonutDatasetItem[];
    drawingArea: DrawingArea;
    total: number;
    average: number;
}

export type VerticalStateObject = {
    parent: HTMLDivElement;
    svg: SVGElement;
    config: Config;
    dataset: VerticalDatasetItem[];
    drawingArea: DrawingArea;
    total: number;
    average: number;
}

export type GaugeStateObject = {
    parent: HTMLDivElement;
    svg: SVGElement;
    config: Config;
    dataset: GaugeDataset;
    drawingArea: DrawingArea;
    total: number;
}

export type Config = {
    [key: string]: any;
    width: number;
    height: number;
    padding: Padding;
    toolkit: UnknownObj;
}

export type RadialBarDatasetItem = {
    [key: string]: any;
    name: string;
    percentage: number;
    value: number;
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

export type WaffleDatasetItem = {
    [key: string]: any;
    name: string;
    value: number;
    color: string;
    datasetId: string;
}

export type DonutDatasetItem = {
    [key: string]: any;
    name: string;
    value: number;
    color: string;
    datasetId: string;
}

export type VerticalDatasetItem = {
    [key: string]: any;
    name: string;
    value: number;
    color: string;
    children?: VerticalDatasetItem[];
}

export type Range = {
    from: number;
    to: number;
    quantity: number;
    color: string | null;
}

export type GaugeDataset = {
    base: number;
    value: number;
    series: Range[];
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
    centerX: number;
    centerY: number;
}

export type LinearProgression = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    slope: number;
    trend: number;
}

export type Plot = {
    x: number;
    y: number;
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

export type Datapoint = {
    element: SVGElement;
    datasetId: string;
}
import { Chart, DataVisionAttribute, EventTrigger, SvgAttribute, SvgElement } from "./constants";
import { spawnNS, addTo, isValidUserValue, createLinearGradient, shiftHue, closestDecimal, createArrow, createBarGradientPositive, createBarGradientNegative, convertColorToHex, getDrawingArea, createUid, parseUserConfig, parseUserDataset, createConfig, createSvg, convertConfigColors, calcLinearProgression } from "./functions";
import { configLine, opacity, palette } from "./config";
import XY_STATE from "./state_xy";
import { createTitle } from "./title";
import { createLegendXy } from "./legend";
import { createToolkit } from "./toolkit";
import { createTooltipXy } from "./tooltip";
import { XyDatasetItem, Config, DrawingArea, XyState, XyStateObject, Line, LinearProgression } from "../types";

export function prepareXy(parent: HTMLDivElement) {
    parent.style.width = `${parent.getAttribute("width")}`;
    const xyId = createUid();
    addTo(parent, "id", xyId);
    const userConfig = parseUserConfig(parent.dataset.visionConfig);
    const dataset: XyDatasetItem[] = parseUserDataset(parent.dataset.visionSet);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configLine
    });

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => handleConfigChange({ mutations, configObserver, id: xyId, parent, svg, dataset, state: XY_STATE }));
    const datasetObserver: MutationObserver = new MutationObserver(mutations => handleDatasetChange({ mutations, datasetObserver, id: xyId, parent, svg, config, state: XY_STATE })) as any;

    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });

    loadXy({
        parent,
        config,
        dataset,
        xyId,
        svg
    });

    configObserver.disconnect();
    datasetObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    parent.dataset.visionSet = DataVisionAttribute.OK;
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
}

export function loadXy({ parent, config, dataset, svg, xyId }: { parent: HTMLDivElement, config: Config, dataset: XyDatasetItem[], svg: SVGElement, xyId: string }) {

    const drawingArea: DrawingArea = getDrawingArea(config);
    const maxSeries = Math.max(...dataset.map((d: any) => d.values.length));
    const slot = drawingArea.width / maxSeries;
    const barSlot = drawingArea.width / maxSeries / dataset.filter((s: any) => s.type === "bar").length;
    const max = Math.max(...dataset.map(d => Math.max(...d.values)));
    const min = Math.min(...dataset.map(d => Math.min(...d.values)));

    const relativeZero = (function IIFE(min) {
        if (min >= 0) return 0;
        return Math.abs(min);
    }(min));

    const absoluteMax = (function IIFE(max, relativeZero) {
        return max + relativeZero
    }(max, relativeZero));


    Object.assign(XY_STATE, {
        [xyId]: {
            parent,
            type: "xy",
            config,
            dataset,
            mutableDataset: dataset,
            drawingArea,
            maxSeries,
            slot,
            barSlot,
            max,
            min,
            absoluteMax,
            relativeZero,
            svg,
            selectedIndex: undefined,
            segregatedDatasets: [],
        },
        openTables: []
    });

    drawXy({
        state: XY_STATE,
        id: xyId
    });
}

export function drawXy({ state, id }: { state: XyState, id: string }) {

    let {
        absoluteMax,
        barSlot,
        config,
        dataset,
        drawingArea,
        max,
        maxSeries,
        min,
        parent,
        relativeZero,
        slot,
        svg,
    } = state[id] as XyStateObject;

    svg.innerHTML = "";

    const mutedDataset = dataset
        .filter((d: any) => !state[id].segregatedDatasets.includes(d.datasetId));

    maxSeries = Math.max(...mutedDataset.map((d => d.values.length)));
    slot = drawingArea.width / maxSeries;
    barSlot = drawingArea.width / maxSeries / mutedDataset.filter(el => el.type === "bar").length;
    max = Math.max(...mutedDataset.map(d => Math.max(...d.values)));
    min = Math.min(...mutedDataset.map(d => Math.min(...d.values)));

    relativeZero = (function IIFE(min) {
        if (min >= 0) return 0;
        return Math.abs(min);
    }(min));

    absoluteMax = (function IIFE(max, relativeZero) {
        return max + relativeZero
    }(max, relativeZero));


    function ratioToMax(val: number) {
        return (val + relativeZero) / absoluteMax;
    }

    makeXyGrid({ id, state, relativeZero, absoluteMax, max, min, maxSeries, slot });

    mutedDataset
        .filter(d => d.type === "bar")
        .map((d, k: number) => {
            return {
                ...d,
                plots: d.values.map((v, i: number) => {
                    return {
                        x: (drawingArea.left + (slot / 2)) + (slot * i),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(v)),
                        value: v,
                    }
                }),
                bars: d.values.map((v, i: number) => {
                    return {
                        x: (drawingArea.left + barSlot * k) + (barSlot * i * mutedDataset.filter(md => md.type === 'bar').length) + ((barSlot / 2) * 0.1),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(v)),
                        value: v
                    }
                })
            }
        })
        .map(d => {
            return {
                ...d,
                linearProgression: calcLinearProgression(d.plots)
            }
        })
        .forEach((serie, index: number) => drawSerie({
            svg,
            id,
            datasetId: serie.datasetId,
            serie,
            config,
            palette,
            index,
            zero: drawingArea.bottom - (drawingArea.height * ratioToMax(0)),
            barSlot
        }));

    mutedDataset
        .filter(d => ["line", "plot"].includes(d.type))
        .map(d => {
            return {
                ...d,
                plots: d.values.map((v, i: number) => {
                    return {
                        x: (drawingArea.left + (slot / 2)) + (slot * i),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(v)),
                        value: v,
                    }
                })
            }
        })
        .map(d => {
            return {
                ...d,
                linearProgression: calcLinearProgression(d.plots)
            }
        })
        .forEach((serie, index: number) => drawSerie({
            svg,
            id,
            datasetId: serie.datasetId,
            serie,
            config,
            palette,
            index,
            zero: drawingArea.bottom - (drawingArea.height * ratioToMax(0)),
            barSlot
        }));

    createTooltipXy({ id, state: XY_STATE, parent });
    createTrapsXy({ id, state: XY_STATE, maxSeries });
    createTitle({ id, state: XY_STATE });
    createLegendXy({ id, state: XY_STATE });

    if (config.toolkit.show) {
        createToolkit({
            id,
            config,
            dataset: mutedDataset,
            parent
        });
    }
}

export function handleConfigChange({ mutations, configObserver, dataset, id, state, parent, svg }: { mutations: MutationRecord[], dataset: any, configObserver: MutationObserver, id: string, state: XyState, parent: HTMLDivElement, svg: SVGElement }) {
    for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === DataVisionAttribute.CONFIG) {
            const newJSONValue = (mutation.target as HTMLElement).getAttribute(DataVisionAttribute.CONFIG);
            if (newJSONValue === DataVisionAttribute.OK || newJSONValue === null) return;
            try {
                const newConfig = JSON.parse(newJSONValue);
                state[id].config = createConfig({
                    userConfig: newConfig,
                    defaultConfig: configLine
                });
                svg.remove();
                parent.innerHTML = "";
                svg = createSvg({
                    parent,
                    dimensions: { x: newConfig.width, y: newConfig.height },
                    config: convertConfigColors(state[id].config),
                });
                loadXy({
                    parent,
                    config: convertConfigColors(state[id].config),
                    dataset,
                    xyId: id,
                    svg
                });
                configObserver.disconnect();
                parent.dataset.visionConfig = DataVisionAttribute.OK;
                configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
            } catch (error) {
                console.error('Data Vision exception. Invalid JSON format:', error);
            }
        }
    }
}

export function handleDatasetChange({ mutations, datasetObserver, config, id, state, parent, svg }: { mutations: MutationRecord[], config: Config, datasetObserver: MutationObserver, id: string, state: XyState, parent: HTMLDivElement, svg: SVGElement }) {
    for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === DataVisionAttribute.DATASET) {
            const newJSONValue = (mutation.target as HTMLElement).getAttribute(DataVisionAttribute.DATASET);
            if (newJSONValue === DataVisionAttribute.OK || newJSONValue === null) return;
            try {
                const newDataset = JSON.parse(newJSONValue);
                state[id].dataset = parseUserDataset(newDataset);
                svg.remove();
                parent.innerHTML = "";
                svg = createSvg({
                    parent,
                    dimensions: { x: config.width, y: config.height },
                    config,
                });
                loadXy({
                    parent,
                    config,
                    dataset: parseUserDataset(newDataset),
                    xyId: id,
                    svg
                });
                datasetObserver.disconnect();
                parent.dataset.visionConfig = DataVisionAttribute.OK;
                datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
            } catch (error) {
                console.error('Data Vision exception. Invalid JSON format:', error);
            }
        }
    }
}

export function createYLabels({ svg, config, drawingArea, absoluteMax, max, min, zero }: { svg: SVGElement, config: Config, drawingArea: DrawingArea, absoluteMax: number, max: number, min: number, zero: Line }) {

    const positiveStep = closestDecimal(max / 5);
    const positiveSteps = [];
    for (let i = 5; i > 0; i -= 1) {
        const value = positiveStep * i;
        positiveSteps.push({
            y: zero.y1 - (drawingArea.height * ((positiveStep * i) / absoluteMax)),
            value
        });
    }
    const negativeStep = closestDecimal(min / 5);
    const negativeSteps = [];
    for (let i = 5; i >= 0; i -= 1) {
        const value = Math.abs(negativeStep) * i;
        negativeSteps.push({
            y: zero.y1 + (drawingArea.height * ((Math.abs(negativeStep) * i) / absoluteMax)),
            value: -value
        });
    }
    [...positiveSteps, ...negativeSteps].forEach((step: { y: number, value: number }) => {
        const yLabel = spawnNS(SvgElement.TEXT);
        addTo(yLabel, SvgAttribute.FILL, config.grid.yLabels.color);
        addTo(yLabel, SvgAttribute.FONT_SIZE, config.grid.yLabels.fontSize);
        addTo(yLabel, SvgAttribute.FONT_WEIGHT, config.grid.yLabels.bold ? "bold" : "normal");
        addTo(yLabel, SvgAttribute.X, drawingArea.left - 12 + config.grid.yLabels.offsetX);
        addTo(yLabel, SvgAttribute.Y, step.y + config.grid.yLabels.fontSize / 3);
        addTo(yLabel, SvgAttribute.TEXT_ANCHOR, "end");
        yLabel.textContent = Number(step.value.toFixed(config.grid.yLabels.rounding)).toLocaleString();

        const yTick = spawnNS(SvgElement.LINE);
        addTo(yTick, SvgAttribute.STROKE, config.grid.stroke);
        addTo(yTick, SvgAttribute.STROKE_WIDTH, 1);
        addTo(yTick, SvgAttribute.X1, drawingArea.left);
        addTo(yTick, SvgAttribute.X2, drawingArea.left - 6);
        addTo(yTick, SvgAttribute.Y1, step.y);
        addTo(yTick, SvgAttribute.Y2, step.y);
        if ((step.value > max || step.value < min) && step.value !== 0) return;
        [yLabel, yTick].forEach(el => svg.appendChild(el));
    });
}

function createXLabels({ config, drawingArea, svg, maxSeries, slot }: { config: Config, drawingArea: DrawingArea, svg: SVGElement, maxSeries: number, slot: number }) {
    for (let i = 0; i < maxSeries; i += 1) {
        const xLabel = spawnNS(SvgElement.TEXT);
        addTo(xLabel, SvgAttribute.X, drawingArea.left + (slot * i) + (slot / 2));
        addTo(xLabel, SvgAttribute.Y, drawingArea.bottom + 12 + config.grid.xLabels.fontSize + config.grid.xLabels.offsetY);
        addTo(xLabel, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(xLabel, SvgAttribute.FONT_SIZE, config.grid.xLabels.fontSize);
        addTo(xLabel, SvgAttribute.FILL, config.grid.xLabels.color);
        addTo(xLabel, SvgAttribute.FONT_WEIGHT, config.grid.xLabels.bold ? 'bold' : 'normal');
        xLabel.textContent = config.grid.xLabels.values[i];
        if (!config.grid.xLabels.showOnlyFirstAndLast || (config.grid.xLabels.showOnlyFirstAndLast && (i === 0 || i === maxSeries - 1))) {
            svg.appendChild(xLabel);
        }
    }
}

export function createVerticalSeparator({ config, drawingArea, svg, maxSeries, slot }: { config: Config, drawingArea: DrawingArea, svg: SVGElement, maxSeries: number, slot: number }) {
    for (let i = 1; i < maxSeries + 1; i += 1) {
        const separator = spawnNS(SvgElement.LINE);
        addTo(separator, SvgAttribute.X1, drawingArea.left + (slot * i));
        addTo(separator, SvgAttribute.X2, drawingArea.left + (slot * i));
        addTo(separator, SvgAttribute.Y1, drawingArea.top);
        addTo(separator, SvgAttribute.Y2, drawingArea.bottom);
        addTo(separator, SvgAttribute.STROKE, config.grid.verticalSeparators.stroke);
        addTo(separator, SvgAttribute.STROKE_WIDTH, config.grid.verticalSeparators.strokeWidth);
        svg.appendChild(separator);
    }
}

export function makeXyGrid({ id, state, relativeZero, absoluteMax, max, min, maxSeries, slot }: { id: string, state: XyState, relativeZero: number, absoluteMax: number, max: number, min: number, maxSeries: number, slot: number }) {
    const drawingArea = state[id].drawingArea;
    const config = state[id].config;
    const svg = state[id].svg;

    const zero: Line = {
        x1: drawingArea.left,
        x2: drawingArea.right,
        y1: drawingArea.bottom - (drawingArea.height * (relativeZero / absoluteMax)),
        y2: drawingArea.bottom - (drawingArea.height * (relativeZero / absoluteMax)),
    };


    const y = spawnNS(SvgElement.LINE);
    addTo(y, SvgAttribute.X1, drawingArea.left);
    addTo(y, SvgAttribute.X2, drawingArea.left);
    addTo(y, SvgAttribute.Y1, drawingArea.top);
    addTo(y, SvgAttribute.Y2, drawingArea.bottom);
    addTo(y, SvgAttribute.STROKE, config.grid.stroke);
    addTo(y, SvgAttribute.STROKE_WIDTH, config.grid.strokeWidth);
    addTo(y, SvgAttribute.STROKE_LINECAP, "round");

    const zeroLine = spawnNS(SvgElement.LINE);
    addTo(zeroLine, SvgAttribute.X1, zero.x1);
    addTo(zeroLine, SvgAttribute.X2, zero.x2);
    addTo(zeroLine, SvgAttribute.Y1, zero.y1);
    addTo(zeroLine, SvgAttribute.Y2, zero.y2);
    addTo(zeroLine, SvgAttribute.STROKE, config.grid.stroke);
    addTo(zeroLine, SvgAttribute.STROKE_WIDTH, config.grid.strokeWidth);
    addTo(zeroLine, SvgAttribute.STROKE_LINECAP, "round");

    if (config.grid.show) {
        [zeroLine, y].forEach(line => svg.appendChild(line));
    }

    if (config.grid.yLabels.show && state[id].segregatedDatasets.length < state[id].dataset.length) {
        createYLabels({
            absoluteMax,
            config,
            drawingArea,
            max,
            min,
            svg,
            zero
        });
    }

    if (config.grid.xLabels.show && config.grid.xLabels.values.length) {
        createXLabels({
            config,
            drawingArea,
            maxSeries,
            slot,
            svg,
        });
    }

    if (config.grid.verticalSeparators.show) {
        createVerticalSeparator({
            config,
            drawingArea,
            maxSeries,
            slot,
            svg
        });
    }
}

export function createTrapsXy({ id, state, maxSeries }: { id: string, state: XyState, maxSeries: number }) {

    const svg = state[id].svg as SVGElement;
    const series = (state[id].dataset as XyDatasetItem[]).map(d => d.datapoints) as XyDatasetItem[];
    const config = state[id].config as Config;
    const drawingArea = state[id].drawingArea as DrawingArea;

    function select(rect: HTMLElement | SVGElement, i: number) {
        addTo(rect, SvgAttribute.FILL, `${config.indicator.color}${opacity[config.indicator.opacity]}`);
        state[id].selectedIndex = i;
        state.isTooltip = true;
        series.forEach(s => {
            if (s[state[id].selectedIndex]) {
                addTo(s[state[id].selectedIndex], SvgAttribute.R, config.line.plots.radius * 1.6);
            }
        })
    }
    function unselect(rect: SVGElement | HTMLElement) {
        addTo(rect, SvgAttribute.FILL, "transparent");
        state.isTooltip = false;
        series.forEach(s => {
            if (s[state[id].selectedIndex]) {
                addTo(s[state[id].selectedIndex], SvgAttribute.R, config.line.plots.radius);
            }
        })
        state[id].selectedIndex = 0;
    }

    const traps: SVGElement[] = [];
    for (let i = 0; i < maxSeries; i += 1) {
        const t = spawnNS(SvgElement.RECT);
        addTo(t, SvgAttribute.X, drawingArea.left + (i * (drawingArea.width / maxSeries)));
        addTo(t, SvgAttribute.Y, drawingArea.top);
        addTo(t, SvgAttribute.HEIGHT, drawingArea.height);
        addTo(t, SvgAttribute.WIDTH, drawingArea.width / maxSeries);
        addTo(t, SvgAttribute.FILL, "transparent");
        traps.push(t);
    }
    Array.from(traps).forEach((trap, i: number) => {
        trap.addEventListener(EventTrigger.MOUSEOVER, () => select(trap, i));
        trap.addEventListener(EventTrigger.MOUSEOUT, () => unselect(trap))
        svg.appendChild(trap);
    });
}

export function calcRectHeight({ plot, zero }: { plot: { x: number, y: number, value: number }, zero: number }) {
    if (plot.value >= 0) {
        return zero - plot.y;
    } else {
        return plot.y - zero;
    }
}

export function calcRectY({ plot, zero }: { plot: { x: number, y: number, value: number }, zero: number }) {
    if (plot.value >= 0) return plot.y;
    return zero;
}

export function drawSerie({ datasetId, id, svg, serie, config, palette, index, zero, barSlot }: { datasetId: string, id: string, svg: SVGElement, serie: XyDatasetItem, config: Config, palette: string[], index: number, zero: number, barSlot: number }) {
    const color = convertColorToHex(serie.color) || palette[index] || palette[index % palette.length];
    let gradientId = "";
    let arrowId = "";
    let rectGradientPositiveId = "";
    let rectGradientNegativeId = "";

    const thisDataset = (XY_STATE[id].dataset as XyDatasetItem[]).find(d => d.datasetId === datasetId) as unknown as XyDatasetItem;

    const defs = spawnNS("defs") as SVGDefsElement;

    if (config.line.area.useGradient) {
        const direction = "x";
        const start = `${shiftHue(color, 0.05)}${opacity[config.line.area.opacity]}`;
        const end = `${color}${opacity[config.line.area.opacity]}`;
        gradientId = createLinearGradient({
            defs,
            direction,
            start,
            end
        });
    }

    if (config.bars.useGradient) {
        rectGradientPositiveId = createBarGradientPositive({
            defs,
            color
        });
        rectGradientNegativeId = createBarGradientNegative({
            defs,
            color
        });
    }

    if (serie.showProgression && serie.values.length > 1) {
        arrowId = createArrow({
            color,
            defs,
            id: datasetId
        });

    }

    svg.appendChild(defs);

    // CLEAR STATE
    thisDataset.lines = [] as SVGElement[];
    thisDataset.areas = [] as SVGElement[];
    thisDataset.datapoints = [] as SVGElement[];
    thisDataset.dataLabels = [] as SVGElement[];
    thisDataset.linearProgressions = [] as LinearProgression[];

    if (serie.type === Chart.LINE) {
        if (thisDataset.showArea) {
            const start = { x: serie.plots[0].x, y: zero };
            const end = { x: serie.plots.at(-1)?.x, y: zero };
            const path: any = [];
            serie.plots.forEach(plot => {
                path.push(`${plot.x},${plot.y} `)
            });
            const areaPath = [start.x, start.y, ...path, end.x, end.y].toString();
            const area = spawnNS(SvgElement.PATH);
            addTo(area, SvgAttribute.D, `M${areaPath}Z`);
            addTo(area, SvgAttribute.FILL, config.line.area.useGradient ? gradientId : `${color}${opacity[config.line.area.opacity]}`);
            addTo(area, SvgAttribute.STROKE, "none");
            thisDataset.areas.push(area);
            svg.appendChild(area);
        }
    }

    if (serie.type === Chart.LINE) {
        serie.plots.forEach((plot: any, i: number) => {
            if (i < serie.plots.length - 1 && isValidUserValue(plot.value) && isValidUserValue(serie.plots[i + 1].value)) {
                const l = spawnNS(SvgElement.LINE);
                addTo(l, SvgAttribute.X1, plot.x);
                addTo(l, SvgAttribute.X2, serie.plots[i + 1].x);
                addTo(l, SvgAttribute.Y1, plot.y);
                addTo(l, SvgAttribute.Y2, serie.plots[i + 1].y);
                addTo(l, SvgAttribute.STROKE, color);
                addTo(l, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth);
                addTo(l, SvgAttribute.STROKE_LINECAP, "round");
                addTo(l, SvgAttribute.STROKE_LINEJOIN, "round");
                thisDataset.lines.push(l);
                svg.appendChild(l);
            }
        });
    }

    if (serie.type === Chart.BAR) {
        serie.bars.forEach(bar => {
            const b = spawnNS(SvgElement.RECT);
            addTo(b, SvgAttribute.X, bar.x);
            if (config.bars.borderRadius) {
                addTo(b, SvgAttribute.RX, config.bars.borderRadius);
            }
            addTo(b, SvgAttribute.Y, calcRectY({ plot: bar, zero }));
            addTo(b, SvgAttribute.HEIGHT, calcRectHeight({ plot: bar, zero }));
            addTo(b, SvgAttribute.WIDTH, barSlot * 0.9);
            addTo(b, SvgAttribute.FILL, config.bars.useGradient ? bar.value > 0 ? rectGradientPositiveId : rectGradientNegativeId : bar.color ? bar.color : '#CCCCCC');
            thisDataset.datapoints.push(b);
            svg.appendChild(b);
            if (config.bars.dataLabels.show && (Object.hasOwn(serie, 'showLabels') ? serie.showLabels : true)) {
                const t = spawnNS(SvgElement.TEXT);
                addTo(t, SvgAttribute.TEXT_ANCHOR, "middle");
                addTo(t, SvgAttribute.X, bar.x + barSlot / 2);
                addTo(t, SvgAttribute.Y, bar.y + (bar.value > 0 ? -config.bars.dataLabels.fontSize / 2 + config.bars.dataLabels.positive.offsetY : config.bars.dataLabels.fontSize + config.bars.dataLabels.negative.offsetY));
                addTo(t, SvgAttribute.FONT_SIZE, config.line.dataLabels.fontSize);
                addTo(t, SvgAttribute.FILL, config.line.dataLabels.color);
                t.innerHTML = Number(bar.value.toFixed(config.line.dataLabels.roundingValue)).toLocaleString();
                thisDataset.dataLabels.push(t);
                svg.appendChild(t);
            }
        });
    }

    if ([Chart.LINE, Chart.PLOT].includes(serie.type)) {
        serie.plots.forEach(plot => {
            // plots
            if (config.line.plots.show && isValidUserValue(plot.value)) {
                const c = spawnNS(SvgElement.CIRCLE);
                addTo(c, SvgAttribute.CX, plot.x);
                addTo(c, SvgAttribute.CY, plot.y);
                addTo(c, SvgAttribute.R, config.line.plots.radius);
                addTo(c, SvgAttribute.FILL, color);
                addTo(c, SvgAttribute.STROKE, config.line.plots.stroke);
                addTo(c, SvgAttribute.STROKE_WIDTH, config.line.plots.strokeWidth);
                thisDataset.datapoints.push(c)
                svg.appendChild(c);
            }
            // data labels
            if (config.line.dataLabels.show && (Object.hasOwn(serie, 'showLabels') ? serie.showLabels : true)) {
                const t = spawnNS(SvgElement.TEXT);
                addTo(t, SvgAttribute.TEXT_ANCHOR, "middle");
                addTo(t, SvgAttribute.X, plot.x);
                addTo(t, SvgAttribute.Y, plot.y - config.line.dataLabels.fontSize + config.line.dataLabels.offsetY);
                addTo(t, SvgAttribute.FONT_SIZE, config.line.dataLabels.fontSize);
                addTo(t, SvgAttribute.FILL, config.line.dataLabels.color);
                t.innerHTML = Number(plot.value.toFixed(config.line.dataLabels.roundingValue)).toLocaleString();
                thisDataset.dataLabels.push(t);
                svg.appendChild(t);
            }
        });
    }

    if (serie.showProgression && serie.values.length > 1) {
        const progressLine = spawnNS(SvgElement.LINE);
        addTo(progressLine, SvgAttribute.X1, serie.linearProgression.x1);
        addTo(progressLine, SvgAttribute.X2, serie.linearProgression.x2);
        addTo(progressLine, SvgAttribute.Y1, serie.linearProgression.y1);
        addTo(progressLine, SvgAttribute.Y2, serie.linearProgression.y2);
        addTo(progressLine, SvgAttribute.STROKE, serie.color);
        addTo(progressLine, SvgAttribute.STROKE_WIDTH, config.linearProgression.strokeWidth);
        addTo(progressLine, SvgAttribute.STROKE_DASHARRAY, config.linearProgression.strokeWidth * 2)
        addTo(progressLine, SvgAttribute.MARKER_END, `url(#${arrowId})`)

        const progressLabel = spawnNS(SvgElement.TEXT);
        addTo(progressLabel, SvgAttribute.FILL, color);
        addTo(progressLabel, SvgAttribute.FONT_SIZE, config.linearProgression.label.fontSize);
        addTo(progressLabel, SvgAttribute.X, serie.linearProgression.x2 + config.linearProgression.label.offsetX);
        addTo(progressLabel, SvgAttribute.Y, serie.linearProgression.y2 - 6 + config.linearProgression.label.offsetY);
        addTo(progressLabel, SvgAttribute.TEXT_ANCHOR, "middle");
        progressLabel.innerHTML = `${Number(((serie.linearProgression.trend)).toFixed(config.linearProgression.label.rounding)).toLocaleString()}%`;
        [progressLine, progressLabel].forEach((el: any) => svg.appendChild(el))
    }
    return svg;
}

const xy = {
    prepareXy,
    drawXy
}

export default xy;
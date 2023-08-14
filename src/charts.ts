import {
    createSvg,
    createConfig,
    parseUserConfig,
    parseUserDataset,
    clearDataAttributes,
    getDrawingArea,
    createUid,
    calcLinearProgression,
} from "./functions";

import {
    makeXyGrid,
    drawSerie,
    createTraps
} from "./util_xy"

import {
    palette,
    configLine
} from "./config"

import XY_STATE from "./state_xy";
import { createTooltip } from "./tooltip";
import { createTitle } from "./title";
import { createLegend } from "./legend";

function nuke(attr = "") {
    const all = document.getElementsByClassName("data-vision") as any;

    if (!attr) {
        Array.from(all).forEach(t => (t as HTMLElement).innerHTML = "");
    } else {
        const targets = Array.from(all).filter((node: any) => {
            return node.hasAttribute(attr)
        });
        targets.forEach(t => (t as HTMLElement).innerHTML = "");
    }

}

export function createCharts(attr = "") {
    const targets = document.getElementsByClassName("data-vision") as any

    if (targets.length) {

        if (!attr || attr === "data-vision-xy") {
            const type_xy = Array.from(targets).filter((node: any) => {
                return node.hasAttribute("data-vision-xy")
            });
            nuke("data-vision-xy");
            type_xy.forEach(line => xy(line as unknown as HTMLDivElement));
        }
    }
}

function xy(parent: HTMLDivElement) {
    parent.style.width = `${parent.getAttribute("width")}`;
    const xyId = createUid();

    const userConfig = parseUserConfig(parent.dataset.visionConfig);
    const dataset = parseUserDataset(parent.dataset.visionSet)

    const config = createConfig({
        userConfig,
        defaultConfig: configLine
    });

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config
    })

    const drawingArea = getDrawingArea(config);
    const maxSeries = Math.max(...dataset.map((d: any) => d.values.length));
    const slot = drawingArea.width / maxSeries;
    const barSlot = drawingArea.width / maxSeries / dataset.filter((s: any) => s.type === "bar").length;
    const max = Math.max(...dataset.map((d: any) => Math.max(...d.values)));
    const min = Math.min(...dataset.map((d: any) => Math.min(...d.values)));

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
            segregatedDatasets: []
        }
    });

    drawChart({
        state: XY_STATE,
        id: xyId
    });
}

export function drawChart({ state, id }: { state: any, id: string }) {

    let { parent, svg, dataset, max, min, maxSeries, drawingArea, slot, barSlot, config, relativeZero, absoluteMax } = state[id];

    svg.innerHTML = "";

    const mutedDataset = dataset
        .filter((d: any) => !state[id].segregatedDatasets.includes(d.datasetId));

    maxSeries = Math.max(...mutedDataset.map((d: any) => d.values.length));
    slot = drawingArea.width / maxSeries;
    barSlot = drawingArea.width / maxSeries / mutedDataset.filter((el: any) => el.type === "bar").length;
    max = Math.max(...mutedDataset.map((d: any) => Math.max(...d.values)));
    min = Math.min(...mutedDataset.map((d: any) => Math.min(...d.values)));

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
        .filter((d: any) => d.type === "bar")
        .map((d: any, k: number) => {
            return {
                ...d,
                plots: d.values.map((v: number, i: number) => {
                    return {
                        x: (drawingArea.left + (slot / 2)) + (slot * i),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(v)),
                        value: v,
                    }
                }),
                bars: d.values.map((v: number, i: number) => {
                    return {
                        x: (drawingArea.left + barSlot * k) + (barSlot * i * mutedDataset.filter((md: any) => md.type === 'bar').length) + ((barSlot / 2) * 0.1),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(v)),
                        value: v
                    }
                })
            }
        })
        .map((d: any) => {
            return {
                ...d,
                linearProgression: calcLinearProgression(d.plots)
            }
        })
        .forEach((serie: any, index: number) => drawSerie({
            svg,
            id,
            datasetId: serie.datasetId,
            serie,
            config,
            palette,
            index,
            drawingArea,
            zero: drawingArea.bottom - (drawingArea.height * ratioToMax(0)),
            barSlot
        }));

    mutedDataset
        .filter((d: any) => d.type === "line")
        .map((d: any) => {
            return {
                ...d,
                plots: d.values.map((v: number, i: number) => {
                    return {
                        x: (drawingArea.left + (slot / 2)) + (slot * i),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(v)),
                        value: v,
                    }
                })
            }
        })
        .map((d: any) => {
            return {
                ...d,
                linearProgression: calcLinearProgression(d.plots)
            }
        })
        .forEach((serie: any, index: number) => drawSerie({
            svg,
            id,
            datasetId: serie.datasetId,
            serie,
            config,
            palette,
            index,
            drawingArea,
            zero: drawingArea.bottom - (drawingArea.height * ratioToMax(0)),
            barSlot
        }));

    createTooltip({ id, state: XY_STATE });
    createTraps({ id, state: XY_STATE, maxSeries });
    createTitle({ id, state: XY_STATE });
    createLegend({ id, state: XY_STATE });
    //createTable({ id: xyId, state: XY_STATE});

    clearDataAttributes(parent);
    console.log(state);
}

const charts = {
    createCharts,
    drawChart
}

export default charts;

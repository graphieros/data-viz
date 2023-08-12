import {
    createSvg,
    createConfig,
    parseUserConfig,
    parseUserDataset,
    clearDataAttributes,
    getDrawingArea,
    createUid,
} from "./functions";

import {
    makeXyGrid,
    drawLine,
    createTraps,
    createTooltip
} from "./util-line"

import {
    palette,
    configLine
} from "./config"
import { Chart } from "./constants";
import XY_STATE from "./state_xy";

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
            const lines = Array.from(targets).filter((node: any) => {
                return node.hasAttribute("data-vision-xy")
            });
            nuke("data-vision-xy");
            lines.forEach(line => xy(line as unknown as HTMLDivElement))
            // lines.forEach(line => createXyChart(line as unknown as HTMLDivElement))
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

    const drawingArea = getDrawingArea(config);
    const maxSeries = Math.max(...dataset.map((d: any) => d.values.length));
    const slot = drawingArea.width / maxSeries;
    const max = Math.max(...dataset.map((d: any) => Math.max(...d.values)));
    const min = Math.min(...dataset.map((d: any) => Math.min(...d.values)));

    const relativeZero = (function IIFE(min) {
        if (min >= 0) return 0;
        return Math.abs(min);
    }(min));

    const absoluteMax = (function IIFE(max, relativeZero) {
        return max + relativeZero
    }(max, relativeZero));

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config
    })

    Object.assign(XY_STATE, {
        [xyId]: {
            type: "xy",
            config,
            dataset,
            drawingArea,
            maxSeries,
            slot,
            max,
            min,
            absoluteMax,
            svg,
            selectedIndex: undefined,
        }
    });

    function ratioToMax(val: number) {
        return (val + relativeZero) / absoluteMax;
    }

    XY_STATE[xyId].dataset
        .filter((d: any) => d.type === Chart.LINE)
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
        .forEach((line: any, index: number) => drawLine({
            svg: XY_STATE[xyId].svg,
            line,
            config,
            palette,
            index,
            drawingArea
        }));

    createTraps({
        id: xyId,
        config,
        drawingArea,
        maxSeries
    });

    createTooltip({
        id: xyId,
        config
    });

    clearDataAttributes(parent);
}

const charts = {
    createCharts
}

export default charts;

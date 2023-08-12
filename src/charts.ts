import {
    createSvg,
    createConfig,
    parseUserConfig,
    parseUserDataset,
    clearDataAttributes,
    getDrawingArea
} from "./functions";

import {
    makeXyGrid,
    drawLine,
    createTraps
} from "./util-line"

import {
    palette,
    configLine
} from "./config"
import { Chart } from "./constants";
import STATE from "./state";

function nuke(attr = "") {
    const all = document.getElementsByClassName("data-viz") as any;

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
    const targets = document.getElementsByClassName("data-viz") as any

    if (targets.length) {

        if (!attr || attr === "data-viz-xy") {
            const lines = Array.from(targets).filter((node: any) => {
                return node.hasAttribute("data-viz-xy")
            });
            nuke("data-viz-xy");
            lines.forEach(line => createXyChart(line as unknown as HTMLDivElement))
        }
    }
}

function createXyChart(node: HTMLDivElement) {
    node.style.width = `${node.getAttribute("width")}`;
    const userConfig = parseUserConfig(node.dataset.vizConfig);

    const config = createConfig({
        userConfig,
        defaultConfig: configLine
    });
    const dataset = parseUserDataset(node.dataset.vizSet);

    clearDataAttributes(node);

    let svg = createSvg({
        parent: node,
        dimensions: { x: config.width, y: config.height },
        config
    });

    const id = svg.id;

    STATE.charts[id] = {
        dataset,
        selectedSerie: undefined,
    };
    console.log(STATE)

    const drawingArea = getDrawingArea(config);

    svg = makeXyGrid({
        chart: svg,
        drawingArea,
        config
    });

    const maxSeries = Math.max(...dataset.map((d: any) => d.values.length));
    const slot = drawingArea.width / maxSeries;

    const max = Math.max(...dataset.map((d: any) => Math.max(...d.values)));
    const min = Math.min(...dataset.map((d: any) => Math.min(...d.values)));

    const relativeZero = (function IIFE(min) {
        if (min >= 0) return 0;
        return Math.abs(min);
    }(min))

    const absoluteMax = (function IIFE(max, relativeZero) {
        return max + relativeZero
    }(max, relativeZero))

    function ratioToMax(val: number) {
        return (val + relativeZero) / absoluteMax;
    }

    const lines = dataset
        .filter((d: any) => d.type === Chart.LINE)
        .map((d: any) => {
            return {
                ...d,
                plots: d.values.map((p: any, j: number) => {
                    return {
                        x: (drawingArea.left + (slot / 2)) + (slot * j),
                        y: drawingArea.bottom - (drawingArea.height * ratioToMax(p)),
                        value: p,
                    }
                })

            }
        });

    svg = lines.forEach((line: any, index: number) => drawLine({
        svg,
        line,
        config,
        palette,
        index,
        drawingArea
    }));

    svg = createTraps({
        id,
        config,
        drawingArea,
        maxSeries
    });

}

const charts = {
    createCharts
}

export default charts;

import { Config, Datapoint, DrawingArea, Plot, WaffleDatasetItem, WaffleState, WaffleStateObject } from "../types";
import { configWaffle, opacity } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, createConfig, createSvg, createUid, getDrawingArea, handleConfigOrDatasetChange, parseUserConfig, parseUserDataset, shiftHue, spawnNS } from "./functions";
import { createLegendWaffle } from "./legend";
import { WAFFLE_STATE } from "./state_xy";
import { createTitle } from "./title";
import { createToolkitWaffle } from "./toolkit";
import { createTooltipWaffle } from "./tooltip";

export function prepareWaffle(parent: HTMLDivElement) {

    parent.style.width = `${parent.getAttribute("width")}`;
    const waffleId = createUid();
    addTo(parent, "id", waffleId);
    const userConfig: Config = parseUserConfig(parent.dataset.visionConfig);
    const dataset = parseUserDataset(parent.dataset.visionSet);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configWaffle
    });

    if (!config.useDiv) {
        config.padding.top = 64;
        config.padding.bottom = 64;
        config.padding.right = 64;
        config.padding.left = 64;
    }

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => {
        handleConfigOrDatasetChange({
            mutations,
            observer: configObserver,
            id: waffleId,
            parent,
            config,
            svg,
            dataset,
            state: WAFFLE_STATE,
            idType: "waffleId",
            observedType: "config",
            loader: loadWaffle
        })
    });

    const datasetObserver: MutationObserver = new MutationObserver(mutations => {
        handleConfigOrDatasetChange({
            mutations,
            observer: datasetObserver,
            id: waffleId,
            parent,
            config,
            svg,
            dataset,
            state: WAFFLE_STATE,
            idType: "waffleId",
            observedType: "dataset",
            loader: loadWaffle
        });
    });

    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });

    loadWaffle({
        parent,
        config,
        dataset,
        waffleId,
        svg
    });

    configObserver.disconnect();
    datasetObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    parent.dataset.visionSet = DataVisionAttribute.OK;
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });
}

export function loadWaffle({
    parent,
    config,
    dataset,
    waffleId,
    svg
}: {
    parent: HTMLDivElement,
    config: Config,
    dataset: WaffleDatasetItem[],
    waffleId: string,
    svg: SVGElement
}) {
    const drawingArea: DrawingArea = getDrawingArea(config);
    const total = dataset.map(ds => ds.value).reduce((a, b) => a + b, 0);
    const average = total / dataset.length;

    Object.assign(WAFFLE_STATE, {
        [waffleId]: {
            parent,
            type: "waffle",
            config,
            dataset,
            mutableDataset: dataset,
            drawingArea,
            svg,
            average,
            total,
            selectedIndex: undefined,
            segregatedDatasets: []
        },
        openTables: []
    });

    drawWaffle({
        state: WAFFLE_STATE,
        id: waffleId
    })
}

export function calculateProportions(numbers: Array<number>) {
    const totalSum = numbers.reduce((a, b) => a + b, 0);
    const proportions = numbers.map(num => Math.round((num / totalSum) * 100) / 100);
    const roundedSum = proportions.reduce((a, b) => a + b, 0);

    if (roundedSum !== 1) {
        const lastIndex = proportions.length - 1;
        proportions[lastIndex] += (1 - roundedSum);
        proportions[lastIndex] = Math.round(proportions[lastIndex] * 100) / 100;
    }
    return proportions;
}

export function drawWaffle({ state, id }: { state: WaffleState, id: string }) {
    // CLEAR STATE
    const thisDataset = state[id].dataset;
    thisDataset.datapoints = [];
    thisDataset.dataLabels = [];
    thisDataset.traps = [];

    let {
        parent,
        svg,
        config,
        dataset,
        drawingArea,
        total,
        average
    } = state[id] as WaffleStateObject;

    svg.innerHTML = "";

    const rectDimension = () => {
        return ((drawingArea.width - (config.grid.size * config.grid.spaceBetween)) / config.grid.size);
    }

    const filteredDataset = dataset.filter(d => !state[id].segregatedDatasets.includes(d.datasetId));
    total = filteredDataset.map(d => d.value).reduce((a, b) => a + b, 0);
    average = total / filteredDataset.length;

    const proportions = calculateProportions(filteredDataset.map(ds => ds.value));

    const transitionSet = filteredDataset.map((ds, i) => {
        return {
            ...ds,
            proportion: proportions[i] * Math.pow(config.grid.size, 2)
        }
    }).sort((a, b) => b.value - a.value);

    const mutatedDataset = transitionSet.map((ds, i) => {
        const start = i > 0 ? transitionSet.filter((_, j) => j < i).map(ds => ds.proportion).reduce((a, b) => a + b) + ds.proportion - transitionSet[i - 1].proportion : ds.proportion - ds.proportion;
        const end = start + ds.proportion;
        const rects = [];
        for (let j = start; j <= end; j += 1) {
            rects.push(Math.round(j));
        }
        return {
            ...ds,
            start: i > 0 ? transitionSet.filter((_, j) => j < i).map(ds => ds.proportion).reduce((a, b) => a + b) + ds.proportion - transitionSet[i - 1].proportion : ds.proportion - ds.proportion,
            rects: rects.map((_) => {
                return {
                    ...ds,
                    name: ds.name,
                    color: ds.color,
                    value: ds.value,
                    serieIndex: i,
                }
            })
        }
    });

    const positions = () => {
        const grid = [];
        for (let i = 0; i < config.grid.size; i += 1) {
            for (let j = 0; j < config.grid.size; j += 1) {
                grid.push({
                    x: drawingArea.left + (config.grid.vertical ? i : j) * (rectDimension() + config.grid.spaceBetween) + config.grid.spaceBetween / 2,
                    y: drawingArea.top + (config.grid.vertical ? j : i) * (rectDimension() + config.grid.spaceBetween) + config.grid.spaceBetween / 2
                })
            }
        }
        return grid;
    }
    // defs

    if (config.rects.gradient.show) {
        const defs = spawnNS(SvgElement.DEFS) as SVGDefsElement;
        dataset.forEach(ds => {
            const radialGradient = spawnNS(SvgElement.RADIAL_GRADIENT);
            addTo(radialGradient, "id", `waffle_gradient_${ds.datasetId}`);
            addTo(radialGradient, SvgAttribute.CX, "50%");
            addTo(radialGradient, SvgAttribute.CY, "50%");
            addTo(radialGradient, SvgAttribute.R, "50%");
            addTo(radialGradient, SvgAttribute.FX, "50%");
            addTo(radialGradient, SvgAttribute.FY, "50%");
            const stop0 = spawnNS(SvgElement.STOP);
            addTo(stop0, SvgAttribute.OFFSET, "0%");
            addTo(stop0, SvgAttribute.STOP_COLOR, `${shiftHue(ds.color, 0.05)}${opacity[100 - config.rects.gradient.intensity]}`);
            const stop1 = spawnNS(SvgElement.STOP);
            addTo(stop1, SvgAttribute.OFFSET, "100%");
            addTo(stop1, SvgAttribute.STOP_COLOR, ds.color);
            [stop0, stop1].forEach(stop => radialGradient.appendChild(stop));
            defs.appendChild(radialGradient)
        })
        svg.prepend(defs);
    }

    const rects = mutatedDataset.flatMap(ds => ds.rects);
    positions().forEach((plot: Plot, i) => {
        if (!mutatedDataset.length) return;
        const G = spawnNS(SvgElement.G);
        const underLayer = spawnNS(SvgElement.RECT);
        addTo(underLayer, SvgAttribute.X, plot.x);
        addTo(underLayer, SvgAttribute.Y, plot.y);
        addTo(underLayer, SvgAttribute.HEIGHT, rectDimension());
        addTo(underLayer, SvgAttribute.WIDTH, rectDimension());
        addTo(underLayer, SvgAttribute.RX, config.rects.borderRadius);
        addTo(underLayer, SvgAttribute.FILL, config.rects.gradient.baseColor);

        const rect = spawnNS(SvgElement.RECT);
        addTo(rect, SvgAttribute.X, plot.x);
        addTo(rect, SvgAttribute.Y, plot.y);
        addTo(rect, SvgAttribute.HEIGHT, rectDimension());
        addTo(rect, SvgAttribute.WIDTH, rectDimension());
        addTo(rect, SvgAttribute.FILL, config.rects.gradient.show ? `url(#waffle_gradient_${rects[i].datasetId})` : rects[i].color);
        addTo(rect, SvgAttribute.RX, config.rects.borderRadius)

        const trap = spawnNS(SvgElement.RECT);
        addTo(trap, SvgAttribute.X, plot.x - config.grid.spaceBetween / 2);
        addTo(trap, SvgAttribute.Y, plot.y - config.grid.spaceBetween / 2);
        addTo(trap, SvgAttribute.HEIGHT, rectDimension() + config.grid.spaceBetween);
        addTo(trap, SvgAttribute.WIDTH, rectDimension() + config.grid.spaceBetween);
        addTo(trap, SvgAttribute.FILL, 'transparent');

        trap.addEventListener("mouseover", () => hover(rects[i].datasetId));
        trap.addEventListener("mouseleave", quit);

        [underLayer, rect, trap].forEach(rect => G.appendChild(rect));
        svg.appendChild(G);
        thisDataset.datapoints.push({
            element: G,
            datasetId: rects[i].datasetId
        });
    });

    function hover(datasetId: string) {
        thisDataset.datapoints.filter((datapoint: Datapoint) => datapoint.datasetId !== datasetId).forEach((datapoint: Datapoint) => {
            datapoint.element.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        state[id].selectedIndex = datasetId;
    }

    function quit() {
        thisDataset.datapoints.forEach((datapoint: Datapoint) => {
            datapoint.element.style.filter = "none";
        });
        state[id].selectedIndex = undefined;
    }

    if (config.tooltip.show) {
        createTooltipWaffle({
            id,
            state,
            parent,
            total
        });
    }

    if (config.legend.show) {
        createLegendWaffle({
            id,
            state
        })
    }

    if (config.title.show) {
        createTitle({
            id,
            state
        });
    }

    if (config.toolkit.show) {
        createToolkitWaffle({
            id,
            config,
            dataset: mutatedDataset,
            parent,
            total,
            average
        });
    }
}

const waffle = {
    prepareWaffle
}

export default waffle;
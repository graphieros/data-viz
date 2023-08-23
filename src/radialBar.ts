import { Config, DrawingArea, RadialBarDatasetItem, RadialBarState, RadialBarStateObject } from "../types";
import { configRadialBar } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, createConfig, createSvg, createUid, getDrawingArea, handleConfigOrDatasetChange, parseUserConfig, parseUserDataset, spawnNS } from "./functions";
import { createLegendRadialBar } from "./legend";
import { RADIAL_BAR_STATE } from "./state_xy";
import { createTitle } from "./title";
import { createToolkitRadialbar } from "./toolkit";
import { createTooltipRadialBar } from "./tooltip";

export function prepareRadialBar(parent: HTMLDivElement) {
    parent.style.width = `${parent.getAttribute("width")}`;
    const radialId = createUid();
    addTo(parent, "id", radialId);

    const userConfig = parseUserConfig(parent.dataset.visionConfig);
    const dataset = parseUserDataset(parent.dataset.visionSet);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configRadialBar
    });

    if (!config.useDiv) {
        config.height = config.width;
        config.padding.bottom = 100;
        config.padding.top = 100;
    }

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: configObserver,
        id: radialId,
        parent,
        svg,
        dataset,
        state: RADIAL_BAR_STATE,
        idType: "radialId",
        observedType: "dataset",
        config,
        loader: loadRadialBar
    }));

    const datasetObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: datasetObserver,
        id: radialId,
        parent,
        svg,
        dataset,
        state: RADIAL_BAR_STATE,
        idType: "radialId",
        observedType: "config",
        config,
        loader: loadRadialBar
    }));

    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });

    loadRadialBar({
        parent,
        config,
        dataset,
        radialId,
        svg
    });

    configObserver.disconnect();
    datasetObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    parent.dataset.visionSet = DataVisionAttribute.OK;
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
}

export function loadRadialBar({ parent, config, dataset, radialId, svg }: { parent: HTMLDivElement, config: Config, dataset: RadialBarDatasetItem[], radialId: string, svg: SVGElement }) {
    const drawingArea: DrawingArea = getDrawingArea(config);
    const total = dataset.map(ds => ds.value || 0).reduce((a, b) => a + b, 0);
    const average = total / dataset.length;

    Object.assign(RADIAL_BAR_STATE, {
        [radialId]: {
            parent,
            type: "radial-bar",
            config,
            dataset,
            mutableDataset: dataset,
            drawingArea,
            svg,
            average,
            total,
            selectedIndex: undefined,
            segregatedDatasets: []
        }
    });

    drawRadialBar({
        state: RADIAL_BAR_STATE,
        id: radialId
    })

}

export function drawRadialBar({ state, id }: { state: RadialBarState, id: string }) {
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
        average,
    } = state[id] as RadialBarStateObject;

    svg.innerHTML = "";

    const filteredDataset = dataset.filter(d => !state[id].segregatedDatasets.includes(d.datasetId));

    total = filteredDataset.map(ds => ds.value || 0).reduce((a, b) => a + b, 0);

    average = total / filteredDataset.length;
    const maxRadius = drawingArea.height; // we'll see

    const skin = {
        gutter: drawingArea.height / 2 / filteredDataset.length * config.arcs.gutter.width,
        track: drawingArea.height / 2 / filteredDataset.length * config.arcs.track.width
    };

    const mutatedDataset: Array<RadialBarDatasetItem> = filteredDataset.map((ds, i) => {
        const radius = (((maxRadius - skin.track) / filteredDataset.length) / 2) * (1 + i);

        const labelY = drawingArea.centerY - ((drawingArea.centerY - drawingArea.top - (config.dataLabels.fontSize)) / filteredDataset.length * (i + 1));
        return {
            ...ds,
            toTotal: (ds.value || 0) / (total || 1),
            labelY,
            radius,
            path: makeRadialPath({ radius, percentage: ds.percentage, drawingArea })
        }
    });

    mutatedDataset.forEach(ds => {
        const G = spawnNS(SvgElement.G);

        const gutter = spawnNS(SvgElement.CIRCLE);
        addTo(gutter, SvgAttribute.CX, drawingArea.centerX);
        addTo(gutter, SvgAttribute.CY, drawingArea.centerY);
        addTo(gutter, SvgAttribute.R, ds.radius);
        addTo(gutter, SvgAttribute.STROKE, config.arcs.gutter.color);
        addTo(gutter, SvgAttribute.STROKE_WIDTH, skin.gutter);
        addTo(gutter, SvgAttribute.FILL, "none");
        addTo(gutter, SvgAttribute.STROKE_DASHARRAY, ds.path.underDashArray);
        addTo(gutter, SvgAttribute.STROKE_DASHOFFSET, ds.path.fullOffset);
        addTo(gutter, SvgAttribute.STROKE_LINECAP, "round");
        gutter.style.transform = "rotate(-90deg)";
        gutter.style.transformOrigin = "50%";

        const track = spawnNS(SvgElement.CIRCLE);
        addTo(track, SvgAttribute.CX, drawingArea.centerX);
        addTo(track, SvgAttribute.CY, drawingArea.centerY);
        addTo(track, SvgAttribute.R, ds.radius);
        addTo(track, SvgAttribute.STROKE, ds.color);
        addTo(track, SvgAttribute.STROKE_WIDTH, skin.track);
        addTo(track, SvgAttribute.FILL, "none");
        addTo(track, SvgAttribute.STROKE_DASHARRAY, ds.path.dashArray);
        addTo(track, SvgAttribute.STROKE_DASHOFFSET, ds.path.dashOffset);
        addTo(track, SvgAttribute.STROKE_LINECAP, "round");
        track.style.transform = "rotate(-90deg)";
        track.style.transformOrigin = "50%";

        [gutter, track].forEach(el => G.appendChild(el));

        if (config.dataLabels.show) {
            const label = spawnNS(SvgElement.TEXT);
            addTo(label, SvgAttribute.X, drawingArea.fullWidth / 2 - skin.gutter * 0.8 + config.dataLabels.fontSize + config.dataLabels.offsetX - 12);
            addTo(label, SvgAttribute.Y, ds.labelY);
            addTo(label, SvgAttribute.FONT_SIZE, config.dataLabels.fontSize);
            addTo(label, SvgAttribute.FONT_WEIGHT, config.dataLabels.bold ? 'bold' : 'normal');
            addTo(label, SvgAttribute.TEXT_ANCHOR, "end");
            addTo(label, SvgAttribute.FILL, config.dataLabels.useSerieColor ? ds.color : config.dataLabels.color);
            label.innerHTML = `${ds.name} : ${isNaN(ds.percentage) ? '-' : Number(ds.percentage.toFixed(config.dataLabels.percentage.rounding)).toLocaleString()}%`;
            G.appendChild(label);
        }
        svg.appendChild(G);
        thisDataset.datapoints.push(G);
    });

    // traps
    mutatedDataset.forEach((ds, i) => {
        const trap = spawnNS(SvgElement.PATH);
        const trapPath = `M ${drawingArea.centerX - ds.radius}, ${drawingArea.centerY} a ${ds.radius},${ds.radius} 0 1,0 ${ds.radius * 2}, 0 a ${ds.radius},${ds.radius} 0 1,0 ${-ds.radius * 2},0`;
        addTo(trap, SvgAttribute.D, trapPath);
        addTo(trap, SvgAttribute.STROKE, "transparent");
        addTo(trap, SvgAttribute.STROKE_WIDTH, skin.track);
        addTo(trap, SvgAttribute.STROKE_LINECAP, "round");
        addTo(trap, SvgAttribute.FILL, "none");
        trap.addEventListener("mouseover", () => hover(i));
        trap.addEventListener("mouseout", quit)
        svg.appendChild(trap);
        thisDataset.traps.push({
            element: trap,
            datasetId: ds.datasetId
        });
    });

    function hover(index: number) {
        thisDataset.datapoints.filter((_: any, i: number) => i !== index).forEach((el: any) => {
            el.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        thisDataset.dataLabels.filter((_: any, i: number) => i !== index).forEach((el: any) => {
            el.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        thisDataset.datapoints.filter((_: any, i: number) => i === index).forEach((el: any) => {
            el.style.transform = "scale(1.01, 1.01)";
            el.style.transformOrigin = "center";
        });
    }

    function quit() {
        thisDataset.datapoints.forEach((el: any) => {
            el.style.opacity = "1";
            el.style.filter = "none";
            el.style.transform = "scale(1,1)";
        });
        thisDataset.dataLabels.forEach((el: any) => {
            el.style.opacity = "1";
            el.style.filter = "none";
            el.style.transform = "scale(1,1)"
        });
    }
    // TODO: find a cool way to include a gradient that works with colored background too.

    if (config.tooltip.show) {
        createTooltipRadialBar({
            id,
            state,
            parent,
            total
        })
    }

    if (config.legend.show) {
        createLegendRadialBar({
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
        createToolkitRadialbar({
            id,
            config,
            dataset: mutatedDataset,
            parent,
            total,
            average
        });
    }
}

export function makeRadialPath({
    radius,
    percentage,
    drawingArea
}: {
    radius: number,
    percentage: number,
    drawingArea: DrawingArea
}) {
    const circumference = radius * (1.5 + (percentage / 100 > 1 / 3 ? 0 : 1 - percentage / 100)) * Math.PI;
    const under = radius * 1.5 * Math.PI;
    return {
        underDashArray: `${under} ${under}`,
        underDashOffset: under - percentage / 100 * under,
        dashArray: `${circumference} ${circumference}`,
        dashOffset: circumference - percentage / 100 * circumference,
        fullOffset: 0,
        active: `M${drawingArea.centerX},${drawingArea.centerY} A ${radius},${radius} 0 0 0 ${drawingArea.right},${drawingArea.top}`
    };
}

const radialBar = {
    prepareRadialBar
}

export default radialBar;
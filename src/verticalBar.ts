import { Config, DrawingArea, VerticalDatasetItem, VerticalState, VerticalStateObject } from "../types";
import { configVerticalBar, opacity } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, createConfig, createSvg, createUid, getDrawingArea, handleConfigOrDatasetChange, parseUserConfig, parseUserDataset, shiftHue, spawnNS } from "./functions";
import { createLegendVerticalBar } from "./legend";
import { VERTICAL_STATE } from "./state_xy";
import { createTitle } from "./title";
import { createToolkitVerticalBar } from "./toolkit";
import { createTooltipVerticalBar } from "./tooltip";

export function prepareVerticalBar(parent: HTMLDivElement) {
    parent.style.width = `${parent.getAttribute("width")}`;
    const verticalId = createUid();
    addTo(parent, "id", verticalId);
    const userConfig = parseUserConfig(parent.dataset.visionConfig);
    const dataset = parseUserDataset(parent.dataset.visionSet);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configVerticalBar
    });

    calcDrawingHeight({ config, dataset });

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config,
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: configObserver,
        id: verticalId,
        parent,
        svg,
        dataset,
        state: VERTICAL_STATE,
        idType: "verticalId",
        observedType: "config",
        config,
        loader: loadVerticalBar
    }));

    const datasetObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: datasetObserver,
        id: verticalId,
        parent,
        svg,
        dataset,
        state: VERTICAL_STATE,
        idType: "donutId",
        observedType: "dataset",
        config,
        loader: loadVerticalBar
    }));

    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });

    loadVerticalBar({
        parent,
        config,
        dataset,
        verticalId,
        svg
    });

    configObserver.disconnect();
    datasetObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    parent.dataset.visionSet = DataVisionAttribute.OK;
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
}

export function calcDrawingHeight({ dataset, config }: { dataset: VerticalDatasetItem[], config: Config }) {
    const bars = dataset.flatMap(ds => {
        if (ds.children && ds.children.length > 0) {
            return ds.children.length;
        } else {
            return 1;
        }
    }).reduce((a, b) => a + b, 0);
    config.height = (bars * (config.bars.height + config.bars.gap)) + config.padding.top + config.padding.bottom;
}

export function loadVerticalBar({ parent, config, dataset, verticalId, svg }: { parent: HTMLDivElement, config: Config, dataset: VerticalDatasetItem[], verticalId: string, svg: SVGElement }) {
    const drawingArea: DrawingArea = getDrawingArea(config);
    const total = dataset.map(ds => ds.value).reduce((a, b) => a + b, 0);
    const average = total / dataset.length;

    Object.assign(VERTICAL_STATE, {
        [verticalId]: {
            parent,
            type: "verticalBar",
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

    drawVerticalBar({
        state: VERTICAL_STATE,
        id: verticalId
    });
}

export function drawVerticalBar({ state, id }: { state: VerticalState, id: string }) {
    // CLEAR STATE

    const thisDataset = state[id].dataset;
    thisDataset.datapoints = [];
    thisDataset.dataLabels = [];
    thisDataset.verticalTraps = [];
    thisDataset.verticalLayers = [];

    let {
        parent,
        svg,
        config,
        dataset,
        drawingArea,
        total,
        average
    } = state[id] as VerticalStateObject;



    svg.innerHTML = "";

    const filteredDataset = dataset.filter(d => !state[id].segregatedDatasets.includes(d.datasetId));
    total = filteredDataset.map(d => d.value).reduce((a, b) => a + b, 0);
    average = total / filteredDataset.length;
    const max = Math.max(...filteredDataset.flatMap(ds => {
        if (ds.children && ds.children.length) {
            return Math.max(...ds.children.map(c => c.value))
        } else {
            return ds.value
        }
    }));

    const mutatedDataset = filteredDataset.map(d => {
        if (d.children && d.children.length) {
            return {
                ...d,
                proportion: d.value / total,
                isChild: false,
                children: d.children.map(c => {
                    return {
                        ...c,
                        proportion: c.value / total,
                        proportionToParent: c.value / d.value,
                        datasetId: d.datasetId,
                        color: d.color,
                        isChild: true,
                        parentValue: d.value,
                        parentProportion: d.value / total,
                        parentName: d.name
                    }
                }).sort((a, b) => b.value - a.value)
            }
        } else {
            return {
                ...d,
                proportion: d.value / total,
            }
        }
    }).sort((a, b) => b.value - a.value);

    calcDrawingHeight({ config, dataset: filteredDataset });
    drawingArea = getDrawingArea(config);
    state[id].drawingArea = drawingArea;
    addTo(svg, SvgAttribute.VIEWBOX, `0 0 ${config.width} ${config.height}`);

    function calcBarWidth({ value }: { value: number }) {
        return drawingArea.width * value / max;
    }

    const flattenDataset = mutatedDataset.flatMap((ds: VerticalDatasetItem) => {
        if (ds.children && ds.children.length) {
            return ds.children.map((c, i) => {
                return {
                    ...c,
                    isFirstChild: i === 0
                }
            })
        }
        return ds;
    });

    // grid
    if (config.grid.show) {
        flattenDataset.forEach((ds, i) => {
            if ((!ds.isChild || ds.isFirstChild) && i !== 0) {
                const gridLine = spawnNS(SvgElement.LINE);
                addTo(gridLine, SvgAttribute.X1, 0);
                addTo(gridLine, SvgAttribute.X2, config.grid.stopAtBase ? drawingArea.left : drawingArea.fullWidth);
                addTo(gridLine, SvgAttribute.Y1, drawingArea.top - (config.bars.gap / 2) + ((config.bars.height + config.bars.gap) * i));
                addTo(gridLine, SvgAttribute.Y2, drawingArea.top - (config.bars.gap / 2) + ((config.bars.height + config.bars.gap) * i));
                addTo(gridLine, SvgAttribute.STROKE, config.grid.stroke);
                addTo(gridLine, SvgAttribute.STROKE_WIDTH, config.grid.strokeWidth);
                addTo(gridLine, SvgAttribute.STROKE_LINECAP, "round");
                if (config.grid.dashed) {
                    addTo(gridLine, SvgAttribute.STROKE_DASHARRAY, config.grid.strokeWidth * 2);
                }
                svg.appendChild(gridLine);
            }
        });
    }

    // defs
    if (config.bars.gradient.show) {
        const defs = spawnNS(SvgElement.DEFS);
        flattenDataset.forEach(ds => {
            const linearGradient = spawnNS(SvgElement.LINEAR_GRADIENT);
            addTo(linearGradient, "id", `bar_gradient_${ds.datasetId}`);
            addTo(linearGradient, SvgAttribute.X1, "0%");
            addTo(linearGradient, SvgAttribute.Y1, "0%");
            addTo(linearGradient, SvgAttribute.X2, "100%");
            addTo(linearGradient, SvgAttribute.Y2, "0%");
            const stop1 = spawnNS(SvgElement.STOP);
            addTo(stop1, SvgAttribute.OFFSET, config.bars.gradient.reverse ? "0%" : "100%");
            addTo(stop1, SvgAttribute.STOP_COLOR, `${ds.color}${opacity[config.bars.fillOpacity]}`);

            const stop2 = spawnNS(SvgElement.STOP);
            addTo(stop2, SvgAttribute.OFFSET, config.bars.gradient.reverse ? "100%" : "0%");
            addTo(stop2, SvgAttribute.STOP_COLOR, `${shiftHue(ds.color, 0.03)}${opacity[100 - config.bars.gradient.intensity]}`);
            if (config.bars.gradient.reverse) {
                [stop1, stop2].forEach(el => linearGradient.appendChild(el));
            } else {
                [stop2, stop1].forEach(el => linearGradient.appendChild(el));
            }
            defs.appendChild(linearGradient);
        });
        svg.prepend(defs);
    }

    // base layer
    if (config.bars.gradient.show) {
        flattenDataset.forEach((ds, i) => {
            const rect = spawnNS(SvgElement.RECT);
            addTo(rect, SvgAttribute.X, drawingArea.left);
            addTo(rect, SvgAttribute.Y, drawingArea.top + ((config.bars.height + (i === 0 ? 0 : config.bars.gap)) * i));
            addTo(rect, SvgAttribute.WIDTH, calcBarWidth({ value: ds.value }));
            addTo(rect, SvgAttribute.HEIGHT, config.bars.height);
            addTo(rect, SvgAttribute.RX, config.bars.borderRadius);
            addTo(rect, SvgAttribute.FILL, config.bars.gradient.baseColor)
            svg.appendChild(rect);
            thisDataset.verticalLayers.push({
                element: rect,
                datasetId: ds.datasetId
            });
        });
    }

    // actual bars
    flattenDataset.forEach((ds, i) => {
        const rect = spawnNS(SvgElement.RECT);
        addTo(rect, SvgAttribute.X, drawingArea.left);
        addTo(rect, SvgAttribute.Y, drawingArea.top + ((config.bars.height + (i === 0 ? 0 : config.bars.gap)) * i));
        addTo(rect, SvgAttribute.WIDTH, calcBarWidth({ value: ds.value }));
        addTo(rect, SvgAttribute.HEIGHT, config.bars.height);
        addTo(rect, SvgAttribute.RX, config.bars.borderRadius);
        addTo(rect, SvgAttribute.FILL, config.bars.gradient.show ? `url(#bar_gradient_${ds.datasetId})` : `${ds.color}${opacity[config.bars.fillOpacity]}`)
        addTo(rect, SvgAttribute.STROKE, config.bars.strokeWidth ? ds.color : 'none');
        addTo(rect, SvgAttribute.STROKE_WIDTH, config.bars.strokeWidth);
        svg.appendChild(rect);
        thisDataset.datapoints.push({
            element: rect,
            datasetId: ds.datasetId
        });
    });

    // name labels
    flattenDataset.forEach((ds, i) => {
        if (!ds.children || ds.isChild) {
            const label = spawnNS(SvgElement.TEXT);
            addTo(label, SvgAttribute.TEXT_ANCHOR, "end");
            addTo(label, SvgAttribute.FONT_SIZE, config.dataLabels.names.fontSize);
            addTo(label, SvgAttribute.FONT_WEIGHT, config.dataLabels.names.bold ? 'bold' : 'normal');
            addTo(label, SvgAttribute.X, drawingArea.left - 6);

            if (!ds.children) {
                addTo(label, SvgAttribute.Y, (drawingArea.top + (config.bars.height / 2) + (config.dataLabels.names.fontSize / 3)) + ((config.bars.height + (i === 0 ? 0 : config.bars.gap)) * i));
                addTo(label, SvgAttribute.FILL, config.dataLabels.names.useSerieColor ? ds.color : config.dataLabels.names.color)
                label.innerHTML = ds.name;
            }
            if (ds.isChild) {
                addTo(label, SvgAttribute.Y, (drawingArea.top + (config.bars.height / 2) + (config.dataLabels.names.fontSize * 1.1)) + ((config.bars.height + (i === 0 ? 0 : config.bars.gap)) * i));
                label.innerHTML = ds.name;
                addTo(label, SvgAttribute.FILL, config.dataLabels.names.useSerieColor ? ds.color : config.dataLabels.names.color);

                const parentLabel = spawnNS(SvgElement.TEXT);
                addTo(parentLabel, SvgAttribute.TEXT_ANCHOR, "end");
                addTo(parentLabel, SvgAttribute.FONT_SIZE, config.dataLabels.names.fontSize);
                addTo(parentLabel, SvgAttribute.FONT_WEIGHT, config.dataLabels.names.bold ? 'bold' : 'normal');
                addTo(parentLabel, SvgAttribute.X, drawingArea.left - 6);
                addTo(parentLabel, SvgAttribute.Y, (drawingArea.top + (config.bars.height / 2) - (config.dataLabels.names.fontSize / 4)) + ((config.bars.height + (i === 0 ? 0 : config.bars.gap)) * i));
                addTo(parentLabel, SvgAttribute.FILL, config.dataLabels.names.useSerieColor ? ds.color : config.dataLabels.names.color)
                parentLabel.innerHTML = ds.parentName;
                svg.appendChild(parentLabel);
            }
            svg.appendChild(label);
        }
    });

    // value labels
    flattenDataset.forEach((ds, i) => {
        if (!ds.children || ds.isChild) {
            const label = spawnNS(SvgElement.TEXT);
            addTo(label, SvgAttribute.X, drawingArea.left + calcBarWidth({ value: ds.value }) + config.dataLabels.values.offsetX + 4);
            addTo(label, SvgAttribute.Y, (drawingArea.top + (config.bars.height / 2) + (config.dataLabels.values.fontSize / 3)) + ((config.bars.height + (i === 0 ? 0 : config.bars.gap)) * i));
            addTo(label, SvgAttribute.FILL, config.dataLabels.values.useSerieColor ? ds.color : config.dataLabels.values.color);
            addTo(label, SvgAttribute.FONT_SIZE, config.dataLabels.values.fontSize);
            addTo(label, SvgAttribute.FONT_WEIGHT, config.dataLabels.values.bold ? 'bold' : 'normal');
            label.innerHTML = `${config.dataLabels.values.quantity.show ? Number(ds.value.toFixed(config.dataLabels.values.quantity.rounding)).toLocaleString() : ''} (${config.dataLabels.values.percentage.show ? Number((ds.value / total * 100).toFixed(config.dataLabels.values.percentage.rounding)).toLocaleString() : ''}%)`;
            svg.appendChild(label)
        }
    })

    // traps
    flattenDataset.forEach((el, i) => {
        const trap = spawnNS(SvgElement.RECT);
        addTo(trap, SvgAttribute.X, 0);
        addTo(trap, SvgAttribute.Y, drawingArea.top - (config.bars.gap / 2) + ((config.bars.height + config.bars.gap) * i));
        addTo(trap, SvgAttribute.WIDTH, config.width);
        addTo(trap, SvgAttribute.HEIGHT, config.bars.height + config.bars.gap);
        addTo(trap, SvgAttribute.FILL, "transparent");
        trap.addEventListener("mouseover", () => hover({ element: trap, index: i }));
        trap.addEventListener("mouseout", () => unhover({ element: trap }))
        svg.appendChild(trap);
        thisDataset.verticalTraps.push({
            element: trap,
            data: el
        });
    });

    function hover({ element, index }: { element: SVGElement, index: number }) {
        addTo(element, SvgAttribute.FILL, `${config.indicator.color}${opacity[config.indicator.opacity]}`);
        state[id].selectedIndex = index;
        state.isTooltip = true;
    }

    function unhover({ element }: { element: SVGElement }) {
        addTo(element, SvgAttribute.FILL, "transparent");
        state[id].selectedIndex = undefined;
    }

    if (config.tooltip.show) {
        createTooltipVerticalBar({
            id,
            state,
            parent
        })
    }

    if (config.legend.show) {
        createLegendVerticalBar({
            id,
            state
        });
    }

    if (config.title.show) {
        createTitle({
            id,
            state
        });
    }

    if (config.toolkit.show) {
        createToolkitVerticalBar({
            id,
            config,
            dataset: flattenDataset,
            parent,
            total,
            average
        });
    }
}

const verticalBar = {
    prepareVerticalBar,
    calcDrawingHeight
}

export default verticalBar;
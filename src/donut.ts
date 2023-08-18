import { Config, DonutDatasetItem, DonutState, DonutStateObject, DrawingArea } from "../types";
import { configDonut, opacity } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, convertConfigColors, createConfig, createSvg, createUid, getDrawingArea, makeDonut, parseUserConfig, parseUserDataset, spawnNS } from "./functions";
import { createLegendDonut } from "./legend";
import { DONUT_STATE } from "./state_xy";
import { createTitle } from "./title";
import { createToolkitDonut } from "./toolkit";
import { createTooltipDonut } from "./tooltip";

export function handleConfigChange({ mutations, configObserver, dataset, id, state, parent, svg }: { mutations: MutationRecord[], dataset: any, configObserver: MutationObserver, id: string, state: DonutState, parent: HTMLDivElement, svg: SVGElement }) {
    for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === DataVisionAttribute.CONFIG) {
            const newJSONValue = (mutation.target as HTMLElement).getAttribute(DataVisionAttribute.CONFIG);
            if (newJSONValue === DataVisionAttribute.OK || newJSONValue === null) return;
            try {
                const newConfig = JSON.parse(newJSONValue);
                state[id].config = createConfig({
                    userConfig: newConfig,
                    defaultConfig: configDonut
                });
                svg.remove();
                parent.innerHTML = "";
                svg = createSvg({
                    parent,
                    dimensions: { x: newConfig.width, y: newConfig.height },
                    config: convertConfigColors(state[id].config),
                });
                loadDonut({
                    parent,
                    config: convertConfigColors(state[id].config),
                    dataset,
                    donutId: id,
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

export function handleDatasetChange({ mutations, datasetObserver, config, id, state, parent, svg }: { mutations: MutationRecord[], config: Config, datasetObserver: MutationObserver, id: string, state: DonutState, parent: HTMLDivElement, svg: SVGElement }) {
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
                loadDonut({
                    parent,
                    config,
                    dataset: parseUserDataset(newDataset),
                    donutId: id,
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

export function prepareDonut(parent: HTMLDivElement) {
    parent.style.width = `${parent.getAttribute("width")}`;
    const donutId = createUid();
    addTo(parent, "id", donutId);
    const userConfig = parseUserConfig(parent.dataset.visionConfig);
    const dataset = parseUserDataset(parent.dataset.visionSet);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configDonut
    });

    if (!config.useDiv) {
        config.height = config.width;
    }

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => handleConfigChange({ mutations, configObserver, id: donutId, parent, svg, dataset, state: DONUT_STATE }));
    const datasetObserver: MutationObserver = new MutationObserver(mutations => handleDatasetChange({ mutations, datasetObserver, id: donutId, parent, svg, config, state: DONUT_STATE })) as any;

    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });

    loadDonut({
        parent,
        config,
        dataset,
        donutId,
        svg
    });

    configObserver.disconnect();
    datasetObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    parent.dataset.visionSet = DataVisionAttribute.OK;
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
}

export function loadDonut({
    parent,
    config,
    dataset,
    donutId,
    svg
}: {
    parent: HTMLDivElement,
    config: Config,
    dataset: DonutDatasetItem[],
    donutId: string;
    svg: SVGElement
}) {
    const drawingArea: DrawingArea = getDrawingArea(config);
    const total = dataset.map(ds => ds.value).reduce((a, b) => a + b, 0);
    const average = total / dataset.length;

    Object.assign(DONUT_STATE, {
        [donutId]: {
            parent,
            type: "donut",
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

    drawDonut({
        state: DONUT_STATE,
        id: donutId
    })
}

export function drawDonut({ state, id }: { state: DonutState, id: string }) {
    // CLEAR STATE
    const thisDataset = state[id].dataset;
    thisDataset.datapoints = [];
    thisDataset.dataLabels = [];
    thisDataset.donutTraps = [];

    let {
        parent,
        svg,
        config,
        dataset,
        drawingArea,
        total,
        average
    } = state[id] as DonutStateObject;

    svg.innerHTML = "";

    const filteredDataset = dataset.filter(d => !state[id].segregatedDatasets.includes(d.datasetId));
    total = filteredDataset.map(d => d.value).reduce((a, b) => a + b, 0);
    average = total / filteredDataset.length;

    const mutatedDataset = filteredDataset.map(d => {
        return {
            ...d,
            proportion: d.value / total
        }
    }).sort((a, b) => b.value - a.value);

    const donut: DonutDatasetItem[] = makeDonut({
        item: {
            base: 1, series: mutatedDataset
        },
        cx: drawingArea.centerX,
        cy: drawingArea.centerY,
        rx: drawingArea.width / 5,
        ry: drawingArea.width / 5
    });

    donut.forEach(arc => {
        if (arc.proportion * 100 >= config.dataLabels.hideUnder) {
            const G = spawnNS(SvgElement.G);
            const labelPosition = positionLabel({ drawingArea, element: arc });
            const label = spawnNS(SvgElement.TEXT);
            addTo(label, SvgAttribute.X, labelPosition.x);
            addTo(label, SvgAttribute.Y, labelPosition.y);
            addTo(label, SvgAttribute.FILL, config.dataLabels.name.color);
            addTo(label, SvgAttribute.FONT_SIZE, config.dataLabels.name.fontSize);
            addTo(label, SvgAttribute.FONT_WEIGHT, config.dataLabels.name.bold ? 'bold' : 'normal');
            addTo(label, SvgAttribute.TEXT_ANCHOR, labelPosition.textAnchor);
            const name = config.dataLabels.name.useEllipsis ? arc.name.slice(0, 16) + "..." : arc.name;
            label.innerHTML = name;

            const percentagePosition = positionLabel({ drawingArea, element: arc, offset: 3 + config.dataLabels.percentage.fontSize });
            const percentage = spawnNS(SvgElement.TEXT);
            addTo(percentage, SvgAttribute.X, percentagePosition.x);
            addTo(percentage, SvgAttribute.Y, percentagePosition.y);
            addTo(percentage, SvgAttribute.FILL, config.dataLabels.percentage.color);
            addTo(percentage, SvgAttribute.FONT_SIZE, config.dataLabels.percentage.fontSize);
            addTo(percentage, SvgAttribute.TEXT_ANCHOR, percentagePosition.textAnchor);
            addTo(percentage, SvgAttribute.FONT_WEIGHT, config.dataLabels.percentage.bold ? 'bold' : 'normal')
            percentage.innerHTML = `${Number((arc.proportion * 100).toFixed(config.dataLabels.percentage.rounding)).toLocaleString()}% ${config.dataLabels.value.show ? `(${Number(arc.value.toFixed(config.dataLabels.value.rounding)).toLocaleString()})` : ''}`;

            [label, percentage].forEach((el: SVGElement) => G.appendChild(el))

            if (config.dataLabels.markers.show) {
                // TODO: apply config (radius and strokewidth)
                const marker = spawnNS(SvgElement.LINE);
                addTo(marker, SvgAttribute.STROKE, arc.color);
                addTo(marker, SvgAttribute.STROKE_WIDTH, config.dataLabels.markers.strokeWidth);
                addTo(marker, SvgAttribute.X1, arc.center.endX);
                addTo(marker, SvgAttribute.Y1, arc.center.endY);
                addTo(marker, SvgAttribute.X2, createMarker({ drawingArea, element: arc, offset: drawingArea.width / 5 }).x2);
                addTo(marker, SvgAttribute.Y2, createMarker({ drawingArea, element: arc, offset: drawingArea.width / 5 }).y2);

                const markerEnd = spawnNS(SvgElement.CIRCLE);
                addTo(markerEnd, SvgAttribute.FILL, arc.color);
                addTo(markerEnd, SvgAttribute.R, config.dataLabels.markers.radius);
                addTo(markerEnd, SvgAttribute.CX, arc.center.endX);
                addTo(markerEnd, SvgAttribute.CY, arc.center.endY);
                addTo(markerEnd, SvgAttribute.STROKE, "none");

                [marker, markerEnd].forEach((el: SVGElement) => G.appendChild(el));
            }
            svg.appendChild(G);
            thisDataset.dataLabels.push(G);
        }
    });

    if (config.hollow.total.show) {
        const totalLabel = spawnNS(SvgElement.TEXT);
        addTo(totalLabel, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(totalLabel, SvgAttribute.X, drawingArea.centerX);
        addTo(totalLabel, SvgAttribute.FILL, config.hollow.total.label.color);
        addTo(totalLabel, SvgAttribute.FONT_SIZE, config.hollow.total.label.fontSize);
        addTo(totalLabel, SvgAttribute.FONT_WEIGHT, config.hollow.total.label.bold ? 'bold' : 'normal');
        totalLabel.innerHTML = config.hollow.total.label.text;
        if (config.hollow.average.show) {
            addTo(totalLabel, SvgAttribute.Y, drawingArea.centerY - (config.hollow.total.value.fontSize * 2) + 6);
        } else {
            addTo(totalLabel, SvgAttribute.Y, drawingArea.centerY - (config.hollow.total.value.fontSize / 2));
        }

        const totalValue = spawnNS(SvgElement.TEXT);
        addTo(totalValue, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(totalValue, SvgAttribute.X, drawingArea.centerX);
        addTo(totalValue, SvgAttribute.FILL, config.hollow.total.value.color);
        addTo(totalValue, SvgAttribute.FONT_SIZE, config.hollow.total.value.fontSize);
        addTo(totalValue, SvgAttribute.FONT_WEIGHT, config.hollow.total.value.bold ? 'bold' : 'normal');
        totalValue.innerHTML = isNaN(total) ? "-" : Number(total.toFixed(config.hollow.total.value.rounding)).toLocaleString();
        if (config.hollow.average.show) {
            addTo(totalValue, SvgAttribute.Y, drawingArea.centerY - (config.hollow.total.value.fontSize) + 8);
        } else {
            addTo(totalValue, SvgAttribute.Y, drawingArea.centerY + (config.hollow.total.value.fontSize));
        }
        [totalLabel, totalValue].forEach(el => svg.appendChild(el));
    }

    if (config.hollow.average.show) {
        const averageLabel = spawnNS(SvgElement.TEXT);
        addTo(averageLabel, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(averageLabel, SvgAttribute.X, drawingArea.centerX);
        addTo(averageLabel, SvgAttribute.FILL, config.hollow.average.label.color);
        addTo(averageLabel, SvgAttribute.FONT_SIZE, config.hollow.average.label.fontSize);
        addTo(averageLabel, SvgAttribute.FONT_WEIGHT, config.hollow.average.label.bold ? 'bold' : 'normal');
        averageLabel.innerHTML = config.hollow.average.label.text;
        if (config.hollow.total.show) {
            addTo(averageLabel, SvgAttribute.Y, drawingArea.centerY + (config.hollow.average.value.fontSize) - 6);
        } else {
            addTo(averageLabel, SvgAttribute.Y, drawingArea.centerY - (config.hollow.average.value.fontSize / 2));
        }

        const averageValue = spawnNS(SvgElement.TEXT);
        addTo(averageValue, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(averageValue, SvgAttribute.X, drawingArea.centerX);
        addTo(averageValue, SvgAttribute.FILL, config.hollow.average.value.color);
        addTo(averageValue, SvgAttribute.FONT_SIZE, config.hollow.average.value.fontSize);
        addTo(averageValue, SvgAttribute.FONT_WEIGHT, config.hollow.average.value.bold ? 'bold' : 'normal');
        averageValue.innerHTML = isNaN(average) ? "-" : Number(average.toFixed(config.hollow.average.value.rounding)).toLocaleString();
        if (config.hollow.total.show) {
            addTo(averageValue, SvgAttribute.Y, drawingArea.centerY + (config.hollow.average.value.fontSize * 2) - 4);
        } else {
            addTo(averageValue, SvgAttribute.Y, drawingArea.centerY + (config.hollow.average.value.fontSize));
        }
        [averageLabel, averageValue].forEach(el => svg.appendChild(el));
    }

    donut.forEach(arc => {
        const path = spawnNS(SvgElement.PATH);
        addTo(path, SvgAttribute.D, arc.path);
        addTo(path, SvgAttribute.STROKE, arc.color);
        addTo(path, SvgAttribute.STROKE_WIDTH, config.arcs.width);
        addTo(path, SvgAttribute.FILL, "none");
        svg.appendChild(path);
        thisDataset.datapoints.push(path);

    });

    if (config.gradient.show) {
        const defs = spawnNS("defs") as SVGDefsElement;
        const radialGradient = spawnNS(SvgElement.RADIAL_GRADIENT) as SVGRadialGradientElement;
        addTo(radialGradient, SvgAttribute.CX, "50%");
        addTo(radialGradient, SvgAttribute.CY, "50%");
        addTo(radialGradient, SvgAttribute.R, "50%");
        addTo(radialGradient, SvgAttribute.FX, "50%");
        addTo(radialGradient, SvgAttribute.FY, "50%");
        addTo(radialGradient, "id", `donut_gradient_${id}`);

        const stop0 = spawnNS(SvgElement.STOP);
        addTo(stop0, SvgAttribute.OFFSET, "0%");
        addTo(stop0, SvgAttribute.STOP_COLOR, `${config.gradient.color}${opacity[0]}`);

        const stop1 = spawnNS(SvgElement.STOP);
        addTo(stop1, SvgAttribute.OFFSET, "60%");
        addTo(stop1, SvgAttribute.STOP_COLOR, `${config.gradient.color}${opacity[0]}`);

        const stop2 = spawnNS(SvgElement.STOP);
        addTo(stop2, SvgAttribute.OFFSET, "82%");
        addTo(stop2, SvgAttribute.STOP_COLOR, `${config.gradient.color}${opacity[config.gradient.intensity]}`);

        const stop3 = spawnNS(SvgElement.STOP);
        addTo(stop3, SvgAttribute.OFFSET, "100%");
        addTo(stop3, SvgAttribute.STOP_COLOR, `${config.gradient.color}${opacity[0]}`);
        [stop0, stop1, stop2, stop3].forEach(el => radialGradient.appendChild(el));
        defs.appendChild(radialGradient);
        svg.prepend(defs);

        const gradientCircle = spawnNS(SvgElement.CIRCLE);
        addTo(gradientCircle, SvgAttribute.CX, drawingArea.centerX);
        addTo(gradientCircle, SvgAttribute.CY, drawingArea.centerY);
        addTo(gradientCircle, SvgAttribute.R, drawingArea.width / 4);
        addTo(gradientCircle, SvgAttribute.FILL, `url(#donut_gradient_${id})`);
        svg.appendChild(gradientCircle);
    }

    function hover(index: number) {
        thisDataset.datapoints.filter((el: any, i: number) => i !== index).forEach((el: any) => {
            el.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        thisDataset.dataLabels.filter((el: any, i: number) => i !== index).forEach((el: any) => {
            el.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        thisDataset.datapoints.filter((el: any, i: number) => i === index).forEach((el: any) => {
            if (config.arcs.selected.useDropShadow) {
                el.style.filter = `drop-shadow(0px 3px 6px ${mutatedDataset[index].color}${opacity[50]})`;
            }
            el.style.transform = "scale(1.01, 1.01)";
            el.style.transformOrigin = "center";
        })
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
        })
    }

    donut.forEach((arc, i: number) => {
        const path = spawnNS(SvgElement.PATH);
        addTo(path, SvgAttribute.D, arc.path);
        addTo(path, SvgAttribute.STROKE, "transparent");
        addTo(path, SvgAttribute.STROKE_WIDTH, config.arcs.width);
        addTo(path, SvgAttribute.FILL, "none");
        path.addEventListener("mouseover", () => hover(i));
        path.addEventListener("mouseout", quit)
        svg.appendChild(path);
        thisDataset.donutTraps.push({
            element: path,
            datasetId: arc.datasetId
        });
    });

    if (config.tooltip.show) {
        createTooltipDonut({
            id,
            state,
            parent,
            total
        });
    }

    if (config.legend.show) {
        createLegendDonut({
            id,
            state,
            total
        });
    }

    if (config.title.show) {
        createTitle({
            id,
            state
        });
    }

    if (config.toolkit.show) {
        createToolkitDonut({
            id,
            config,
            dataset: mutatedDataset,
            parent,
            total
        });
    }
}


export function createMarker({ drawingArea, element, offset }: { drawingArea: DrawingArea, element: DonutDatasetItem, offset: number }) {
    const dx = drawingArea.centerX - element.center.endX;
    const dy = drawingArea.centerY - element.center.endY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const endX = element.center.endX + (dx / length) * (length - offset);
    const endY = element.center.endY + (dy / length) * (length - offset);

    return {
        x1: element.center.endX,
        y1: element.center.endY,
        x2: endX,
        y2: endY
    }
}

export function positionLabel({ drawingArea, element, offset = 0 }: { drawingArea: DrawingArea, element: DonutDatasetItem, offset?: number }) {
    let position = {
        x: element.center.endX,
        y: element.center.endY + offset,
        textAnchor: "middle"
    };

    if (element.center.endX - 12 > drawingArea.centerX) {
        position.textAnchor = "start";
        position.x += 12;
    }

    if (element.center.endX + 12 < drawingArea.centerX) {
        position.textAnchor = "end";
        position.x -= 12;
    }

    if (element.center.endX === drawingArea.centerX) {
        position.textAnchor = "middle";
        if (element.center.endY > drawingArea.centerY) {
            position.y += 12;
        }
        if (element.center.endY < drawingArea.centerY) {
            position.y -= 12;
        }
    }

    if (element.center.endY - 6 < (drawingArea.top + drawingArea.height / 4)) {
        position.y = createMarker({ drawingArea, element, offset: drawingArea.width / 3.08 }).y2 + offset;
    }

    if (element.center.endY + 6 > drawingArea.height - (drawingArea.height / 4)) {
        position.y = createMarker({ drawingArea, element, offset: drawingArea.width / 3 }).y2 + offset;
    }

    return position;
}


const donut = {
    prepareDonut
}

export default donut
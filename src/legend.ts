import { drawXy } from "./xy";
import { DomElement, SvgAttribute, SvgElement } from "./constants";
import { addTo, grabId, spawn, spawnNS } from "./functions";
import { Config, DonutDatasetItem, DonutState, DonutStateObject, RadialBarDatasetItem, RadialBarState, RadialBarStateObject, VerticalState, VerticalStateObject, WaffleDatasetItem, WaffleState, WaffleStateObject, XyDatasetItem, XyState, XyStateObject } from "../types";
import { drawDonut } from "./donut";
import { drawVerticalBar } from "./verticalBar";
import { drawRadialBar } from "./radialBar";
import { drawWaffle } from "./waffle";

export function createLegendWrapper({ config, id }: { config: Config, id: string }) {
    const legendWrapper = spawn(DomElement.DIV);
    addTo(legendWrapper, "id", `legend_${id}`);
    legendWrapper.style.width = "100%";
    if (config.legend.useDiv || config.useDiv) {
        legendWrapper.style.background = config.legend.backgroundColor;
    }
    legendWrapper.style.color = config.legend.color;
    legendWrapper.style.fontSize = `${config.legend.fontSize}px`;
    legendWrapper.style.fontFamily = config.fontFamily;
    legendWrapper.style.fontWeight = config.legend.bold ? 'bold' : 'normal';
    legendWrapper.style.padding = `${config.legend.paddingY}px 0`;
    legendWrapper.style.display = "flex";
    legendWrapper.style.flexWrap = "wrap";
    legendWrapper.style.alignItems = "center";
    legendWrapper.style.justifyContent = "center";
    legendWrapper.style.columnGap = "12px";
    legendWrapper.style.userSelect = "none";
    return legendWrapper;
}

export function segregateRadialBar({ datasetId, id, state, legendItem }: {
    datasetId: string,
    id: string, state: RadialBarState, legendItem: HTMLElement
}) {
    if (state[id].segregatedDatasets.includes(datasetId) && state[id].dataset) {
        state[id].segregatedDatasets = state[id].segregatedDatasets.filter((el: string) => el !== datasetId);
        legendItem.style.opacity = "1";

    } else {
        legendItem.style.opacity = "0.5";
        state[id].segregatedDatasets.push(datasetId);
        state[id].mutableDataset = state[id].mutableDataset.filter((el: WaffleDatasetItem) => el.datasetId !== datasetId);
    }
    drawRadialBar({
        state,
        id
    })
}

export function segregateWaffle({ datasetId, id, state, legendItem }: { datasetId: string, id: string, state: WaffleState, legendItem: HTMLElement }) {
    if (state[id].segregatedDatasets.includes(datasetId) && state[id].dataset) {
        state[id].segregatedDatasets = state[id].segregatedDatasets.filter((el: string) => el !== datasetId);
        legendItem.style.opacity = "1";
    } else {
        legendItem.style.opacity = "0.5";
        state[id].segregatedDatasets.push(datasetId);
        state[id].mutableDataset = state[id].mutableDataset.filter((el: RadialBarDatasetItem) => el.datasetId !== datasetId);
    }
    drawWaffle({
        state,
        id
    });
}

export function createLegendWaffle({ id, state }: { id: string, state: WaffleState }) {
    const { svg, parent, config, drawingArea, dataset } = state[id] as WaffleStateObject;

    if (!config.legend.show) return;

    const oldLegend = grabId(`legend_${id}`);
    if (oldLegend) {
        oldLegend.remove();
    }

    const legendWrapper = createLegendWrapper({
        config,
        id
    });

    dataset.forEach(ds => {
        const legendItem = spawn(DomElement.DIV);
        legendItem.style.display = "flex";
        legendItem.style.cursor = "pointer";
        legendItem.style.flexDirection = "flex-row";
        legendItem.style.alignItems = "center";
        legendItem.style.justifyContent = "center";
        legendItem.style.gap = "3px";
        legendItem.innerHTML = `<svg viewBox="0 0 16 16" height="18" width="18" style="font-size:${config.tooltip.fontSize};color:${config.tooltip.color}"><rect stroke="none" rx="${config.rects.borderRadius}" fill="${config.rects.gradient.baseColor}" x="0" y="0" height="16" width="16"/><rect stroke="none" fill="${config.rects.gradient.show ? `url(#waffle_gradient_${ds.datasetId})` : ds.color}" x="0" y="0" height="16" width="16" rx="${config.rects.borderRadius}"/></svg></span><span>${ds.name}</span>`
        legendItem.addEventListener("click", () => segregateWaffle({ datasetId: ds.datasetId, id, state, legendItem }))
        if (state[id].segregatedDatasets.includes(ds.datasetId)) {
            legendItem.style.filter = "opacity(50%)";
        } else {
            legendItem.style.filter = "none";
        }
        legendWrapper.appendChild(legendItem);
    });

    if (config.useDiv) {
        parent.appendChild(legendWrapper);
    } else {
        const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
        addTo(foreignObject, SvgAttribute.X, "0");
        addTo(foreignObject, SvgAttribute.Y, drawingArea.bottom);
        addTo(foreignObject, SvgAttribute.WIDTH, drawingArea.fullWidth);
        addTo(foreignObject, SvgAttribute.HEIGHT, drawingArea.fullHeight - drawingArea.bottom);
        foreignObject.style.overflow = "visible";
        foreignObject.appendChild(legendWrapper);
        svg.appendChild(foreignObject);
    }
}

export function createLegendRadialBar({ id, state }: { id: string, state: RadialBarState }) {
    const { svg, parent, config, drawingArea, dataset } = state[id] as RadialBarStateObject;

    if (!config.legend.show) return;

    const oldLegend = grabId(`legend_${id}`);
    if (oldLegend) {
        oldLegend.remove();
    }

    const legendWrapper = createLegendWrapper({
        config,
        id
    });

    dataset.forEach(ds => {
        const legendItem = spawn(DomElement.DIV);
        legendItem.style.display = "flex";
        legendItem.style.cursor = "pointer";
        legendItem.style.flexDirection = "flex-row";
        legendItem.style.alignItems = "center";
        legendItem.style.justifyContent = "center";
        legendItem.style.gap = "3px";
        legendItem.innerHTML = `<span style="color:${ds.color}">⬤</span><span>${ds.name}</span>`
        legendWrapper.appendChild(legendItem);
        legendItem.addEventListener("click", () => segregateRadialBar({ datasetId: ds.datasetId, id, state, legendItem }))
        if (state[id].segregatedDatasets.includes(ds.datasetId)) {
            legendItem.style.opacity = "0.5";
        } else {
            legendItem.style.opacity = "1";
        }
    });

    if (config.useDiv) {
        parent.appendChild(legendWrapper);
    } else {
        const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
        addTo(foreignObject, SvgAttribute.X, "0");
        addTo(foreignObject, SvgAttribute.Y, drawingArea.bottom);
        addTo(foreignObject, SvgAttribute.WIDTH, drawingArea.fullWidth);
        addTo(foreignObject, SvgAttribute.HEIGHT, drawingArea.fullHeight - drawingArea.bottom);
        foreignObject.style.overflow = "visible";
        foreignObject.appendChild(legendWrapper);
        svg.appendChild(foreignObject);
    }

    // TODO: dataset.forEAch and so on...
}

export function createLegendVerticalBar({ id, state }: { id: string, state: VerticalState }) {
    const { svg, parent, config, drawingArea, dataset } = state[id] as VerticalStateObject;
    if (!config.legend.show) return;

    const oldLegend = grabId(`legend_${id}`);
    if (oldLegend) {
        oldLegend.remove();
    }

    const legendWrapper = createLegendWrapper({
        config,
        id
    });

    dataset.forEach(ds => {
        const legendItem = spawn(DomElement.DIV);
        legendItem.style.display = "flex";
        legendItem.style.cursor = "pointer";
        legendItem.style.flexDirection = "flex-row";
        legendItem.style.alignItems = "center";
        legendItem.style.justifyContent = "center";
        legendItem.style.gap = "3px";
        legendItem.innerHTML = `<svg viewBox="0 0 16 16" height="12" width="12" style="all:unset"><rect fill="${ds.color}" x="0" y="0" width="16" height="16" rx="${config.bars.borderRadius}"/> </svg><span>${ds.name}</span>`
        legendWrapper.appendChild(legendItem);
        legendItem.addEventListener("click", () => segregateVerticalBar({ datasetId: ds.datasetId, id, state, legendItem }))
        if (state[id].segregatedDatasets.includes(ds.datasetId)) {
            legendItem.style.opacity = "0.5";
        } else {
            legendItem.style.opacity = "1";
        }
    });

    if (config.useDiv) {
        parent.appendChild(legendWrapper);
    } else {
        const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
        addTo(foreignObject, SvgAttribute.X, "0");
        addTo(foreignObject, SvgAttribute.Y, drawingArea.bottom);
        addTo(foreignObject, SvgAttribute.WIDTH, drawingArea.fullWidth);
        addTo(foreignObject, SvgAttribute.HEIGHT, drawingArea.fullHeight - drawingArea.bottom);
        foreignObject.style.overflow = "visible";
        foreignObject.appendChild(legendWrapper);
        svg.appendChild(foreignObject);
    }
}

export function segregateVerticalBar({ datasetId, id, state, legendItem }: { datasetId: string, id: string, state: VerticalState, legendItem: HTMLElement }) {
    if (state[id].segregatedDatasets.includes(datasetId) && state[id].dataset) {
        state[id].segregatedDatasets = state[id].segregatedDatasets.filter((el: string) => el !== datasetId);
        legendItem.style.opacity = "1";

    } else {
        legendItem.style.opacity = "0.5";
        state[id].segregatedDatasets.push(datasetId);
        state[id].mutableDataset = state[id].mutableDataset.filter((el: DonutDatasetItem) => el.datasetId !== datasetId);
    }
    drawVerticalBar({
        state,
        id
    });
}

export function createLegendDonut({ id, state }: { id: string, state: DonutState }) {
    const { svg, parent, config, drawingArea, dataset } = state[id] as DonutStateObject;

    if (!config.legend.show) return;

    const oldLegend = grabId(`legend_${id}`);
    if (oldLegend) {
        oldLegend.remove();
    }

    const legendWrapper = createLegendWrapper({
        config,
        id
    });

    dataset.forEach(ds => {
        const legendItem = spawn(DomElement.DIV);
        legendItem.style.display = "flex";
        legendItem.style.cursor = "pointer";
        legendItem.style.flexDirection = "flex-row";
        legendItem.style.alignItems = "center";
        legendItem.style.justifyContent = "center";
        legendItem.style.gap = "3px";
        legendItem.innerHTML = `<span style="color:${ds.color}">⬤</span><span>${ds.name}</span>`
        legendWrapper.appendChild(legendItem);
        legendItem.addEventListener("click", () => segregateDonut({ datasetId: ds.datasetId, id, state, legendItem }))
        if (state[id].segregatedDatasets.includes(ds.datasetId)) {
            legendItem.style.opacity = "0.5";
        } else {
            legendItem.style.opacity = "1";
        }
    });

    if (config.useDiv) {
        parent.appendChild(legendWrapper);
    } else {
        const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
        addTo(foreignObject, SvgAttribute.X, "0");
        addTo(foreignObject, SvgAttribute.Y, drawingArea.bottom);
        addTo(foreignObject, SvgAttribute.WIDTH, drawingArea.fullWidth);
        addTo(foreignObject, SvgAttribute.HEIGHT, drawingArea.fullHeight - drawingArea.bottom);
        foreignObject.style.overflow = "visible";
        foreignObject.appendChild(legendWrapper);
        svg.appendChild(foreignObject);
    }
}

export function segregateDonut({ datasetId, id, state, legendItem }: { datasetId: string, id: string, state: DonutState, legendItem: HTMLElement }) {
    if (state[id].segregatedDatasets.includes(datasetId) && state[id].dataset) {
        state[id].segregatedDatasets = state[id].segregatedDatasets.filter((el: string) => el !== datasetId);
        legendItem.style.opacity = "1";

    } else {
        legendItem.style.opacity = "0.5";
        state[id].segregatedDatasets.push(datasetId);
        state[id].mutableDataset = state[id].mutableDataset.filter((el: DonutDatasetItem) => el.datasetId !== datasetId);
    }
    drawDonut({
        state,
        id
    })
}

export function segregateXy({ datasetId, id, state, legendItem }: { datasetId: string, id: string, state: XyState, legendItem: HTMLElement }) {

    if (state[id].segregatedDatasets.includes(datasetId) && state[id].dataset) {
        state[id].segregatedDatasets = state[id].segregatedDatasets.filter((el: string) => el !== datasetId);
        legendItem.style.opacity = "1";
        (state[id].dataset).find((el: XyDatasetItem) => el.datasetId === datasetId).datapoints.forEach((plot: { style: { opacity: string; }; }) => plot.style.opacity = "1");
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).lines.forEach((line: { style: { opacity: string; }; }) => line.style.opacity = "1");
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).dataLabels.forEach((dataLabel: { style: { opacity: string; }; }) => dataLabel.style.opacity = "1");
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).areas.forEach((area: { style: { opacity: string; }; }) => area.style.opacity = "1");
    } else {
        state[id].segregatedDatasets.push(datasetId);
        legendItem.style.opacity = "0.5";
        state[id].mutableDataset = state[id].mutableDataset.filter((el: XyDatasetItem) => el.datasetId !== datasetId);
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).datapoints.forEach((plot: { style: { opacity: string; }; }) => plot.style.opacity = "0");
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).lines.forEach((line: { style: { opacity: string; }; }) => line.style.opacity = "0");
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).dataLabels.forEach((dataLabel: { style: { opacity: string; }; }) => dataLabel.style.opacity = "0");
        state[id].dataset.find((el: XyDatasetItem) => el.datasetId === datasetId).areas.forEach((area: { style: { opacity: string; }; }) => area.style.opacity = "0");
    }
    drawXy({
        state,
        id
    });
}

export function createLegendXy({ id, state }: { id: string, state: XyState }) {
    const { svg, parent, config, drawingArea, dataset } = state[id] as XyStateObject;

    if (!config.legend.show) return;

    const oldLegend = grabId(`legend_${id}`);
    if (oldLegend) {
        oldLegend.remove();
    }

    const legendWrapper = createLegendWrapper({
        config,
        id
    });

    dataset.forEach(ds => {
        const legendItem = spawn(DomElement.DIV);
        legendItem.style.display = "flex";
        legendItem.style.cursor = "pointer";
        legendItem.style.flexDirection = "flex-row";
        legendItem.style.alignItems = "center";
        legendItem.style.justifyContent = "center";
        legendItem.style.gap = "3px";
        legendItem.innerHTML = `<span style="color:${ds.color}">${ds.type === 'line' ? '▬' : ds.type === 'bar' ? '◼' : '⬤'}</span><span>${ds.name}</span>`
        legendWrapper.appendChild(legendItem);
        legendItem.addEventListener("click", () => segregateXy({ datasetId: ds.datasetId, id, state, legendItem }))
        if (state[id].segregatedDatasets.includes(ds.datasetId)) {
            legendItem.style.opacity = "0.5";
        } else {
            legendItem.style.opacity = "1";
        }
    });

    if (config.legend.useDiv) {
        parent.appendChild(legendWrapper);
    } else {
        const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
        addTo(foreignObject, SvgAttribute.X, "0");
        addTo(foreignObject, SvgAttribute.Y, drawingArea.bottom);
        addTo(foreignObject, SvgAttribute.WIDTH, drawingArea.fullWidth);
        addTo(foreignObject, SvgAttribute.HEIGHT, drawingArea.fullHeight - drawingArea.bottom);
        foreignObject.style.overflow = "visible";
        foreignObject.appendChild(legendWrapper);
        svg.appendChild(foreignObject);
    }
}

const legend = {
    createLegendXy,
    createLegendDonut,
    createLegendVerticalBar,
    createLegendRadialBar,
    createLegendWaffle
}

export default legend;
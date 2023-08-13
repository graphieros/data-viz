import { drawChart } from "./charts";
import { spawn, spawnNS } from "./functions";

export function segregate({ datasetId, id, state, legendItem }: { datasetId: string, id: string, state: any, legendItem: any }) {

    if (state[id].segregatedDatasets.includes(datasetId)) {
        state[id].segregatedDatasets = state[id].segregatedDatasets.filter((el: string) => el !== datasetId);
        legendItem.style.opacity = "1";
        state[id].dataset.find((el: any) => el.datasetId === datasetId).datapoints.forEach((plot: any) => plot.style.opacity = "1");
        state[id].dataset.find((el: any) => el.datasetId === datasetId).lines.forEach((line: any) => line.style.opacity = "1");
        state[id].dataset.find((el: any) => el.datasetId === datasetId).dataLabels.forEach((dataLabel: any) => dataLabel.style.opacity = "1");
        state[id].dataset.find((el: any) => el.datasetId === datasetId).areas.forEach((area: any) => area.style.opacity = "1");
    } else {
        state[id].segregatedDatasets.push(datasetId);
        legendItem.style.opacity = "0.5";
        state[id].mutableDataset = state[id].mutableDataset.filter((el: any) => el.datasetId !== datasetId);
        state[id].dataset.find((el: any) => el.datasetId === datasetId).datapoints.forEach((plot: any) => plot.style.opacity = "0");
        state[id].dataset.find((el: any) => el.datasetId === datasetId).lines.forEach((line: any) => line.style.opacity = "0");
        state[id].dataset.find((el: any) => el.datasetId === datasetId).dataLabels.forEach((dataLabel: any) => dataLabel.style.opacity = "0");
        state[id].dataset.find((el: any) => el.datasetId === datasetId).areas.forEach((area: any) => area.style.opacity = "0");
    }

    console.log(state[id].segregatedDatasets)
    drawChart({
        state,
        id
    })
}

export function createLegend({ id, state }: { id: string, state: any }) {
    const { svg, parent, config, drawingArea, dataset } = state[id];

    if (!config.legend.show) return;

    const legendWrapper = spawn("DIV");
    legendWrapper.style.width = "100%";
    legendWrapper.style.background = config.legend.backgroundColor;
    legendWrapper.style.color = config.legend.color;
    legendWrapper.style.fontSize = `${config.legend.fontSize}px`;
    legendWrapper.style.fontWeight = config.legend.bold ? 'bold' : 'normal';
    legendWrapper.style.padding = config.legend.padding;
    legendWrapper.style.display = "flex";
    legendWrapper.style.flexWrap = "wrap";
    legendWrapper.style.alignItems = "center";
    legendWrapper.style.justifyContent = "center";
    legendWrapper.style.columnGap = "12px";
    legendWrapper.style.userSelect = "none";

    dataset.forEach((ds: any) => {
        const legendItem = spawn("DIV");
        legendItem.style.display = "flex";
        legendItem.style.flexDirection = "flex-row";
        legendItem.style.alignItems = "center";
        legendItem.style.justifyContent = "center";
        legendItem.style.gap = "3px";
        legendItem.innerHTML = `<span style="color:${ds.color}">⬤</span><span>${ds.name}</span>`
        legendWrapper.appendChild(legendItem);
        legendItem.addEventListener("click", () => segregate({ datasetId: ds.datasetId, id, state, legendItem }))
    })

    if (config.legend.useDiv) {
        parent.appendChild(legendWrapper);

    } else {
        // inject in foreignObject
    }

    console.log(state[id])
}

const legend = {
    createLegend
}

export default legend;
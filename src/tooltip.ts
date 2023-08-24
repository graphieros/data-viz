import { Config, Datapoint, DonutDatasetItem, DonutState, GaugeState, RadialBarDatasetItem, UnknownObj, VerticalDatasetItem, VerticalState, WaffleDatasetItem, WaffleState, XyDatasetItem, XyState } from "../types";
import { DomElement } from "./constants";
import { addTo, grabId, isValidUserValue, spawn } from "./functions";

export function generateTooltip({ config }: { config: Config }) {
    const tooltip = spawn(DomElement.DIV) as unknown as HTMLDivElement;
    tooltip.classList.add("data-vision-tooltip");
    tooltip.style.position = "fixed";
    tooltip.style.background = config.tooltip.backgroundColor;
    tooltip.style.padding = `${config.tooltip.padding}px`;
    tooltip.style.border = config.tooltip.border;
    tooltip.style.borderRadius = `${config.tooltip.borderRadius}px`;
    tooltip.style.boxShadow = config.tooltip.boxShadow;
    tooltip.style.fontSize = `${config.tooltip.fontSize}px`;
    tooltip.style.fontFamily = config.fontFamily;
    tooltip.style.color = config.tooltip.color;
    tooltip.style.zIndex = "100";
    tooltip.style.width = "fit-content !important";
    tooltip.style.maxWidth = `${config.tooltip.maxWidth}px`;
    tooltip.style.transition = config.tooltip.transition;
    tooltip.style.fontVariantNumeric = "tabular-nums";
    return tooltip;
}

export function applyEventListener({ state, svg, tooltip, config }: { state: UnknownObj, svg: SVGElement, tooltip: HTMLElement, config: Config }) {
    svg.addEventListener("mousemove", (e) => {
        if (state.isTooltip) {
            tooltip.style.display = "initial";
            const rect = tooltip.getBoundingClientRect();
            state.clientX = e.clientX - rect.width / 2;
            state.clientY = e.clientY + 24 + config.tooltip.offsetY;
            tooltip.style.left = `${state.clientX + rect.width > window.innerWidth ? state.clientX - rect.width / 2 : state.clientX - rect.width < 0 ? state.clientX + rect.width / 2 : state.clientX}px`;
            tooltip.style.top = `${state.clientY + rect.height > window.innerHeight ? state.clientY - (rect.height) - 64 : state.clientY}px`;
        }
    });
}

export function createTooltipWaffle({ id, state, parent, total }: { id: string, state: WaffleState, parent: HTMLDivElement, total: number }) {
    const oldTooltip = grabId(`tooltip_${id}`);
    if (oldTooltip) {
        oldTooltip.remove();
    }
    const config: Config = state[id].config;
    const svg: SVGElement = state[id].svg;
    const tooltip = generateTooltip({ config });
    addTo(tooltip, "id", `tooltip_${id}`);
    parent.appendChild(tooltip);
    tooltip.style.display = "none";

    applyEventListener({
        state,
        tooltip,
        svg,
        config
    });

    const traps = state[id].dataset.datapoints;
    traps.forEach((trap: Datapoint) => {
        const itsDataset = trap.element;
        if (itsDataset) {
            trap.element.addEventListener("mouseover", () => {
                generateTooltipContent(trap.datasetId);
            });
            trap.element.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
                state.isTooltip = false;
            })
        }
    });

    function generateTooltipContent(datasetId: string) {
        state.isTooltip = true,
            tooltip.style.display = "flex";
        const source: WaffleDatasetItem = state[id].dataset.find((ds: WaffleDatasetItem) => ds.datasetId === datasetId);

        let html = "";
        html += `<div style="display:flex;align-items:center;flex-direction:row;gap:4px;font-weight:bold"><svg viewBox="0 0 16 16" height="18" width="18" style="all:unset;font-size:${config.tooltip.fontSize};color:${config.tooltip.color}"><rect stroke="none" fill="${config.rects.gradient.baseColor}" x="0" y="0" height="16" width="16"/><rect stroke="none" fill="${config.rects.gradient.show ? `url(#waffle_gradient_${datasetId})` : source.color}" x="0" y="0" height="16" width="16" rx="${config.rects.borderRadius}"/></svg><div>${source.name}</div></div>`;

        html += `<div style="width:100%; margin-top:6px; padding-top:6px; border-top:1px solid #e1e5e8">`;
        if (config.tooltip.percentage.show) {
            html += `<div style="font-weight:${config.tooltip.percentage.bold ? 'bold' : 'normal'}">${isNaN(source.value) ? '-' : Number((source.value / total * 100).toFixed(config.tooltip.percentage.rounding)).toLocaleString()}%</div>`;
        }
        if (config.tooltip.value.show) {
            html += `<div style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${isNaN(source.value) ? '-' : Number(source.value.toFixed(config.tooltip.value.rounding)).toLocaleString()}</div>`
        }
        html += `</div>`;
        tooltip.innerHTML = html;
    }
}

export function createTooltipRadialBar({ id, state, parent }: { id: string, state: VerticalState, parent: HTMLDivElement }) {
    const oldTooltip = grabId(`tooltip_${id}`);
    if (oldTooltip) {
        oldTooltip.remove();
    }
    const config: Config = state[id].config;
    const svg: SVGElement = state[id].svg;
    const tooltip = generateTooltip({ config });
    addTo(tooltip, "id", `tooltip_${id}`);
    parent.appendChild(tooltip);
    tooltip.style.display = "none";

    applyEventListener({
        state,
        tooltip,
        svg,
        config
    });

    const traps = state[id].dataset.traps;
    traps.forEach((trap: any) => {
        const itsDataset = trap.element;
        if (itsDataset) {
            trap.element.addEventListener("mouseover", () => generateTooltipContent(trap.datasetId));
            trap.element.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
                state.isTooltip = false;
            });
        }
    });

    function generateTooltipContent(datasetId: string) {
        state.isTooltip = true;
        tooltip.style.display = "flex";
        const source = state[id].dataset.find((el: RadialBarDatasetItem) => el.datasetId === datasetId);

        let html = `<div style="display:flex;align-items:center;flex-direction:row;gap:4px;font-weight:bold"><svg viewBox="0 0 16 16" height="12" width="12" style="all:unset;font-size:${config.tooltip.fontSize};color:${config.tooltip.color}"><circle fill="${source.color}" cx="8" cy="8" r="8"/></svg>${source.name}</div>`;

        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8;width:100%">`;
        if (!isNaN(source.percentage) && config.tooltip.percentage.show) {
            html += `<div style="font-weight:${config.tooltip.percentage.bold ? 'bold' : 'normal'}">${Number(source.percentage.toFixed(config.tooltip.percentage.rounding)).toLocaleString()}%</div>`;
        }
        if (!isNaN(source.value) && config.tooltip.value.show) {
            html += `<div style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${Number(source.value.toFixed(config.tooltip.value.rounded)).toLocaleString()}</div>`;
        }
        html += `</div>`;

        tooltip.innerHTML = html;
    }
}

export function createTooltipGauge({ id, state, parent, total }: { id: string, state: GaugeState, parent: HTMLDivElement, total: number }) {
    const oldTooltip = grabId(`tooltip_${id}`);
    if (oldTooltip) {
        oldTooltip.remove();
    }
    const config: Config = state[id].config;
    const svg: SVGElement = state[id].svg;
    const tooltip = generateTooltip({ config });
    addTo(tooltip, "id", `tooltip_${id}`);
    parent.appendChild(tooltip);
    tooltip.style.display = "none";

    applyEventListener({
        state,
        tooltip,
        svg,
        config
    });

    const traps = state[id].dataset.traps;
    traps.forEach((trap: any) => {
        const itsDataset = trap.element;
        if (itsDataset) {
            trap.element.addEventListener("mouseover", () => generateTooltipContent(trap.datasetId));
            trap.element.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
                state.isTooltip = false;
            });
        }
    });

    function generateTooltipContent(datasetId: string) {
        state.isTooltip = true;
        tooltip.style.display = "flex";
        const source = state[id].mutableDataset.series.find((el: any) => el.id === datasetId);
        let html = `<div style="display:flex;align-items:center;flex-direction:row;gap:4px;font-weight:bold"><svg viewBox="0 0 16 16" height="12" width="12" style="all:unset"><rect fill="${source.color}" x="0" y="0" width="16" height="16" rx="${12}"/> </svg>${config.tooltip.translations.from} ${source.from} ${config.tooltip.translations.to} ${source.to}</div>`;
        if (config.tooltip.value.show || config.tooltip.percentage.show) {
            html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8;">`;
            if (config.tooltip.value.show) {
                html += `<div style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${isValidUserValue(source.quantity) ? Number(source.quantity.toFixed(config.tooltip.value.rounding)).toLocaleString() : "-"}</div>`;
            }
            if (config.tooltip.percentage.show && isValidUserValue(source.quantity / total)) {
                html += `<div style="font-weight:${config.tooltip.percentage.bold ? 'bold' : 'normal'}">${Number((source.quantity / total * 100).toFixed(config.tooltip.percentage.rounding)).toLocaleString()}%</div>`;
            }
            html += `</div>`;
        }
        tooltip.innerHTML = html;
    }

}

export function createTooltipVerticalBar({ id, state, parent }: { id: string, state: VerticalState, parent: HTMLDivElement }) {
    const oldTooltip = document.getElementById(`tooltip_${id}`);
    if (oldTooltip) {
        oldTooltip.remove();
    }
    const config: Config = state[id].config;
    const svg: SVGElement = state[id].svg;
    const tooltip = generateTooltip({ config });
    addTo(tooltip, "id", `tooltip_${id}`);
    parent.appendChild(tooltip);
    tooltip.style.display = "none";

    applyEventListener({
        state,
        tooltip,
        svg,
        config
    });

    function generateTooltipContent(datasetItem: VerticalDatasetItem) {
        state.isTooltip = true;
        tooltip.style.display = "flex";
        let html = "";

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;">`;

        html += `<svg viewBox="0 0 16 16" height="16" width="16" style="all:unset"><rect fill="${datasetItem.color}" x="0" y="0" width="16" height="16" rx="${config.bars.borderRadius}"/> </svg>`;

        html += `<div style="display: flex; align-items:flex-start;flex-direction:column">`;
        if (datasetItem.isChild) {
            html += `<div><b>${datasetItem.parentName}</b></div>`;
        }
        html += `<div><b>${datasetItem.name}</b></div>`;
        html += "</div></div>";

        html += `<div style="width:100%; padding-top:6px;margin-top:6px;border-top:1px solid #e1e5e8">`
        if (config.tooltip.value.show) {
            html += `<div style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${isNaN(datasetItem.value) ? '-' : Number((datasetItem.value.toFixed(config.tooltip.value.rounding))).toLocaleString()}</div>`
        }
        if (config.tooltip.percentage.show) {
            html += `<div style="font-weight:${config.tooltip.percentage.bold ? 'bold' : 'normal'}">${isNaN(datasetItem.proportion) ? '-' : Number((datasetItem.proportion * 100).toFixed(config.tooltip.percentage.rounding)).toLocaleString()}% ${config.tooltip.percentage.translations.toTotal} </div>`;
            if (datasetItem.isChild) {
                html += `<div style="font-weight:${config.tooltip.percentage.bold ? 'bold' : 'normal'}">${isNaN(datasetItem.proportionToParent) ? '-' : Number((datasetItem.proportionToParent * 100).toFixed(config.tooltip.percentage.rounding)).toLocaleString()}% ${config.tooltip.percentage.translations.of} ${datasetItem.parentName} </div>`;
            }
        }
        html += `</div>`;
        tooltip.innerHTML = html;
    }

    const verticalTraps = state[id].dataset.verticalTraps;

    verticalTraps.forEach((trap: any) => {
        const itsDataset = trap.data
        if (itsDataset) {
            trap.element.addEventListener("mouseover", () => generateTooltipContent(itsDataset));
            trap.element.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
                state.isTooltip = false;
            });
        }
    });
}

export function createTooltipDonut({ id, state, parent, total }: { id: string, state: DonutState, parent: HTMLDivElement, total: number }) {
    const oldTooltip = document.getElementById(`tooltip_${id}`);
    if (oldTooltip) {
        oldTooltip.remove();
    }

    const config: Config = state[id].config;
    const svg: SVGElement = state[id].svg;
    const tooltip = generateTooltip({ config });
    addTo(tooltip, "id", `tooltip_${id}`);
    parent.appendChild(tooltip);
    tooltip.style.display = "none";

    applyEventListener({
        state,
        tooltip,
        svg,
        config
    });

    function generateTooltipContent(datasetItem: DonutDatasetItem) {
        state.isTooltip = true;
        tooltip.style.display = "flex";
        let html = "";

        html += `<b>${datasetItem.name}</b>`;
        if (config.tooltip.percentage.show) {
            html += `<div style="margin-top:6px; padding-top:6px; border-top: 1px solid #e1e5e8;width:100%;font-weight:${config.tooltip.percentage.bold ? 'bold' : 'normal'}">${Number((datasetItem.value / total * 100).toFixed(config.tooltip.percentage.rounding)).toLocaleString()}%</div>`;
        }
        if (config.tooltip.value.show) {
            html += `<div>(${Number(datasetItem.value.toFixed(config.tooltip.value.rounding)).toLocaleString()})</div>`
        }

        tooltip.innerHTML = `<div style="width:100%;font-size:${config.tooltip.fontSize};color:${config.tooltip.color};font-family:${config.fontFamily}">${html}</div>`;
    }

    const donutTraps = state[id].dataset.donutTraps;
    donutTraps.forEach((trap: any) => {
        const itsDataset = (state[id].dataset as DonutDatasetItem[]).find(ds => ds.datasetId === trap.datasetId);
        if (itsDataset) {
            trap.element.addEventListener("mouseover", () => generateTooltipContent(itsDataset));
            trap.element.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
                state.isTooltip = false;
            });
        }
    });
}

export function createTooltipXy({ id, state, parent }: { id: string, state: XyState, parent: HTMLDivElement }) {
    const oldTooltip = document.getElementById(`tooltip_${id}`);
    if (oldTooltip) {
        oldTooltip.remove();
    }

    const config = state[id].config;
    const svg = state[id].svg;
    const tooltip = generateTooltip({ config });
    addTo(tooltip, "id", `tooltip_${id}`);

    if (state[id].type === 'xy') {
        const series = (state[id].dataset as XyDatasetItem[])
            .filter(ds => !state[id].segregatedDatasets.includes(ds.datasetId))
            .map(s => {
                return {
                    ...s,
                    name: s.name,
                    color: s.color,
                }
            });

        parent.appendChild(tooltip);
        tooltip.style.display = "none";

        const datasetRef = (state[id].dataset as XyDatasetItem[])
            .filter(ds => !state[id].segregatedDatasets.includes(ds.datasetId));

        svg.addEventListener("mousemove", (e: { clientX: number; clientY: number; }) => {
            const average = datasetRef
                .map(ds => ds.values[state[id].selectedIndex])
                .filter((v: number) => !isNaN(v))
                .reduce((a: number, b: number) => a + b, 0) / datasetRef.map((ds: any) => ds.values[state[id].selectedIndex])
                    .filter((v: number) => !isNaN(v)).length;

            const total = datasetRef
                .map(ds => ds.values[state[id].selectedIndex])
                .filter((v: number) => !isNaN(v))
                .reduce((a: number, b: number) => a + b, 0);

            if (state.isTooltip) {
                tooltip.style.display = "initial";
                const rect = tooltip.getBoundingClientRect();
                state.clientX = e.clientX - rect.width / 2;
                state.clientY = e.clientY + 24 + config.tooltip.offsetY;
                tooltip.style.left = `${state.clientX + rect.width > window.innerWidth ? state.clientX - rect.width / 2 : state.clientX - rect.width < 0 ? state.clientX + rect.width / 2 : state.clientX}px`;
                tooltip.style.top = `${state.clientY + rect.height > window.innerHeight ? state.clientY - (rect.height) - 64 : state.clientY}px`;
                let html = ``;
                html += `
                    <div style="display:block; width:100%; border-bottom:1px solid #e1e5e8; padding:0 0 6px 0; margin-bottom:6px;"><b>${config.grid.xLabels.values[state[id].selectedIndex]}</b>
                `;

                if (config.tooltip.total.show) {
                    html += "<br>";
                    html += `<span>${config.tooltip.total.translation} : </span><span style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${isNaN(total) ? '-' : Number(total.toFixed(config.tooltip.total.rounding)).toLocaleString()}</span>`
                }

                if (config.tooltip.average.show) {
                    html += "<br>";
                    html += `<span>${config.tooltip.average.translation} : </span><span style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${isNaN(average) ? '-' : Number(average.toFixed(config.tooltip.average.rounding)).toLocaleString()}</span>`
                }

                html += "</div>";

                series.forEach(s => {
                    const squareIcon = `<svg viewBox="0 0 20 20" height="20" width="10"><rect fill="${s.color}" stroke="none" rx="0" x="0" y="0" height="20" width="20"/></svg>`;
                    const lineIcon = `<svg viewBox="0 0 20 20" height="20" width="10"><rect fill="${s.color}" stroke="none" rx="0" x="0" y="10" height="6" width="20"/></svg>`;
                    const circleIcon = `<svg viewBox="0 0 20 20" height="20" width="10"><circle cx="10" cy="10" r="10" fill="${s.color}" stroke="none"/></svg>`;

                    const percentage = s.values[state[id].selectedIndex] / total * 100;
                    html += `<div style="display:flex; flex-direction:row;align-items:center;gap:3px">${s.type === 'line' ? lineIcon : s.type === 'bar' ? squareIcon : circleIcon} <div>${s.name} : <span style="font-weight:${config.tooltip.value.bold ? 'bold' : 'normal'}">${isNaN(s.values[state[id].selectedIndex]) ? '-' : Number(s.values[state[id].selectedIndex].toFixed(config.tooltip.value.rounding)).toLocaleString()}</span></div>`;
                    if (config.tooltip.percentage.show) {
                        html += `<span style="margin-left:3px;">(${isNaN(percentage) ? '-' : Number((percentage).toFixed(config.tooltip.percentage.rounding)).toLocaleString()}%)</span>`
                    }
                    html += "</div>";
                });

                tooltip.innerHTML = html;
            } else {
                tooltip.style.display = "none";
            }
        });
    }

    svg.addEventListener("mouseleave", () => {
        state.clientX = 0;
        state.clientY = 0;
        state.isTooltip = false;
        tooltip.style.display = "none";
    });
}

const tooltip = {
    createTooltipXy,
    createTooltipDonut,
    createTooltipVerticalBar,
    createTooltipGauge,
    createTooltipWaffle
}

export default tooltip;
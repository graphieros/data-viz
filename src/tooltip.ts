import { DomElement } from "./constants";
import { spawn } from "./functions";

export function createTooltip({ id, state }: { id: string, state: any }) {
    const existingTooltips = document.getElementsByClassName("data-vision-tooltip");
    if (existingTooltips.length) {
        Array.from(existingTooltips).forEach((t: any) => t.remove())
    }

    const config = state[id].config;
    const svg = state[id].svg;
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

    if (state[id].type === 'xy') {
        const series = state[id].dataset.filter((ds: any) => !state[id].segregatedDatasets.includes(ds.datasetId)).map((s: any) => {
            return {
                ...s,
                name: s.name,
                color: s.color,
            }
        });

        document.body.appendChild(tooltip);
        tooltip.style.display = "none";

        const datasetRef = state[id].dataset.filter((ds: any) => !state[id].segregatedDatasets.includes(ds.datasetId));

        svg.addEventListener("mousemove", (e: any) => {
            const average = datasetRef
                .map((ds: any) => ds.values[state[id].selectedIndex])
                .filter((v: number) => !isNaN(v))
                .reduce((a: number, b: number) => a + b, 0) / datasetRef.map((ds: any) => ds.values[state[id].selectedIndex])
                    .filter((v: number) => !isNaN(v)).length;

            const total = datasetRef
                .map((ds: any) => ds.values[state[id].selectedIndex])
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
                    html += `<span>${config.tooltip.total.translation} : </span><b>${isNaN(total) ? '-' : Number(total.toFixed(config.tooltip.total.rounding)).toLocaleString()}</b>`
                }

                if (config.tooltip.average.show) {
                    html += "<br>";
                    html += `<span>${config.tooltip.average.translation} : </span><b>${isNaN(average) ? '-' : Number(average.toFixed(config.tooltip.average.rounding)).toLocaleString()}</b>`
                }

                html += "</div>";
                series.forEach((s: any) => {
                    const percentage = s.values[state[id].selectedIndex] / total * 100;
                    html += `<div><span style="color:${s.color};margin-right:3px;">${s.type === 'line' ? '▬' : s.type === 'bar' ? '◼' : '⬤'}</span>${s.name} : <b>${isNaN(s.values[state[id].selectedIndex]) ? '-' : Number(s.values[state[id].selectedIndex].toFixed(config.tooltip.value.rounding)).toLocaleString()}</b>`;
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
    createTooltip
}

export default tooltip;
import { DomElement } from "./constants";
import { spawn } from "./functions";

export function createTooltip({ id, state }: { id: string, state: any }) {
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
    tooltip.style.maxWidth = `${config.tooltip.maxWidth}px`;
    tooltip.style.transition = config.tooltip.transition;

    if (state[id].type === 'xy') {
        const series = state[id].dataset.map((s: any) => {
            return {
                ...s,
                name: s.name,
                color: s.color,
            }
        });

        svg.addEventListener("mousemove", (e: any) => {
            tooltip.remove();
            if (state.isTooltip) {
                document.body.appendChild(tooltip);
                const rect = tooltip.getBoundingClientRect();
                state.clientX = e.clientX - rect.width / 2;
                state.clientY = e.clientY + 24 + config.tooltip.offsetY;
                tooltip.style.left = `${state.clientX + rect.width > window.innerWidth ? state.clientX - rect.width / 2 : state.clientX - rect.width < 0 ? state.clientX + rect.width / 2 : state.clientX}px`;
                tooltip.style.top = `${state.clientY + rect.height > window.innerHeight ? state.clientY - (rect.height) - 64 : state.clientY}px`;
                tooltip.innerHTML = `
                    <div style="display:block; width:100%; border-bottom:1px solid #e1e5e8; padding:0 0 6px 0; margin-bottom:6px;">${config.yLabels.values[state[id].selectedIndex]}</div>
                `;
                series.forEach((s: any) => {
                    tooltip.innerHTML += `<div><span style="color:${s.color};margin-right:3px;">⬤</span>${s.name} : <span style="">${s.values[state[id].selectedIndex]}</span></div>`
                });
            }
        });
    }

    svg.addEventListener("mouseleave", () => {
        state.clientX = 0;
        state.clientY = 0;
        tooltip.remove();
    });
}

const tooltip = {
    createTooltip
}

export default tooltip;
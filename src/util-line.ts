import { DomElement, SvgAttribute, SvgElement } from "./constants";
import { spawn, spawnNS, addTo, isValidUserValue, createLinearGradient, shiftHue, closestDecimal } from "./functions";
import { opacity } from "./config";
import XY_STATE from "./state_xy";

export function createYLabels({ id, svg, config, drawingArea, relativeZero, absoluteMax, max, min, zero }: { id: string, svg: any, config: any, drawingArea: any, relativeZero: number, absoluteMax: number, max: number, min: number, zero: any }) {

    const positiveStep = closestDecimal(max / 5);
    const positiveSteps = [];
    for (let i = 5; i > 0; i -= 1) {
        const value = positiveStep * i;
        positiveSteps.push({
            y: zero.y1 - (drawingArea.height * ((positiveStep * i) / absoluteMax)),
            value
        });
    }
    const negativeStep = closestDecimal(min / 5);
    const negativeSteps = [];
    for (let i = 5; i >= 0; i -= 1) {
        const value = Math.abs(negativeStep) * i;
        negativeSteps.push({
            y: zero.y1 + (drawingArea.height * ((Math.abs(negativeStep) * i) / absoluteMax)),
            value: -value
        });
    }
    [...positiveSteps, ...negativeSteps].forEach((step: any) => {
        const yLabel = spawnNS(SvgElement.TEXT);
        addTo(yLabel, SvgAttribute.FILL, config.grid.yLabels.color);
        addTo(yLabel, "font-size", config.grid.yLabels.fontSize);
        addTo(yLabel, "font-weight", config.grid.yLabels.bold ? "bold" : "normal");
        addTo(yLabel, SvgAttribute.X, drawingArea.left - 12 + config.grid.yLabels.offsetX);
        addTo(yLabel, SvgAttribute.Y, step.y + config.grid.yLabels.fontSize / 3);
        addTo(yLabel, SvgAttribute.TEXT_ANCHOR, "end");
        yLabel.textContent = Number(step.value.toFixed(config.grid.yLabels.rounding)).toLocaleString();

        const yTick = spawnNS(SvgElement.LINE);
        addTo(yTick, SvgAttribute.STROKE, config.grid.stroke);
        addTo(yTick, SvgAttribute.STROKE_WIDTH, 1);
        addTo(yTick, SvgAttribute.X1, drawingArea.left);
        addTo(yTick, SvgAttribute.X2, drawingArea.left - 6);
        addTo(yTick, SvgAttribute.Y1, step.y);
        addTo(yTick, SvgAttribute.Y2, step.y);
        if (step.value > max || step.value < min) return;
        [yLabel, yTick].forEach((el: any) => svg.appendChild(el));
    });
}

function createXLabels({ id, state, config, drawingArea, svg, maxSeries, slot }: { id: any, state: any, config: any, drawingArea: any, svg: any, maxSeries: number, slot: number }) {

    console.log({ slot })

    for (let i = 0; i < maxSeries; i += 1) {
        const xLabel = spawnNS(SvgElement.TEXT);
        addTo(xLabel, SvgAttribute.X, drawingArea.left + (slot * i) + (slot / 2));
        addTo(xLabel, SvgAttribute.Y, drawingArea.bottom + 12 + config.grid.xLabels.fontSize + config.grid.xLabels.offsetY);
        addTo(xLabel, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(xLabel, "font-size", config.grid.xLabels.fontSize);
        addTo(xLabel, SvgAttribute.FILL, config.grid.xLabels.color);
        addTo(xLabel, "font-weight", config.grid.xLabels.bold ? 'bold' : 'normal');
        xLabel.textContent = config.grid.xLabels.values[i];
        if (!config.grid.xLabels.showOnlyFirstAndLast || (config.grid.xLabels.showOnlyFirstAndLast && (i === 0 || i === maxSeries - 1))) {
            svg.appendChild(xLabel);
        }
    }
}

export function makeXyGrid({ id, state, relativeZero, absoluteMax, max, min, maxSeries, slot }: { id: string, state: any, relativeZero: number, absoluteMax: number, max: number, min: number, maxSeries: number, slot: number }) {
    const drawingArea = state[id].drawingArea;
    const config = state[id].config;
    const svg = state[id].svg;

    const x = spawnNS(SvgElement.LINE);
    addTo(x, SvgAttribute.X1, drawingArea.left);
    addTo(x, SvgAttribute.X2, drawingArea.right);
    addTo(x, SvgAttribute.Y1, drawingArea.bottom);
    addTo(x, SvgAttribute.Y2, drawingArea.bottom);
    addTo(x, SvgAttribute.STROKE, config.grid.stroke);
    addTo(x, SvgAttribute.STROKE_WIDTH, config.grid.strokeWidth);

    const y = spawnNS(SvgElement.LINE);
    addTo(y, SvgAttribute.X1, drawingArea.left);
    addTo(y, SvgAttribute.X2, drawingArea.left);
    addTo(y, SvgAttribute.Y1, drawingArea.top);
    addTo(y, SvgAttribute.Y2, drawingArea.bottom);
    addTo(y, SvgAttribute.STROKE, config.grid.stroke);
    addTo(y, SvgAttribute.STROKE_WIDTH, config.grid.strokeWidth);

    [x, y].forEach(line => svg.appendChild(line));

    const zero = {
        x1: drawingArea.left,
        x2: drawingArea.right,
        y1: drawingArea.bottom - (drawingArea.height * (relativeZero / absoluteMax)),
        y2: drawingArea.bottom - (drawingArea.height * (relativeZero / absoluteMax)),
    };

    if (state[id].relativeZero > 0) {
        const zeroLine = spawnNS(SvgElement.LINE);
        addTo(zeroLine, SvgAttribute.X1, zero.x1);
        addTo(zeroLine, SvgAttribute.X2, zero.x2);
        addTo(zeroLine, SvgAttribute.Y1, zero.y1);
        addTo(zeroLine, SvgAttribute.Y2, zero.y2);
        addTo(zeroLine, SvgAttribute.STROKE, config.line.zeroLine.stroke);
        addTo(zeroLine, SvgAttribute.STROKE_WIDTH, config.line.zeroLine.strokeWidth);
        addTo(zeroLine, "stroke-dasharray", config.line.zeroLine.strokeWidth * 2);
        svg.appendChild(zeroLine);
    }

    if (config.grid.yLabels.show && state[id].segregatedDatasets.length < state[id].dataset.length) {
        createYLabels({
            id,
            svg,
            config,
            drawingArea,
            relativeZero,
            absoluteMax,
            max,
            min,
            zero
        });
    }

    if (config.grid.xLabels.show && config.grid.xLabels.values.length) {
        createXLabels({
            id,
            state,
            config,
            drawingArea,
            svg,
            maxSeries,
            slot
        });
    }
}

export function createTraps({ id, state, maxSeries }: { id: string, state: any, maxSeries: number }) {

    const svg = state[id].svg;
    const series = state[id].dataset.map((d: any) => d.datapoints);
    const config = state[id].config;
    const drawingArea = state[id].drawingArea;

    function select(rect: any, i: number) {
        addTo(rect, SvgAttribute.FILL, `${config.line.indicator.color}${opacity[config.line.indicator.opacity]}`);
        state[id].selectedIndex = i;
        state.isTooltip = true;
        series.forEach((s: any) => {
            if (s[state[id].selectedIndex]) {
                addTo(s[state[id].selectedIndex], SvgAttribute.R, config.line.plots.radius * 1.6);
            }
        })
    }
    function unselect(rect: any) {
        addTo(rect, SvgAttribute.FILL, "transparent");
        state.isTooltip = false;
        series.forEach((s: any) => {
            if (s[state[id].selectedIndex]) {
                addTo(s[state[id].selectedIndex], SvgAttribute.R, config.line.plots.radius);
            }
        })
        state[id].selectedIndex = 0;
    }

    const traps: any = [];
    for (let i = 0; i < maxSeries; i += 1) {
        const t = spawnNS(SvgElement.RECT);
        addTo(t, SvgAttribute.X, drawingArea.left + (i * (drawingArea.width / maxSeries)));
        addTo(t, SvgAttribute.Y, drawingArea.top);
        addTo(t, "height", drawingArea.height);
        addTo(t, "width", drawingArea.width / maxSeries);
        addTo(t, SvgAttribute.FILL, "transparent");
        traps.push(t);
    }
    Array.from(traps).forEach((trap: any, i: number) => {
        trap.addEventListener("mouseover", () => select(trap, i));
        trap.addEventListener("mouseout", () => unselect(trap))
        svg.appendChild(trap);
    });
}

export function drawLine({ datasetId, id, svg, line, config, palette, index, drawingArea }: { datasetId: string, id: string, svg: SVGElement, line: any, config: any, palette: string[], index: number, drawingArea: any }) {
    const color = line.color || palette[index] || palette[index % palette.length];
    let gradientId = "";

    const thisDataset = XY_STATE[id].dataset.find((d: any) => d.datasetId === datasetId);

    if (config.line.area.useGradient) {
        const defs = spawnNS("defs") as SVGDefsElement;
        const direction = "x";
        const start = `${shiftHue(color, 0.05)}${opacity[config.line.area.opacity]}`;
        const end = `${color}${opacity[config.line.area.opacity]}`;
        gradientId = createLinearGradient({
            defs,
            direction,
            start,
            end
        })
        svg.appendChild(defs);
    }

    // CLEAR STATE
    thisDataset.lines = [];
    thisDataset.areas = [];
    thisDataset.datapoints = [];
    thisDataset.dataLabels = [];

    if (config.line.area.show) {
        const start = { x: line.plots[0].x, y: drawingArea.bottom };
        const end = { x: line.plots.at(-1).x, y: drawingArea.bottom };
        const path: any = [];
        line.plots.forEach((plot: any) => {
            path.push(`${plot.x},${plot.y} `)
        });
        const areaPath = [start.x, start.y, ...path, end.x, end.y].toString();
        const area = spawnNS(SvgElement.PATH);
        addTo(area, SvgAttribute.D, `M${areaPath}Z`);
        addTo(area, SvgAttribute.FILL, config.line.area.useGradient ? gradientId : `${color}${opacity[config.line.area.opacity]}`);
        addTo(area, SvgAttribute.STROKE, "none");
        thisDataset.areas.push(area);
        svg.appendChild(area);
    }

    line.plots.forEach((plot: any, i: number) => {
        if (i < line.plots.length - 1 && isValidUserValue(plot.value) && isValidUserValue(line.plots[i + 1].value)) {
            const l = spawnNS(SvgElement.LINE);
            addTo(l, SvgAttribute.X1, plot.x);
            addTo(l, SvgAttribute.X2, line.plots[i + 1].x);
            addTo(l, SvgAttribute.Y1, plot.y);
            addTo(l, SvgAttribute.Y2, line.plots[i + 1].y);
            addTo(l, SvgAttribute.STROKE, color);
            addTo(l, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth);
            addTo(l, SvgAttribute.STROKE_LINECAP, "round");
            addTo(l, SvgAttribute.STROKE_LINEJOIN, "round");
            thisDataset.lines.push(l);
            svg.appendChild(l);
        }
    });

    line.plots.forEach((plot: any, i: number) => {
        // plots
        if (config.line.plots.show && isValidUserValue(plot.value)) {
            const c = spawnNS(SvgElement.CIRCLE);
            addTo(c, SvgAttribute.CX, plot.x);
            addTo(c, SvgAttribute.CY, plot.y);
            addTo(c, SvgAttribute.R, config.line.plots.radius);
            addTo(c, SvgAttribute.FILL, color);
            addTo(c, SvgAttribute.STROKE, config.line.plots.stroke);
            addTo(c, SvgAttribute.STROKE_WIDTH, config.line.plots.strokeWidth);
            thisDataset.datapoints.push(c)
            svg.appendChild(c);
        }
        // data labels
        if (config.line.dataLabels.show && (Object.hasOwn(line, 'showLabels') ? line.showLabels : true)) {
            const t = spawnNS(SvgElement.TEXT);
            addTo(t, SvgAttribute.TEXT_ANCHOR, "middle");
            addTo(t, SvgAttribute.X, plot.x);
            addTo(t, SvgAttribute.Y, plot.y - config.line.dataLabels.fontSize + config.line.dataLabels.offsetY);
            addTo(t, SvgAttribute.FONT_SIZE, config.line.dataLabels.fontSize);
            addTo(t, SvgAttribute.FILL, config.line.dataLabels.color);
            t.innerHTML = Number(plot.value.toFixed(config.line.dataLabels.roundingValue)).toLocaleString();
            thisDataset.dataLabels.push(t);
            svg.appendChild(t);
        }
    });

    // TODO: createProgressionLine

    return svg;
}

export function createTooltip({ id, config }: { id: string, config: any }) {
    const svg = XY_STATE[id].svg;
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

    const series = XY_STATE[id].dataset.map((s: any) => {
        return {
            ...s,
            name: s.name,
            color: s.color,
        }
    });

    svg.addEventListener("mousemove", (e: any) => {
        tooltip.remove();
        if (XY_STATE.isTooltip) {
            document.body.appendChild(tooltip);
            const rect = tooltip.getBoundingClientRect();
            XY_STATE.clientX = e.clientX - rect.width / 2;
            XY_STATE.clientY = e.clientY + 24 + config.tooltip.offsetY;
            tooltip.style.left = `${XY_STATE.clientX + rect.width > window.innerWidth ? XY_STATE.clientX - rect.width / 2 : XY_STATE.clientX - rect.width < 0 ? XY_STATE.clientX + rect.width / 2 : XY_STATE.clientX}px`;
            tooltip.style.top = `${XY_STATE.clientY + rect.height > window.innerHeight ? XY_STATE.clientY - (rect.height) - 64 : XY_STATE.clientY}px`;
            tooltip.innerHTML = `
                <div style="display:block; width:100%; border-bottom:1px solid #e1e5e8; padding:0 0 6px 0; margin-bottom:6px;">${config.yLabels.values[XY_STATE[id].selectedIndex]}</div>
            `;
            series.forEach((s: any) => {
                tooltip.innerHTML += `<div><span style="color:${s.color};margin-right:3px;">⬤</span>${s.name} : <span style="">${s.values[XY_STATE[id].selectedIndex]}</span></div>`
            });
        }
    });

    svg.addEventListener("mouseleave", () => {
        XY_STATE.clientX = 0;
        XY_STATE.clientY = 0;
        tooltip.remove();
    });
}

const utilLine = {
    makeXyGrid,
    drawLine,
    createTraps,
    createTooltip
}

export default utilLine;
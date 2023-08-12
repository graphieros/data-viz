import { SvgAttribute, SvgElement } from "./constants";
import { spawnNS, addTo, isValidUserValue, createLinearGradient, shiftHue, grabId } from "./functions";
import { opacity } from "./config";
import STATE from "./state";

export function makeXyGrid({ chart, drawingArea, config }: { chart: SVGElement, drawingArea: any, config: any }) {
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

    [x, y].forEach(line => chart.appendChild(line));
    return chart;
}

export function createTraps({ id, config, drawingArea, maxSeries }: { id: string, config: any, drawingArea: any, maxSeries: number }) {

    const svg = grabId(id);

    function select(rect: any, i: number) {
        addTo(rect, SvgAttribute.FILL, `${config.line.indicator.color}${opacity[config.line.indicator.opacity]}`);
        STATE.charts[id].selectedSerie = i;
    }
    function unselect(rect: any) {
        addTo(rect, SvgAttribute.FILL, "transparent");
        STATE.charts[id].selectedSerie = undefined;
    }

    const traps: any = [];
    console.log({ id })
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

    return svg as unknown as SVGElement;
}

export function drawLine({ svg, line, config, palette, index, drawingArea }: { svg: SVGElement, line: any, config: any, palette: string[], index: number, drawingArea: any }) {
    const color = line.color || palette[index] || palette[index % palette.length];
    let gradientId = "";
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
        svg.appendChild(area);
    }

    line.plots.forEach((plot: any, i: number) => {
        // plots
        if (config.line.plots.show && isValidUserValue(plot.value)) {
            const c = spawnNS(SvgElement.CIRCLE);
            addTo(c, SvgAttribute.CX, plot.x);
            addTo(c, SvgAttribute.CY, plot.y);
            addTo(c, SvgAttribute.R, config.line.plots.radius);
            addTo(c, SvgAttribute.FILL, color);
            svg.appendChild(c);
        }
        // lines
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
            svg.appendChild(l);
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
            svg.appendChild(t);
        }
    })

    return svg;
}

const utilLine = {
    makeXyGrid,
    drawLine,
    createTraps
}

export default utilLine;
import { Config, DonutState, DrawingArea, GaugeDataset, GaugeStateObject, Line, Range } from "../types";
import { configGauge, opacity, palette } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, addVector, convertColorToHex, createConfig, createSvg, createUid, getDrawingArea, handleConfigOrDatasetChange, isValidUserValue, matrixTimes, parseUserConfig, parseUserDataset, rotateMatrix, spawnNS } from "./functions";
import { GAUGE_STATE } from "./state_xy";
import { createTitle } from "./title";
import { createToolkitGauge } from "./toolkit";
import { createTooltipGauge } from "./tooltip";

export function prepareGauge(parent: HTMLDivElement) {
    parent.style.width = `${parent.getAttribute("width")}`;
    const gaugeId = createUid();
    addTo(parent, "id", gaugeId);
    const userConfig = parseUserConfig(parent.dataset.visionConfig);
    const dataset = parseUserDataset(parent.dataset.visionSet);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configGauge
    });

    if (!config.useDiv) {
        config.height = config.width;
    }

    const svg = createSvg({
        parent,
        dimensions: { x: config.width, y: config.height },
        config,
        overflow: false
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: configObserver,
        id: gaugeId,
        parent,
        svg,
        dataset,
        state: GAUGE_STATE,
        idType: "gaugeId",
        observedType: "config",
        config,
        loader: loadGauge
    }));

    const datasetObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: datasetObserver,
        id: gaugeId,
        parent,
        svg,
        dataset,
        state: GAUGE_STATE,
        idType: "donutId",
        observedType: "dataset",
        config,
        loader: loadGauge
    }));

    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] });

    loadGauge({
        parent,
        config,
        dataset,
        gaugeId,
        svg
    });

    configObserver.disconnect();
    datasetObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    parent.dataset.visionSet = DataVisionAttribute.OK;
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
    datasetObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
}

export function loadGauge({
    parent,
    config,
    dataset,
    gaugeId,
    svg
}: {
    parent: HTMLDivElement,
    config: Config,
    dataset: GaugeDataset,
    gaugeId: string,
    svg: SVGElement
}) {
    const drawingArea: DrawingArea = getDrawingArea(config);
    let total = 0;
    if (dataset.base) {
        total = dataset.base;
    } else {
        total = dataset.series.map(s => s.quantity || 0).reduce((a, b) => a + b, 0)
    }

    Object.assign(GAUGE_STATE, {
        [gaugeId]: {
            parent,
            type: "gauge",
            config,
            dataset,
            mutableDataset: dataset,
            drawingArea,
            svg,
            total,
            selectedIndex: undefined,
            segregatedDatasets: [],
        },
        openTables: []
    });

    if (config.animation.show) {
        const { min } = getMinMax(dataset.series);
        let acceleration = 0;
        let speed = 0.001 * config.animation.speed;
        let activeRating = min;
        let rafId: any = null;
        function animate() {

            activeRating += speed + acceleration;
            acceleration += 0.005 * config.animation.acceleration;
            if (activeRating < dataset.value) {
                rafId = requestAnimationFrame(animate);
            } else {
                activeRating = dataset.value;
                cancelAnimationFrame(rafId)
            }
            drawGauge({
                state: GAUGE_STATE,
                id: gaugeId,
                activeRating
            })
        }
        animate();
    } else {
        drawGauge({
            state: GAUGE_STATE,
            id: gaugeId,
            activeRating: dataset.value
        });
    }
}

export function getMinMax(series: Range[]) {
    const arr: number[] = [];
    series.forEach(serie => {
        arr.push(serie.from);
        arr.push(serie.to);
    });
    return {
        min: Math.min(...arr),
        max: Math.max(...arr)
    }
}

export function getRatingColor({ dataset, activeRating }: { dataset: GaugeDataset, activeRating: number }) {
    for (let i = 0; i < dataset.series.length; i += 1) {
        const { color, from, to } = dataset.series[i];
        if (activeRating >= from && activeRating <= to) {
            return color;
        }
    }
    return "#2D353C"
}

export function createArcs([cx, cy]: any, [rx, ry]: any, [position, ratio]: any, phi: any) {
    ratio = ratio % Math.PI;
    const rotMatrix = rotateMatrix(phi);
    const [sX, sY] = addVector(
        matrixTimes(rotMatrix, [
            rx * Math.cos(position),
            ry * Math.sin(position),
        ]),
        [cx, cy]
    );
    const [eX, eY] = addVector(
        matrixTimes(rotMatrix, [
            rx * Math.cos(position + ratio),
            ry * Math.sin(position + ratio),
        ]),
        [cx, cy]
    );
    const fA = ratio > Math.PI ? 1 : 0;
    const fS = ratio > 0 ? 1 : 0;
    return {
        startX: sX,
        startY: sY,
        endX: eX,
        endY: eY,
        path: `M${sX} ${sY} A ${[
            rx,
            ry,
            (phi / (2 * Math.PI)) * 180,
            fA,
            fS,
            eX,
            eY,
        ].join(" ")}`,
    };
}

export function drawArcs(item: any, cx: number, cy: number, rx: number, ry: number) {
    let { series } = item;
    if (!item.base) {
        item.base = 1;
    }
    if (!series || item.base === 0)
        return {
            ...series,
            proportion: 0,
            ratio: 0,
            path: "",
            startX: 0,
            startY: 0,
            endX: 0,
            center: {},
        };
    const sum = [...series]
        .map((serie) => serie.value)
        .reduce((a, b) => a + b, 0);

    const ratios = [];
    let acc = 0;
    for (let i = 0; i < series.length; i += 1) {
        let proportion = series[i].value / sum;
        const ratio = proportion * (Math.PI * 0.975);
        const midProportion = series[i].value / 2 / sum;
        const midRatio = midProportion * (Math.PI);
        const { startX, startY, endX, endY, path } = createArcs(
            [cx, cy],
            [rx, ry],
            [acc, ratio],
            110
        );
        ratios.push({
            ...series[i],
            proportion,
            ratio: ratio,
            path,
            startX,
            startY,
            endX,
            endY,
            center: createArcs(
                [cx, cy],
                [rx, ry],
                [acc, midRatio],
                110
            ),
        });
        acc += ratio;
    }
    return ratios;
}

export function drawPointer({ drawingArea, activeRating, min, max, config }: { drawingArea: DrawingArea, activeRating: number, min: number, max: number, config: Config }): Line {
    const x = drawingArea.fullWidth / 2;
    const y = drawingArea.fullHeight * 0.69;
    const angle = Math.PI * ((activeRating - min) / (max - min)) + Math.PI;
    return {
        x1: x,
        y1: y,
        x2: x + (drawingArea.fullWidth / 3.2 * config.pointer.size) * Math.cos(angle),
        y2: y + (drawingArea.fullWidth / 3.2 * config.pointer.size) * Math.sin(angle)
    };
}

export function drawGauge({ state, id, activeRating }: { state: DonutState, id: string, activeRating: number }) {
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
        total
    } = state[id] as GaugeStateObject;

    svg.innerHTML = "";

    const { min, max } = getMinMax(dataset.series);
    // let activeRating = dataset.value; // TODO animation

    const mutatedDataset: GaugeDataset = {
        ...dataset,
        series: dataset.series.map((s, i) => {
            return {
                ...s,
                color: s.color ? convertColorToHex(s.color) : palette[i] || palette[i % dataset.series.length],
                quantity: s.quantity ? s.quantity : 0,
                id: createUid(),
                value: ((s.to - s.from) / max) * 100
            }
        })
    };

    state[id].mutableDataset = mutatedDataset;

    const ratingColor = getRatingColor({ dataset: mutatedDataset, activeRating });

    const arcs = drawArcs(
        mutatedDataset,
        drawingArea.centerX,
        drawingArea.fullHeight * 0.7,
        drawingArea.fullWidth / 2.5,
        drawingArea.fullWidth / 2.5
    );

    const pointerProps = drawPointer({
        drawingArea,
        activeRating,
        min,
        max,
        config
    });

    arcs.forEach((arc: any) => {
        const path = spawnNS(SvgElement.PATH);
        addTo(path, SvgAttribute.D, arc.path);
        addTo(path, SvgAttribute.FILL, "none");
        addTo(path, SvgAttribute.STROKE, arc.color);
        addTo(path, SvgAttribute.STROKE_LINECAP, "round");
        addTo(path, SvgAttribute.STROKE_WIDTH, (drawingArea.fullWidth / 16) * config.arcs.sizeProportion);
        thisDataset.datapoints.push(path);
        svg.appendChild(path);
    });

    if (config.arcs.gradient.show) {
        const defs = spawnNS("defs") as SVGDefsElement;
        const radialGradient = spawnNS(SvgElement.RADIAL_GRADIENT) as SVGRadialGradientElement;
        addTo(radialGradient, SvgAttribute.CX, "50%");
        addTo(radialGradient, SvgAttribute.CY, "50%");
        addTo(radialGradient, SvgAttribute.R, "50%");
        addTo(radialGradient, SvgAttribute.FX, "50%");
        addTo(radialGradient, SvgAttribute.FY, "50%");
        addTo(radialGradient, "id", `gauge_gradient_${id}`);

        const stop0 = spawnNS(SvgElement.STOP);
        addTo(stop0, SvgAttribute.OFFSET, "0%");
        addTo(stop0, SvgAttribute.STOP_COLOR, `${config.arcs.gradient.color}${opacity[0]}`);

        const stop1 = spawnNS(SvgElement.STOP);
        addTo(stop1, SvgAttribute.OFFSET, "82%");
        addTo(stop1, SvgAttribute.STOP_COLOR, `${config.arcs.gradient.color}${opacity[0]}`);

        const stop2 = spawnNS(SvgElement.STOP);
        addTo(stop2, SvgAttribute.OFFSET, "82%");
        addTo(stop2, SvgAttribute.STOP_COLOR, `${config.arcs.gradient.color}${opacity[config.arcs.gradient.intensity]}`);

        const stop3 = spawnNS(SvgElement.STOP);
        addTo(stop3, SvgAttribute.OFFSET, "92%");
        addTo(stop3, SvgAttribute.STOP_COLOR, `${config.arcs.gradient.color}${opacity[0]}`);

        const stop4 = spawnNS(SvgElement.STOP);
        addTo(stop4, SvgAttribute.OFFSET, "100%");
        addTo(stop4, SvgAttribute.STOP_COLOR, `${config.arcs.gradient.color}${opacity[0]}`);
        [stop0, stop1, stop2, stop3, stop4].forEach(el => radialGradient.appendChild(el));
        defs.appendChild(radialGradient);
        svg.prepend(defs);

        const gradientCircle = spawnNS(SvgElement.CIRCLE);
        addTo(gradientCircle, SvgAttribute.CX, drawingArea.centerX);
        addTo(gradientCircle, SvgAttribute.CY, drawingArea.fullHeight * 0.7);
        addTo(gradientCircle, SvgAttribute.R, drawingArea.fullWidth / 2.23);
        addTo(gradientCircle, SvgAttribute.FILL, `url(#gauge_gradient_${id})`);
        svg.appendChild(gradientCircle);

        const bottomCover = spawnNS(SvgElement.RECT);
        addTo(bottomCover, SvgAttribute.X, 0);
        addTo(bottomCover, SvgAttribute.Y, drawingArea.fullHeight * 0.69);
        addTo(bottomCover, SvgAttribute.WIDTH, drawingArea.fullWidth);
        addTo(bottomCover, SvgAttribute.HEIGHT, drawingArea.fullHeight - (drawingArea.fullHeight * 0.31));
        addTo(bottomCover, SvgAttribute.FILL, config.backgroundColor);
        svg.appendChild(bottomCover);
    }

    arcs.forEach((arc: any, i: number) => {
        const marker = spawnNS(SvgElement.CIRCLE);
        addTo(marker, SvgAttribute.CX, arc.center.startX);
        addTo(marker, SvgAttribute.CY, i === 0 ? arc.center.startY + 5 : arc.center.startY);
        addTo(marker, SvgAttribute.R, (drawingArea.fullWidth / 31) * config.arcs.sizeProportion);
        addTo(marker, SvgAttribute.FILL, config.dataLabels.markers.color);
        addTo(marker, SvgAttribute.STROKE, config.dataLabels.markers.stroke);
        addTo(marker, SvgAttribute.STROKE_WIDTH, config.dataLabels.markers.strokeWidth);
        if (config.dataLabels.markers.shadow.show) {
            marker.style.filter = `drop-shadow(0px 2px 5px ${config.dataLabels.markers.shadow.color}${opacity[config.dataLabels.markers.shadow.opacity]})`
        }

        const markerLabel = spawnNS(SvgElement.TEXT);
        addTo(markerLabel, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(markerLabel, SvgAttribute.X, arc.center.startX);
        addTo(markerLabel, SvgAttribute.Y, (i === 0 ? arc.center.startY + 5 : arc.center.startY) + config.dataLabels.markers.values.offsetY + config.dataLabels.markers.values.fontSize / 3);
        addTo(markerLabel, SvgAttribute.FONT_SIZE, config.dataLabels.markers.values.fontSize);
        addTo(markerLabel, SvgAttribute.FONT_WEIGHT, config.dataLabels.markers.values.bold ? 'bold' : 'normal');
        addTo(markerLabel, SvgAttribute.FILL, config.dataLabels.markers.values.color);
        markerLabel.innerHTML = `${arc.from.toFixed(config.dataLabels.markers.values.rounding)}`;

        [marker, markerLabel].forEach(el => svg.appendChild(el));
    });

    const lastMarker = spawnNS(SvgElement.CIRCLE);
    addTo(lastMarker, SvgAttribute.CX, drawingArea.fullWidth * 0.9);
    addTo(lastMarker, SvgAttribute.CY, drawingArea.fullHeight * 0.69);
    addTo(lastMarker, SvgAttribute.R, (drawingArea.fullWidth / 31) * config.arcs.sizeProportion);
    addTo(lastMarker, SvgAttribute.FILL, config.dataLabels.markers.color);
    addTo(lastMarker, SvgAttribute.STROKE, config.dataLabels.markers.stroke);
    addTo(lastMarker, SvgAttribute.STROKE_WIDTH, config.dataLabels.markers.strokeWidth);
    if (config.dataLabels.markers.shadow.show) {
        lastMarker.style.filter = `drop-shadow(0px 2px 5px ${config.dataLabels.markers.shadow.color}${opacity[config.dataLabels.markers.shadow.opacity]})`
    }

    const lastMarkerLabel = spawnNS(SvgElement.TEXT);
    addTo(lastMarkerLabel, SvgAttribute.TEXT_ANCHOR, "middle");
    addTo(lastMarkerLabel, SvgAttribute.X, drawingArea.fullWidth * 0.9);
    addTo(lastMarkerLabel, SvgAttribute.Y, drawingArea.fullHeight * 0.69 + config.dataLabels.markers.values.fontSize / 3);
    addTo(lastMarkerLabel, SvgAttribute.FONT_SIZE, config.dataLabels.markers.values.fontSize);
    addTo(lastMarkerLabel, SvgAttribute.FONT_WEIGHT, config.dataLabels.markers.values.bold ? 'bold' : 'normal');
    addTo(lastMarkerLabel, SvgAttribute.FILL, config.dataLabels.markers.values.color);
    lastMarkerLabel.innerHTML = `${max.toFixed(config.dataLabels.markers.values.rounding)}`;

    [lastMarker, lastMarkerLabel].forEach(el => svg.appendChild(el));

    if (!isNaN(pointerProps.x2)) {
        const pointerBg = spawnNS(SvgElement.LINE);
        addTo(pointerBg, SvgAttribute.X1, pointerProps.x1);
        addTo(pointerBg, SvgAttribute.Y1, pointerProps.y1);
        addTo(pointerBg, SvgAttribute.X2, pointerProps.x2);
        addTo(pointerBg, SvgAttribute.Y2, pointerProps.y2);
        addTo(pointerBg, SvgAttribute.STROKE, config.pointer.color);
        addTo(pointerBg, SvgAttribute.STROKE_LINECAP, "round");
        addTo(pointerBg, SvgAttribute.STROKE_WIDTH, config.pointer.strokeWidth);
        if (config.pointer.shadow.show) {
            pointerBg.style.filter = `drop-shadow(0px 2px 5px ${config.pointer.shadow.color}${opacity[config.pointer.shadow.opacity]})`
        }
        const pointer = spawnNS(SvgElement.LINE);
        addTo(pointer, SvgAttribute.X1, pointerProps.x1);
        addTo(pointer, SvgAttribute.Y1, pointerProps.y1);
        addTo(pointer, SvgAttribute.X2, pointerProps.x2);
        addTo(pointer, SvgAttribute.Y2, pointerProps.y2);
        addTo(pointer, SvgAttribute.STROKE, config.pointer.useRatingColor ? ratingColor : config.pointer.color);
        addTo(pointer, SvgAttribute.STROKE_LINECAP, "round");
        addTo(pointer, SvgAttribute.STROKE_WIDTH, config.pointer.strokeWidth * 0.7);

        [pointerBg, pointer].forEach(el => svg.appendChild(el))
    }

    const pointerCircle = spawnNS(SvgElement.CIRCLE);
    addTo(pointerCircle, SvgAttribute.CX, drawingArea.centerX);
    addTo(pointerCircle, SvgAttribute.CY, drawingArea.fullHeight * 0.69);
    addTo(pointerCircle, SvgAttribute.R, config.pointer.circle.radius);
    addTo(pointerCircle, SvgAttribute.STROKE, config.pointer.circle.stroke);
    addTo(pointerCircle, SvgAttribute.STROKE_WIDTH, config.pointer.circle.strokeWidth);
    addTo(pointerCircle, SvgAttribute.FILL, config.pointer.circle.color);
    if (config.pointer.shadow.show) {
        pointerCircle.style.filter = `drop-shadow(0px 2px 6px ${config.pointer.shadow.color}${opacity[config.pointer.shadow.opacity]})`
    }
    svg.appendChild(pointerCircle);

    const ratingLabel = spawnNS(SvgElement.TEXT);
    addTo(ratingLabel, SvgAttribute.TEXT_ANCHOR, "middle");
    addTo(ratingLabel, SvgAttribute.X, drawingArea.centerX);
    addTo(ratingLabel, SvgAttribute.Y, (drawingArea.fullHeight - ((drawingArea.fullHeight * 0.31) / 2)) + config.dataLabels.rating.fontSize / 3);
    addTo(ratingLabel, SvgAttribute.FONT_WEIGHT, config.dataLabels.rating.bold ? 'bold' : 'normal');
    addTo(ratingLabel, SvgAttribute.FONT_SIZE, config.dataLabels.rating.fontSize);
    addTo(ratingLabel, SvgAttribute.FILL, config.dataLabels.rating.useRatingColor ? ratingColor : config.dataLabels.rating.color);

    ratingLabel.innerHTML = `${isValidUserValue(activeRating) && activeRating > 0 && config.dataLabels.rating.showPlusSign ? '+' : ''}${isValidUserValue(activeRating) ? Number(activeRating.toFixed(config.dataLabels.rating.rounding)).toLocaleString() : '-'}`;

    svg.appendChild(ratingLabel);

    function hover(index: number) {
        thisDataset.datapoints.filter((_: any, i: number) => i !== index).forEach((el: any) => {
            el.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        thisDataset.dataLabels.filter((_: any, i: number) => i !== index).forEach((el: any) => {
            el.style.filter = "blur(3px) opacity(50%) grayscale(100%)";
        });
        thisDataset.datapoints.filter((_: any, i: number) => i === index).forEach((el: any) => {
            if (config.arcs.selected.useDropShadow) {
                el.style.filter = `drop-shadow(0px 3px 6px ${dataset.series[index].color}${opacity[50]})`;
            }
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
        })
    }

    // traps
    arcs.forEach((arc: any, i: number) => {
        const path = spawnNS(SvgElement.PATH);
        addTo(path, SvgAttribute.D, arc.path);
        addTo(path, SvgAttribute.FILL, "none");
        addTo(path, SvgAttribute.STROKE, "transparent");
        addTo(path, SvgAttribute.STROKE_LINECAP, "round");
        addTo(path, SvgAttribute.STROKE_WIDTH, (drawingArea.fullWidth / 16) * config.arcs.sizeProportion);
        path.addEventListener("mouseover", () => hover(i));
        path.addEventListener("mouseout", quit)
        thisDataset.traps.push({
            element: path,
            datasetId: arc.id
        });
        svg.appendChild(path);

        if (config.tooltip.show) {
            createTooltipGauge({
                id,
                state,
                parent,
                total
            })
        }
    });

    if (config.title.show) {
        createTitle({
            id,
            state
        });
    }

    if (config.toolkit.show) {
        createToolkitGauge({
            id,
            config,
            dataset: mutatedDataset,
            parent,
            total
        })
    }

}

const gauge = {
    prepareGauge,
    drawGauge
}

export default gauge;
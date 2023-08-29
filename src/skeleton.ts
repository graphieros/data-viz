import { Config, SkeletonState, SkeletonStateObj } from "../types";
import { configSkeleton, opacity } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, createConfig, createSvg, createUid, handleConfigOrDatasetChange, parseUserConfig, spawnNS } from "./functions";
import { SKELETON_STATE } from "./state_xy";

export function handleActiveChange({
    mutations,
    observer,
    parent
}: {
    mutations: MutationRecord[],
    observer: MutationObserver,
    parent: HTMLDivElement
}) {
    for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === DataVisionAttribute.SKELETON_ACTIVE) {
            try {
                parent.style.display = `${parent.dataset.visionSkeletonActive === 'true' ? 'initial' : 'none'}`;
            } catch (error) {
                console.error(`Data Vision exception. Invalid value passed to the data-vision-skeleton-active attribute. Available options are 'true' or 'false'`);
            }
        }
    }
}

export function handleSkeletonTypeChange({
    mutations,
    observer,
    parent,
    config,
    id,
    svg,
    loader
}: {
    mutations: MutationRecord[],
    observer: MutationObserver,
    parent: HTMLDivElement,
    config: Config,
    id: string,
    svg: SVGElement,
    loader: (...args: any[]) => void
}) {
    for (const mutation of mutations) {

        if (mutation.type === "attributes" && mutation.attributeName === DataVisionAttribute.SKELETON) {
            console.log({ mutation });
            try {
                loader({
                    parent,
                    config,
                    skeletonId: id,
                    svg
                });
            } catch (error) {
                console.error(`Data Vision exception. Invalid value passed to the data-vision-skeleton attribute.`)
            }
        }
    }
}

export function prepareSkeleton(parent: HTMLDivElement) {
    if (parent.id) {
        parent.innerHTML = "";
        parent.removeAttribute("id");
    }
    parent.style.width = `${parent.getAttribute("width")}`;
    const skeletonId = createUid();
    addTo(parent, "id", skeletonId);
    const userConfig = parseUserConfig(parent.dataset.visionConfig);

    const config: Config = createConfig({
        userConfig,
        defaultConfig: configSkeleton
    });

    const skeletonType = parent.dataset.visionSkeleton;

    const dimensions = {
        x: 0,
        y: 0
    }

    switch (skeletonType) {
        case 'line':
            dimensions.x = 100;
            dimensions.y = 70;
            break;
        case 'bar':
            dimensions.x = 100;
            dimensions.y = 70;
            break;
        case "donut":
            dimensions.x = 400;
            dimensions.y = 400;
            break;
        case "waffle":
            dimensions.x = 100;
            dimensions.y = 100;
            break;
        case "gauge":
            dimensions.x = 400;
            dimensions.y = 400;
            break;
        case "radial-bar":
            dimensions.x = 400;
            dimensions.y = 400;
            break;
        case "vertical-bar":
            dimensions.x = 100;
            dimensions.y = 100;
            break;
        default:
            break;
    }

    const svg = createSvg({
        parent,
        dimensions,
        config
    });

    const configObserver: MutationObserver = new MutationObserver(mutations => handleConfigOrDatasetChange({
        mutations,
        observer: configObserver,
        id: skeletonId,
        parent,
        svg,
        config,
        dataset: [],
        state: SKELETON_STATE,
        idType: "skeletonId",
        observedType: "config",
        loader: loadSkeleton
    }));

    const activeObserver: MutationObserver = new MutationObserver(mutations => handleActiveChange({
        mutations,
        observer: activeObserver,
        parent
    }));

    const typeObserver: MutationObserver = new MutationObserver(mutations => handleSkeletonTypeChange({
        mutations,
        observer: typeObserver,
        parent,
        config,
        id: skeletonId,
        svg,
        loader: loadSkeleton
    }));

    activeObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.SKELETON_ACTIVE] });
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    typeObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.SKELETON] });

    loadSkeleton({
        parent,
        config,
        skeletonId,
        svg
    });

    activeObserver.disconnect();
    configObserver.disconnect();
    typeObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    activeObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.SKELETON_ACTIVE] });
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
    typeObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.SKELETON] });
}

export function loadSkeleton({
    parent,
    config,
    skeletonId,
    svg
}: {
    parent: HTMLDivElement,
    config: Config,
    skeletonId: string;
    svg: SVGElement
}) {

    Object.assign(SKELETON_STATE, {
        [skeletonId]: {
            parent,
            type: "skeleton",
            config,
            dataset: [],
            mutableDataset: [],
            svg,
        }
    });

    const isActive = parent.dataset.visionSkeletonActive === "true";
    parent.style.display = `${isActive ? 'initial' : 'none'}`;

    drawSkeleton({
        state: SKELETON_STATE,
        id: skeletonId
    });
}

export function drawSkeleton({ state, id }: { state: SkeletonState, id: string }) {
    let {
        parent,
        svg,
        config
    } = state[id] as SkeletonStateObj;

    svg.innerHTML = "";

    if (config.animated) {
        parent.classList.add("data-vision-skeleton-animated");
    }

    const type = parent.dataset.visionSkeleton;
    const dimensions = { x: 1, y: 1 };

    switch (type) {
        case 'line':
            dimensions.x = 100;
            dimensions.y = 70;
            break;
        case 'bar':
            dimensions.x = 100;
            dimensions.y = 70;
            break;
        case "donut":
            dimensions.x = 400;
            dimensions.y = 400;
            break;
        case "waffle":
            dimensions.x = 100;
            dimensions.y = 100;
            break;
        case "gauge":
            dimensions.x = 400;
            dimensions.y = 400;
            break;
        case "radial-bar":
            dimensions.x = 400;
            dimensions.y = 400;
            break;
        case "vertical-bar":
            dimensions.x = 100;
            dimensions.y = 100;
            break;
        default:
            break;
    }

    addTo(svg, SvgAttribute.VIEWBOX, `0 0 ${dimensions.x} ${dimensions.y}`);

    if (type && ["line", "bar"].includes(type)) {
        const axisX = spawnNS(SvgElement.LINE);
        addTo(axisX, SvgAttribute.X1, 3);
        addTo(axisX, SvgAttribute.X2, 3);
        addTo(axisX, SvgAttribute.Y1, 3);
        addTo(axisX, SvgAttribute.Y2, 67);
        addTo(axisX, SvgAttribute.STROKE, config[type].color);
        addTo(axisX, SvgAttribute.STROKE_WIDTH, config[type].strokeWidth);
        addTo(axisX, SvgAttribute.STROKE_LINECAP, "round");

        const axisY = spawnNS(SvgElement.LINE);
        addTo(axisY, SvgAttribute.X1, 3);
        addTo(axisY, SvgAttribute.X2, 97);
        addTo(axisY, SvgAttribute.Y1, 67);
        addTo(axisY, SvgAttribute.Y2, 67);
        addTo(axisY, SvgAttribute.STROKE, config[type].color);
        addTo(axisY, SvgAttribute.STROKE_WIDTH, config[type].strokeWidth);
        addTo(axisY, SvgAttribute.STROKE_LINECAP, "round");

        [axisX, axisY].forEach(el => svg.appendChild(el));
    }

    if (type === "line") {
        const path = spawnNS(SvgElement.PATH);
        addTo(path, SvgAttribute.D, 'M 9,60, 22,50 35,55 48,36 61,40 74,25 87,26 90,12');
        addTo(path, SvgAttribute.STROKE, config.line.color);
        addTo(path, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth);
        addTo(path, SvgAttribute.STROKE_LINECAP, "round");
        addTo(path, SvgAttribute.STROKE_LINEJOIN, "round");
        addTo(path, SvgAttribute.FILL, "none");

        const c0 = spawnNS(SvgElement.CIRCLE);
        addTo(c0, SvgAttribute.CX, 9);
        addTo(c0, SvgAttribute.CY, 60);
        addTo(c0, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c0, SvgAttribute.FILL, config.line.color);
        addTo(c0, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c0, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c1 = spawnNS(SvgElement.CIRCLE);
        addTo(c1, SvgAttribute.CX, 22);
        addTo(c1, SvgAttribute.CY, 50);
        addTo(c1, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c1, SvgAttribute.FILL, config.line.color);
        addTo(c1, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c1, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c2 = spawnNS(SvgElement.CIRCLE);
        addTo(c2, SvgAttribute.CX, 35);
        addTo(c2, SvgAttribute.CY, 55);
        addTo(c2, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c2, SvgAttribute.FILL, config.line.color);
        addTo(c2, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c2, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c3 = spawnNS(SvgElement.CIRCLE);
        addTo(c3, SvgAttribute.CX, 48);
        addTo(c3, SvgAttribute.CY, 36);
        addTo(c3, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c3, SvgAttribute.FILL, config.line.color);
        addTo(c3, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c3, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c4 = spawnNS(SvgElement.CIRCLE);
        addTo(c4, SvgAttribute.CX, 61);
        addTo(c4, SvgAttribute.CY, 40);
        addTo(c4, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c4, SvgAttribute.FILL, config.line.color);
        addTo(c4, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c4, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c5 = spawnNS(SvgElement.CIRCLE);
        addTo(c5, SvgAttribute.CX, 74);
        addTo(c5, SvgAttribute.CY, 25);
        addTo(c5, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c5, SvgAttribute.FILL, config.line.color);
        addTo(c5, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c5, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c6 = spawnNS(SvgElement.CIRCLE);
        addTo(c6, SvgAttribute.CX, 87);
        addTo(c6, SvgAttribute.CY, 26);
        addTo(c6, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c6, SvgAttribute.FILL, config.line.color);
        addTo(c6, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c6, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c7 = spawnNS(SvgElement.CIRCLE);
        addTo(c7, SvgAttribute.CX, 90);
        addTo(c7, SvgAttribute.CY, 12);
        addTo(c7, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c7, SvgAttribute.FILL, config.line.color);
        addTo(c7, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c7, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        [path, c0, c1, c2, c3, c4, c5, c6, c7].forEach(el => svg.appendChild(el));
    }

    if (type === "bar") {
        const bars = [60, 50, 55, 36, 40, 25, 26, 12];
        bars.forEach((bar, i) => {
            const rect = spawnNS(SvgElement.RECT);
            addTo(rect, SvgAttribute.FILL, config.bar.color);
            addTo(rect, SvgAttribute.X, 6 + (11.2 * i));
            addTo(rect, SvgAttribute.Y, bar);
            addTo(rect, SvgAttribute.RX, 1);
            addTo(rect, SvgAttribute.STROKE, "none");
            addTo(rect, SvgAttribute.HEIGHT, 67 - bar);
            addTo(rect, SvgAttribute.WIDTH, 9);
            svg.appendChild(rect);
        });
    }

    if (type === "donut") {
        const arc0 = spawnNS(SvgElement.PATH);
        addTo(arc0, SvgAttribute.STROKE, config.donut.color);
        addTo(arc0, SvgAttribute.D, "M 300, 200 A 100 100 0 0 1 113 250");

        const arc1 = spawnNS(SvgElement.PATH);
        addTo(arc1, SvgAttribute.STROKE, `${config.donut.color}${opacity[60]}`);
        addTo(arc1, SvgAttribute.D, "M 113 250 A 100 100 0 0 1 250 113");

        const arc2 = spawnNS(SvgElement.PATH);
        addTo(arc2, SvgAttribute.STROKE, `${config.donut.color}${opacity[80]}`);
        addTo(arc2, SvgAttribute.D, "M 250 113 A 100 100 0 0 1 300 200");

        [arc0, arc1, arc2].forEach(arc => {
            addTo(arc, SvgAttribute.FILL, "none");
            addTo(arc, SvgAttribute.STROKE_WIDTH, config.donut.strokeWidth);
            svg.appendChild(arc);
        });
    }

    if (type === "waffle") {
        for (let i = 0; i < 10; i += 1) {
            for (let j = 0; j < 10; j += 1) {
                const rect0 = spawnNS(SvgElement.RECT);
                addTo(rect0, SvgAttribute.X, 3 + (j * 9.5));
                addTo(rect0, SvgAttribute.Y, 3 + (i * 9.5));
                addTo(rect0, SvgAttribute.HEIGHT, 9);
                addTo(rect0, SvgAttribute.WIDTH, 9);
                addTo(rect0, SvgAttribute.FILL, `${config.waffle.color}${opacity[30]}`);
                addTo(rect0, SvgAttribute.RX, config.waffle.borderRadius);
                svg.appendChild(rect0);
                if (i > 2) {
                    const rect1 = spawnNS(SvgElement.RECT);
                    addTo(rect1, SvgAttribute.X, 3 + (j * 9.5));
                    addTo(rect1, SvgAttribute.Y, 3 + (i * 9.5));
                    addTo(rect1, SvgAttribute.HEIGHT, 9);
                    addTo(rect1, SvgAttribute.WIDTH, 9);
                    addTo(rect1, SvgAttribute.FILL, `${config.waffle.color}${opacity[30]}`);
                    addTo(rect1, SvgAttribute.RX, config.waffle.borderRadius);
                    svg.appendChild(rect1);
                }
                if (i > 6) {
                    const rect2 = spawnNS(SvgElement.RECT);
                    addTo(rect2, SvgAttribute.X, 3 + (j * 9.5));
                    addTo(rect2, SvgAttribute.Y, 3 + (i * 9.5));
                    addTo(rect2, SvgAttribute.HEIGHT, 9);
                    addTo(rect2, SvgAttribute.WIDTH, 9);
                    addTo(rect2, SvgAttribute.FILL, `${config.waffle.color}${opacity[70]}`);
                    addTo(rect2, SvgAttribute.RX, config.waffle.borderRadius);
                    svg.appendChild(rect2);
                }
            }
        }
    }

    if (type === "gauge") {
        const arc = spawnNS(SvgElement.PATH);
        addTo(arc, SvgAttribute.FILL, "none");
        addTo(arc, SvgAttribute.STROKE, config.gauge.color);
        addTo(arc, SvgAttribute.STROKE_WIDTH, config.gauge.strokeWidth);
        addTo(arc, SvgAttribute.STROKE_LINECAP, "round");
        addTo(arc, SvgAttribute.D, "M 82 255 A 120 120 0 1 1 318 255");

        const circle = spawnNS(SvgElement.CIRCLE);
        addTo(circle, SvgAttribute.CX, 200);
        addTo(circle, SvgAttribute.CY, 256);
        addTo(circle, SvgAttribute.FILL, config.gauge.color);
        addTo(circle, SvgAttribute.R, 12);
        addTo(circle, SvgAttribute.STROKE, "none");

        const pointer = spawnNS(SvgElement.LINE);
        addTo(pointer, SvgAttribute.X1, 200);
        addTo(pointer, SvgAttribute.X2, 250);
        addTo(pointer, SvgAttribute.Y1, 256);
        addTo(pointer, SvgAttribute.Y2, 160);
        addTo(pointer, SvgAttribute.STROKE, config.gauge.color);
        addTo(pointer, SvgAttribute.STROKE_WIDTH, 8);
        addTo(pointer, SvgAttribute.STROKE_LINECAP, "round");

        [arc, circle, pointer].forEach(el => svg.appendChild(el));
    }

    if (type === "radial-bar") {
        const arc0 = spawnNS(SvgElement.PATH);
        addTo(arc0, SvgAttribute.STROKE, config.radialBar.color);
        addTo(arc0, SvgAttribute.D, "M 200 60 A 140 140 0 1 1 60 200");

        const arc1 = spawnNS(SvgElement.PATH);
        addTo(arc1, SvgAttribute.STROKE, `${config.radialBar.color}${opacity[60]}`);
        addTo(arc1, SvgAttribute.D, "M 200 100 A 100 100 0 1 1 100 200");

        const arc2 = spawnNS(SvgElement.PATH);
        addTo(arc2, SvgAttribute.STROKE, `${config.radialBar.color}${opacity[40]}`);
        addTo(arc2, SvgAttribute.D, "M 200 140 A 60 60 0 1 1 140 200");

        [arc0, arc1, arc2].forEach(arc => {
            addTo(arc, SvgAttribute.FILL, "none");
            addTo(arc, SvgAttribute.STROKE_LINECAP, "round");
            addTo(arc, SvgAttribute.STROKE_WIDTH, 20);
            svg.appendChild(arc);
        });
    }

    if (type === "vertical-bar") {
        const axis = spawnNS(SvgElement.LINE);
        addTo(axis, SvgAttribute.X1, 3);
        addTo(axis, SvgAttribute.Y1, 3);
        addTo(axis, SvgAttribute.X2, 3);
        addTo(axis, SvgAttribute.Y2, 97);
        addTo(axis, SvgAttribute.STROKE, config.verticalBar.color);
        addTo(axis, SvgAttribute.STROKE_WIDTH, 1);
        svg.appendChild(axis);

        for (let i = 0; i < 6; i += 1) {
            const rect = spawnNS(SvgElement.RECT);
            addTo(rect, SvgAttribute.X, 3)
            addTo(rect, SvgAttribute.Y, 5 + (i * 15.6));
            addTo(rect, SvgAttribute.HEIGHT, 12);
            addTo(rect, SvgAttribute.WIDTH, 94 - (94 * i / 6));
            addTo(rect, SvgAttribute.FILL, config.verticalBar.color);
            addTo(rect, SvgAttribute.RX, 1);
            svg.appendChild(rect);
        }
    }
}

const skeleton = {
    prepareSkeleton
}

export default skeleton;
import { Config, SkeletonState, SkeletonStateObj } from "../types";
import { configSkeleton } from "./config";
import { DataVisionAttribute, SvgAttribute, SvgElement } from "./constants";
import { addTo, createConfig, createSvg, createUid, getDrawingArea, handleConfigOrDatasetChange, parseUserConfig, spawnNS } from "./functions";
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

export function prepareSkeleton(parent: HTMLDivElement) {
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
    }))

    activeObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.SKELETON_ACTIVE] });
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });

    loadSkeleton({
        parent,
        config,
        skeletonId,
        svg
    });

    activeObserver.disconnect();
    configObserver.disconnect();
    parent.dataset.visionConfig = DataVisionAttribute.OK;
    activeObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.SKELETON_ACTIVE] });
    configObserver.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] });
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
    const type = parent.dataset.visionSkeleton;

    if (type === "line") {
        const axisX = spawnNS(SvgElement.LINE);
        addTo(axisX, SvgAttribute.X1, 3);
        addTo(axisX, SvgAttribute.X2, 3);
        addTo(axisX, SvgAttribute.Y1, 3);
        addTo(axisX, SvgAttribute.Y2, 67);
        addTo(axisX, SvgAttribute.STROKE, config.line.stroke);
        addTo(axisX, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth);
        addTo(axisX, SvgAttribute.STROKE_LINECAP, "round");

        const axisY = spawnNS(SvgElement.LINE);
        addTo(axisY, SvgAttribute.X1, 3);
        addTo(axisY, SvgAttribute.X2, 97);
        addTo(axisY, SvgAttribute.Y1, 67);
        addTo(axisY, SvgAttribute.Y2, 67);
        addTo(axisY, SvgAttribute.STROKE, config.line.stroke);
        addTo(axisY, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth);
        addTo(axisY, SvgAttribute.STROKE_LINECAP, "round");

        const path = spawnNS(SvgElement.PATH);
        addTo(path, SvgAttribute.D, 'M 9,60, 22,50 35,55 48,36 61,40 74,25 87,26 90,12');
        addTo(path, SvgAttribute.STROKE, config.line.stroke);
        addTo(path, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth);
        addTo(path, SvgAttribute.STROKE_LINECAP, "round");
        addTo(path, SvgAttribute.STROKE_LINEJOIN, "round");
        addTo(path, SvgAttribute.FILL, "none");

        const c0 = spawnNS(SvgElement.CIRCLE);
        addTo(c0, SvgAttribute.CX, 9);
        addTo(c0, SvgAttribute.CY, 60);
        addTo(c0, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c0, SvgAttribute.FILL, config.line.stroke);
        addTo(c0, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c0, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c1 = spawnNS(SvgElement.CIRCLE);
        addTo(c1, SvgAttribute.CX, 22);
        addTo(c1, SvgAttribute.CY, 50);
        addTo(c1, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c1, SvgAttribute.FILL, config.line.stroke);
        addTo(c1, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c1, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c2 = spawnNS(SvgElement.CIRCLE);
        addTo(c2, SvgAttribute.CX, 35);
        addTo(c2, SvgAttribute.CY, 55);
        addTo(c2, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c2, SvgAttribute.FILL, config.line.stroke);
        addTo(c2, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c2, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c3 = spawnNS(SvgElement.CIRCLE);
        addTo(c3, SvgAttribute.CX, 48);
        addTo(c3, SvgAttribute.CY, 36);
        addTo(c3, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c3, SvgAttribute.FILL, config.line.stroke);
        addTo(c3, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c3, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c4 = spawnNS(SvgElement.CIRCLE);
        addTo(c4, SvgAttribute.CX, 61);
        addTo(c4, SvgAttribute.CY, 40);
        addTo(c4, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c4, SvgAttribute.FILL, config.line.stroke);
        addTo(c4, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c4, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c5 = spawnNS(SvgElement.CIRCLE);
        addTo(c5, SvgAttribute.CX, 74);
        addTo(c5, SvgAttribute.CY, 25);
        addTo(c5, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c5, SvgAttribute.FILL, config.line.stroke);
        addTo(c5, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c5, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c6 = spawnNS(SvgElement.CIRCLE);
        addTo(c6, SvgAttribute.CX, 87);
        addTo(c6, SvgAttribute.CY, 26);
        addTo(c6, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c6, SvgAttribute.FILL, config.line.stroke);
        addTo(c6, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c6, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        const c7 = spawnNS(SvgElement.CIRCLE);
        addTo(c7, SvgAttribute.CX, 90);
        addTo(c7, SvgAttribute.CY, 12);
        addTo(c7, SvgAttribute.R, config.line.strokeWidth * 1.2);
        addTo(c7, SvgAttribute.FILL, config.line.stroke);
        addTo(c7, SvgAttribute.STROKE, config.backgroundColor);
        addTo(c7, SvgAttribute.STROKE_WIDTH, config.line.strokeWidth / 2);

        [axisX, axisY, path, c0, c1, c2, c3, c4, c5, c6, c7].forEach(el => svg.appendChild(el));
    }
}

const skeleton = {
    prepareSkeleton
}

export default skeleton;
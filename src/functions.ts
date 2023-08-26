import { Config, DonutDatasetItem, DonutState, DrawingArea, GaugeDataset, GaugeState, RadialBarDatasetItem, RadialBarState, SkeletonState, UnknownObj, VerticalDatasetItem, VerticalState, WaffleDatasetItem, WaffleState, XyDatasetItem, XyState } from "../types";
import { configDonut, configGauge, configRadialBar, configSkeleton, configVerticalBar, configWaffle, configXy, opacity, palette } from "./config";
import { DataVisionAttribute, SvgAttribute } from "./constants";

/** Shorthand for element.setAttribute
 * 
 * @param element 
 * @param attribute 
 * @param value 
 */
export function addTo(element: HTMLElement | SVGElement, attribute: string, value: string | number) {
    return element.setAttribute(attribute, String(value));
}

/** Apply ellipsis on a string depending on a limit
 * 
 * @param text - string to apply the ellipsis on
 * @param limit - number over which exceeding text will be replaced with '...'
 * @returns the text with allipsis applied on the char limit
 */
export function applyEllipsis(text: string, limit: number) {
    if (text.length < limit) return text;
    return `${text.slice(0, limit)}...`;
}

/** Generates a unique id
 * 
 * @returns a unique string id
 */
export function createUid() {
    let d = new Date().getTime();//Timestamp
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export function findClosestAncestorByClassName(element: { parentElement: any; className: string | string[]; }, className: string) {
    while ((element = element.parentElement) && element.className.indexOf(className) < 0);
    return element;
}

export function findClosestNumberInArray(arr: number[], num: number) {
    return arr.reduce((prev, curr) => Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
}

export function getCssColor(cssClass: string) {
    const regex = /\[([a-zA-Z]+#[a-fA-F\d]{6}|#[a-fA-F\d]{6}|rgba?\([\d, ]+\)|\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgrey|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b)]/;
    const match = regex.exec(cssClass);
    if (match) {
        return match[1];
    } else {
        return 'white';
    }
}

/** Shorthand for document.getElementById
 * 
 * @param elementId - string
 * @returns an HTMLElement
 */
export function grabId(elementId: string) {
    return document.getElementById(elementId) as HTMLElement;
}

export function logError(error: string) {
    console.error('data-viz exception:', { error })
}

/**
 * 
 * @param arr - alpra-parent children array
 * @param index - the target index
 * @returns the reordered children, starting with the target index. If the original array is [0,1,2,3] and the target index is 2, the output will be ordered as [2,3,0,1]
 */
export function reorderArrayByIndex(arr: any, index: number) {
    const thatIndex = arr.findIndex((element: any) => Number(element.dataset.index) === index);

    if (index === -1) {
        return arr;
    }

    const firstHalf = arr.slice(thatIndex);
    const secondHalf = arr.slice(0, thatIndex);

    return [...firstHalf, ...secondHalf];
}

/** Shorthand for document.createElement
 * 
 * @param element - string
 * @returns a dom element
 */
export function spawn(element: string): HTMLElement {
    return document.createElement(element);
}

export function spawnNS(element: string) {
    const xmlns = "http://www.w3.org/2000/svg";
    return document.createElementNS(xmlns, element);
}

export function setSvgAttribute(element: any, attribute: string, value: string) {
    const xmlns = "http://www.w3.org/2000/svg";
    return element.setAttributeNS(xmlns, attribute, value);
}

/** Mutate an array by swapping 2 elements
 * 
 * @param arr - any array of any datatype
 * @param from - int: the index to move
 * @param to - int: the destination index of the moved element
 * @returns the reordered array
 */
export function swapArrayPositions(arr: any, from: number, to: number) {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
}

/** Apply css transform translateX to a carousel slide
 * 
 * @param carousel - HTMLElement direct children of the main Parent element
 * @param pixels - number of pixels to deviate on the X axis
 */
export function translateX(carousel: HTMLElement, pixels: number) {
    carousel.style.transform = `translateX(${pixels}px)`;
}

/** Apply css transform translateY to the main Parent element
 * 
 * @param parent - HTMLElement the main Parent element
 * @param pixels - number of pixels to deviate on the Y axis
 */
export function translateY(parent: HTMLElement, pixels: number) {
    parent.style.transform = `translateY(${pixels}px)`;
}

export function updateCssClasses({ element, addedClasses = [], removedClasses = [] }: { element: HTMLElement, addedClasses: string[], removedClasses: string[] }) {
    if (addedClasses.length) {
        addedClasses.forEach(addedClass => {
            element.classList.add(addedClass);
        });
    }
    if (removedClasses.length) {
        removedClasses.forEach(removedClass => {
            element.classList.remove(removedClass);
        });
    }
}

/** Traverse the dom an apply a callback as long as there is a node
 * 
 * @param node - HTMLElement
 * @param func - callback applied recursively
 */
export function walkTheDOM(node: any, func: any) {
    func(node);
    node = node.firstChild;

    while (node) {
        walkTheDOM(node, func);
        node = node.NextSibling;
    }
}

export function findClassNameSuffix({ element, regex, fallback, returnAll = false }: { element: HTMLElement, regex: RegExp, fallback: string | number, returnAll?: boolean }) {
    for (let i = 0; i < element.classList.length; i += 1) {
        const className = element.classList[i];
        const match = regex.exec(className);
        if (fallback === "white") {
        }
        if (match) {
            if (returnAll) {
                return match[0]
            }
            return match[1];
        }
    }
    return fallback;
}

export function isValidUserValue(val: any) {
    return ![null, undefined, NaN, Infinity, -Infinity].includes(val);
}

export function checkArray({ userConfig, key }: { userConfig: any, key: string }) {
    return Object.hasOwn(userConfig, key) && Array.isArray(userConfig[key]) && userConfig[key].length >= 0;
}

export function checkObj({ userConfig, key }: { userConfig: any, key: string }) {
    return Object.hasOwn(userConfig, key) && !Array.isArray(userConfig[key]) && typeof userConfig[key] === "object";
}

export function parseUserConfig(userConfig: any) {
    if (typeof userConfig === "string") {
        return JSON.parse(userConfig);
    } else if (typeof userConfig === 'object') {
        return userConfig;
    } else {
        return {};
    }
}

export function parseUserDataset(userDataset: string | any[] | undefined, type = 'object') {
    if (typeof userDataset === "string") {
        const dataset = JSON.parse(userDataset);

        if (Array.isArray(dataset)) {
            return dataset.map((s: any, i: number) => {
                return {
                    ...s,
                    datasetId: createUid(),
                    color: convertColorToHex(s.color) || palette[i] || palette[i % i],
                    datapoints: [],
                    lines: [],
                    areas: [],
                    dataLabels: [],
                    donutTraps: [],
                    verticalTraps: [],
                    verticalLayers: []
                }
            });
        } else {
            return {
                ...dataset,
                datasetId: createUid(),
                datapoints: [],
                traps: []
            }
        }

    } else if (typeof userDataset === 'object') {
        if (Array.isArray(userDataset)) {
            return userDataset.map((s: any, i: number) => {
                return {
                    ...s,
                    datasetId: createUid(),
                    color: convertColorToHex(s.color) || palette[i] || palette[i % i],
                    datapoints: [],
                    lines: [],
                    areas: [],
                    dataLabels: [],
                    linearProgressions: [],
                    donutTraps: [],
                    verticalTraps: [],
                    verticalLayers: []
                }
            });
        } else {
            return {
                ...(userDataset as UnknownObj),
                datasetId: createUid(),
                datapoints: [],
                traps: []
            }
        }
    } else {
        if (type === 'object') {
            return {}
        } else {
            return [];
        }
    }
}

export function decimalToHex(decimal: any) {
    const hex = Number(decimal).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

export function hslToRgb(h: any, s: any, l: any) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hueToRgb = (p: any, q: any, t: any) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255),
    ];
}

export function convertColorToHex(color: string | null | undefined) {
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i;
    const hslRegex = /^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)$/i;

    if ([undefined, null, NaN, ""].includes(color) || !color) {
        return null;
    }

    if (color === 'transparent') {
        return "#FFFFFF00";
    }

    let match;

    if ((match = color.match(hexRegex))) {
        const [, r, g, b] = match;
        return `#${r}${g}${b}`;
    } else if ((match = color.match(rgbRegex))) {
        const [, r, g, b] = match;
        return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
    } else if ((match = color.match(hslRegex))) {
        const [, h, s, l] = match;
        const rgb = hslToRgb(Number(h), Number(s), Number(l));
        return `#${decimalToHex(rgb[0])}${decimalToHex(rgb[1])}${decimalToHex(rgb[2])}`;
    }

    return null;
}

export function convertConfigColors(config: Config) {
    for (const key in config) {
        if (typeof config[key] === 'object' && !Array.isArray(config[key]) && config[key] !== null) {
            convertConfigColors(config[key]);
        } else if (key === 'color' || key === 'backgroundColor' || key === 'stroke') {
            if (config[key] === '') {
                config[key] = '#000000';
            } else if (config[key] === 'transparent') {
                config[key] = '#FFFFFF00'
            } else {
                config[key] = convertColorToHex(config[key]);
            }
        }
    }
    return config;
}

export function treeShake({ userConfig, defaultConfig }: { userConfig: Config, defaultConfig: Config }) {
    const finalConfig = { ...defaultConfig };

    Object.keys(finalConfig).forEach(key => {
        if (Object.hasOwn(userConfig, key)) {
            const currentVal = userConfig[key]
            if (typeof currentVal === 'boolean') {
                finalConfig[key] = currentVal;
            } else if (["string", "number"].includes(typeof currentVal)) {
                if (isValidUserValue(currentVal)) {
                    finalConfig[key] = currentVal;
                }
            } else if (Array.isArray(finalConfig[key])) {
                if (checkArray({ userConfig, key })) {
                    finalConfig[key] = currentVal;
                }
            } else if (checkObj({ userConfig, key })) {
                finalConfig[key] = treeShake({
                    defaultConfig: finalConfig[key],
                    userConfig: currentVal
                });
            }
        }
    });
    return convertConfigColors(finalConfig);
}

export function createSvg({ parent, dimensions, config, overflow = true }: { parent: HTMLDivElement, dimensions: { x: number, y: number }, config: Config, overflow?: boolean }) {
    const svg = spawnNS("svg");
    svg.setAttribute('viewBox', `0 0 ${dimensions.x} ${dimensions.y}`);
    addTo(svg, "xmlns", "http://www.w3.org/2000/svg");
    addTo(svg, "preserveAspectRatio", "xMinYMid meet");
    svg.style.width = "100%";
    svg.style.background = config.backgroundColor;
    svg.style.color = config.color;
    svg.style.fontFamily = config.fontFamily;
    if (overflow) {
        svg.style.overflow = "visible";
    } else {
        svg.style.overflow = "hidden";
    }
    svg.style.userSelect = "none";
    parent.appendChild(svg);
    return svg;
}

export function createConfig({ userConfig, defaultConfig }: { userConfig: Config, defaultConfig: Config }) {
    return treeShake({
        userConfig,
        defaultConfig
    });
}

export function getDrawingArea(config: Config): DrawingArea {
    const { top, right, bottom, left } = config.padding;
    const { height, width } = config;

    return {
        top,
        left,
        right: width - right,
        bottom: height - bottom,
        width: width - left - right,
        height: height - top - bottom,
        fullWidth: width,
        fullHeight: height,
        centerX: left + ((width - left - right) / 2),
        centerY: top + ((height - top - bottom) / 2)
    }
}

export function shiftHue(hexColor: string, shiftAmount: number) {
    const hexToRgb = (hex: string) => ({
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
    });

    const rgbToHsl = ({ r, g, b }: { r: number, g: number, b: number }) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            if (h) {
                h /= 6;
            }
        }
        return { h, s, l };
    };

    const hslToRgb = ({ h, s, l }: { h: number, s: number, l: number }) => {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    };

    const rgbColor = hexToRgb(hexColor);
    const hslColor = rgbToHsl(rgbColor);
    if (hslColor.h) {
        hslColor.h += shiftAmount;
    }
    hslColor.h = ((hslColor.h || 0) + 1) % 1;

    const shiftedRgbColor = hslToRgb({ h: hslColor.h, s: hslColor.s, l: hslColor.l });
    const shiftedHexColor = `#${(shiftedRgbColor.r << 16 | shiftedRgbColor.g << 8 | shiftedRgbColor.b).toString(16).padStart(6, '0')}`;

    return shiftedHexColor;
}

export function createArrow({ color, defs, id }: { color: string, defs: SVGDefsElement, id: string }) {
    const marker = spawnNS("marker");
    addTo(marker, "id", `arrow_${id}`);
    addTo(marker, "markerWidth", 7);
    addTo(marker, "markerHeight", 7);
    addTo(marker, "refX", 0);
    addTo(marker, "refY", 3.5);
    addTo(marker, "orient", "auto");

    const polygon = spawnNS("polygon");
    addTo(polygon, "points", "0 0, 7 3.5, 0 7");
    addTo(polygon, SvgAttribute.FILL, color);

    marker.appendChild(polygon);
    defs.appendChild(marker);

    return `arrow_${id}`;
}

export function createBarGradientPositive({ defs, color, opac = 100 }: { defs: SVGDefsElement, color: string, opac: number }) {
    const bg = spawnNS("linearGradient");
    const id = createUid();
    addTo(bg, SvgAttribute.X2, "0%");
    addTo(bg, SvgAttribute.Y2, "100%");
    addTo(bg, "id", id);

    const stop1 = spawnNS("stop") as SVGStopElement;
    addTo(stop1, "offset", "0%");
    addTo(stop1, "stop-color", `${color}${opacity[opac]}`);

    const stop2 = spawnNS("stop") as SVGStopElement;
    addTo(stop2, "offset", "62%");
    addTo(stop2, "stop-color", `${shiftHue(color, 0.02)}${opacity[opac]}`);

    const stop3 = spawnNS("stop") as SVGStopElement;
    addTo(stop3, "offset", "100%");
    addTo(stop3, "stop-color", `${shiftHue(color, 0.05)}${opacity[opac]}`);

    [stop1, stop2, stop3].forEach((stop: SVGStopElement) => bg.appendChild(stop));
    defs.appendChild(bg);
    return `url(#${id})`;
}

export function createBarGradientNegative({ defs, color, opac = 100 }: { defs: SVGDefsElement, color: string, opac: number }) {
    const bg = spawnNS("linearGradient");
    const id = createUid();
    addTo(bg, SvgAttribute.X2, "0%");
    addTo(bg, SvgAttribute.Y2, "100%");
    addTo(bg, "id", id);

    const stop1 = spawnNS("stop") as SVGStopElement;
    addTo(stop1, "offset", "0%");
    addTo(stop1, "stop-color", `${shiftHue(color, 0.05)}${opacity[opac]}`);

    const stop2 = spawnNS("stop") as SVGStopElement;
    addTo(stop2, "offset", "38%");
    addTo(stop2, "stop-color", `${shiftHue(color, 0.02)}${opacity[opac]}`);

    const stop3 = spawnNS("stop") as SVGStopElement;
    addTo(stop3, "offset", "100%");
    addTo(stop3, "stop-color", `${color}${opacity[opac]}`);

    [stop1, stop2, stop3].forEach((stop: SVGStopElement) => bg.appendChild(stop));
    defs.appendChild(bg);
    return `url(#${id})`;
}

export function createLinearGradient({ defs, direction, start, end }: { defs: SVGDefsElement, direction: "x" | "y", start: string, end: string }) {
    const lg = spawnNS("linearGradient");

    const id = createUid();

    if (direction === 'x') {
        addTo(lg, SvgAttribute.X1, "0%");
        addTo(lg, SvgAttribute.X2, "100%");
        addTo(lg, SvgAttribute.Y1, "0%");
        addTo(lg, SvgAttribute.Y2, "0%");
        addTo(lg, "id", id);
    }

    const stop1 = spawnNS("stop");
    addTo(stop1, "offset", "0%");
    addTo(stop1, "stop-color", start);

    const stop2 = spawnNS("stop");
    addTo(stop2, "offset", "100%");
    addTo(stop2, "stop-color", end);

    [stop1, stop2].forEach(s => lg.appendChild(s));

    defs.appendChild(lg);
    return `url(#${id})`;
}

export function closestDecimal(val: number) {
    if (val === 0) return 0;

    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(val)));
    const powerOf10 = 10 ** orderOfMagnitude;

    let roundedValue;
    if (val < 0) {
        roundedValue = Math.round(val / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(val / powerOf10) * powerOf10;
    }

    return roundedValue;
}

export function calcLinearProgression(plots: { x: number, y: number, value: number }[]) {
    let x1, y1, x2, y2;
    const len = plots.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    for (const { x, y } of plots) {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }
    const slope = (len * sumXY - sumX * sumY) / (len * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / len;
    x1 = plots[0].x;
    x2 = plots[len - 1].x;
    y1 = slope * x1 + intercept;
    y2 = slope * x2 + intercept;

    const trend = calcPercentageTrend(plots.map(p => p.value));

    return { x1, y1, x2, y2, slope, trend };
}

export function calcPercentageTrend(arr: number[]) {
    const initialNumber = arr[0];
    const lastNumber = arr[arr.length - 1];
    const overallChange = lastNumber - initialNumber;

    let totalMagnitude = 0;

    for (let i = 1; i < arr.length; i++) {
        const difference = Math.abs(arr[i] - arr[i - 1]);
        totalMagnitude += difference;
    }

    const percentageTrend = (overallChange / totalMagnitude) * 100;
    return percentageTrend;
}

export function makeDonut({ item, cx, cy, rx, ry }: { item: { base?: number, series: any }, cx: number, cy: number, rx: number, ry: number }) {
    let { series } = item;
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
        const ratio = proportion * (Math.PI * 1.9999); // (Math.PI * 2) fails to display a donut with only one value > 0 as it goes full circle again
        // midProportion & midRatio are used to find the midpoint of the arc to display markers
        const midProportion = series[i].value / 2 / sum;
        const midRatio = midProportion * (Math.PI * 2);
        const { startX, startY, endX, endY, path } = createArc(
            [cx, cy],
            [rx, ry],
            [acc, ratio],
            105.25
        );

        ratios.push({
            cx,
            cy,
            ...series[i],
            proportion,
            ratio: ratio,
            path,
            startX,
            startY,
            endX,
            endY,
            center: createArc(
                [cx, cy],
                [rx * 1.45, ry * 1.45],
                [acc, midRatio],
                105.25
            ), // center of the arc, to display the marker. rx & ry are larger to be displayed with a slight offset
        });
        acc += ratio;
    }
    return ratios;
}

export function addVector([a1, a2]: any, [b1, b2]: [number, number]) {
    return [a1 + b1, a2 + b2];
}

export function matrixTimes([[a, b], [c, d]]: any, [x, y]: [number, number]) {
    return [a * x + b * y, c * x + d * y];
}

export function rotateMatrix(x: number) {
    return [
        [Math.cos(x), -Math.sin(x)],
        [Math.sin(x), Math.cos(x)],
    ];
}

export function createArc([cx, cy]: any, [rx, ry]: any, [position, ratio]: [number, number], phi: number) {
    ratio = ratio % (2 * Math.PI);
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
            (phi / (2 * Math.PI)) * 360,
            fA,
            fS,
            eX,
            eY,
        ].join(" ")}`,
    };
}

export function handleConfigOrDatasetChange({
    mutations,
    observer,
    dataset,
    config,
    id,
    state,
    parent,
    svg,
    observedType,
    idType,
    loader
}: {
    mutations: MutationRecord[],
    observer: MutationObserver,
    dataset: XyDatasetItem[] | DonutDatasetItem[] | VerticalDatasetItem[] | GaugeDataset | RadialBarDatasetItem[] | WaffleDatasetItem[],
    id: string,
    config: Config,
    state: XyState | DonutState | VerticalState | GaugeState | RadialBarState | WaffleState | SkeletonState,
    parent: HTMLDivElement,
    svg: SVGElement,
    observedType: "dataset" | "config",
    idType: "xyId" | "donutId" | "verticalId" | "gaugeId" | "radialId" | "waffleId" | "skeletonId",
    loader: (...args: any[]) => void
}) {
    let defaultConfig: Config;
    let overflow = true;
    switch (idType) {
        case "xyId":
            defaultConfig = configXy;
            break;
        case "donutId":
            defaultConfig = configDonut;
            break;
        case "verticalId":
            defaultConfig = configVerticalBar;
            break;
        case "gaugeId":
            defaultConfig = configGauge;
            overflow = false
            break;
        case "radialId":
            defaultConfig = configRadialBar;
            break;
        case "waffleId":
            defaultConfig = configWaffle;
            break;
        case "skeletonId":
            defaultConfig = configSkeleton;
            break;
        default:
            return;
    }
    for (const mutation of mutations) {
        if (observedType === "config") {
            if (mutation.type === 'attributes' && mutation.attributeName === DataVisionAttribute.CONFIG) {
                const newJSONValue = (mutation.target as HTMLElement).getAttribute(DataVisionAttribute.CONFIG);
                if (newJSONValue === DataVisionAttribute.OK || newJSONValue === null) return;
                try {
                    const newConfig = parseUserConfig(newJSONValue);
                    state[id].config = createConfig({
                        userConfig: newConfig,
                        defaultConfig
                    });

                    svg.remove();
                    parent.innerHTML = "";
                    svg = createSvg({
                        parent,
                        dimensions: { x: state[id].config.width, y: state[id].config.height },
                        config: convertConfigColors(state[id].config),
                        overflow
                    });
                    loader({
                        parent,
                        config: convertConfigColors(state[id].config),
                        dataset,
                        [idType]: id,
                        svg
                    });
                    observer.disconnect();
                    parent.dataset.visionConfig = DataVisionAttribute.OK;
                    observer.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.CONFIG] })
                } catch (error) {
                    console.error(`Data Vision exception. Invalid JSON format for ${idType} config:`, error);
                }
            }
        }

        if (observedType === "dataset") {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === DataVisionAttribute.DATASET) {
                    const newJSONValue = (mutation.target as HTMLElement).getAttribute(DataVisionAttribute.DATASET);
                    if (newJSONValue === DataVisionAttribute.OK || newJSONValue === null) return;
                    try {
                        const newDataset = JSON.parse(newJSONValue);
                        state[id].dataset = parseUserDataset(newDataset);
                        svg.remove();
                        parent.innerHTML = "";
                        svg = createSvg({
                            parent,
                            dimensions: { x: config.width, y: config.height },
                            config,
                            overflow
                        });
                        loader({
                            parent,
                            config,
                            dataset: parseUserDataset(newDataset),
                            donutId: id,
                            svg
                        });
                        observer.disconnect();
                        parent.dataset.visionConfig = DataVisionAttribute.OK;
                        observer.observe(parent, { attributes: true, attributeFilter: [DataVisionAttribute.DATASET] })
                    } catch (error) {
                        console.error(`Data Vision exception. Invalid JSON format for ${idType} dataset:`, error);
                    }
                }
            }
        }

    }
}

const utils = {
    addTo,
    applyEllipsis,
    calcLinearProgression,
    calcPercentageTrend,
    closestDecimal,
    convertColorToHex,
    createArrow,
    createBarGradientNegative,
    createBarGradientPositive,
    createConfig,
    createLinearGradient,
    createSvg,
    createUid,
    findClassNameSuffix,
    findClosestAncestorByClassName,
    getCssColor,
    getDrawingArea,
    grabId,
    isValidUserValue,
    logError,
    makeDonut,
    parseUserConfig,
    parseUserDataset,
    reorderArrayByIndex,
    setSvgAttribute,
    shiftHue,
    spawn,
    spawnNS,
    swapArrayPositions,
    translateX,
    translateY,
    updateCssClasses,
    walkTheDOM,
    handleConfigOrDatasetChange
};

export default utils;

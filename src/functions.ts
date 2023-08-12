import { palette } from "./config";
import { SvgAttribute } from "./constants";

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
        userConfig = userConfig.replaceAll(" ", "");
        return JSON.parse(userConfig);
    } else if (typeof userConfig === 'object') {
        return userConfig;
    } else {
        return {};
    }
}

export function parseUserDataset(userDataset: any, type = 'object') {
    if (typeof userDataset === "string") {
        userDataset = userDataset.replaceAll(" ", "");
        return JSON.parse(userDataset).map((s: any, i: number) => {
            return {
                ...s,
                color: s.color || palette[i] || palette[i % i],
                datapoints: []
            }
        });
    } else if (typeof userDataset === 'object') {
        return userDataset.map((s: any, i: number) => {
            return {
                ...s,
                color: s.color || palette[i] || palette[i % i],
                datapoints: []
            }
        });
    } else {
        if (type === 'object') {
            return {}
        } else {
            return [];
        }
    }
}

export function treeShake({ userConfig, defaultConfig }: { userConfig: any, defaultConfig: any }) {
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
    return finalConfig;
}

export function clearDataAttributes(node: any) {
    node.dataset.visionConfig = "ok";
    node.dataset.visionSet = "ok"
}

export function createSvg({ parent, dimensions, config }: { parent: HTMLDivElement, dimensions: { x: number, y: number }, config: any }) {
    const svg = spawnNS("svg");
    svg.setAttribute('viewBox', `0 0 ${dimensions.x} ${dimensions.y}`);
    addTo(svg, "xmlns", "http://www.w3.org/2000/svg");
    addTo(svg, "preserveAspectRatio", "xMinYMid meet");
    svg.style.width = "100%";
    svg.style.background = config.backgroundColor;
    svg.style.color = config.color;
    svg.style.fontFamily = config.fontFamily;
    parent.appendChild(svg);
    return svg;
}

export function createConfig({ userConfig, defaultConfig }: { userConfig: any, defaultConfig: any }) {
    return treeShake({
        userConfig,
        defaultConfig
    });
}

export function getDrawingArea(config: any) {
    const { top, right, bottom, left } = config.padding;
    const { height, width } = config;

    return {
        top,
        left,
        right: width - right,
        bottom: height - bottom,
        width: width - left - right,
        height: height - top - bottom
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

const utils = {
    addTo,
    applyEllipsis,
    createUid,
    findClassNameSuffix,
    findClosestAncestorByClassName,
    getCssColor,
    grabId,
    logError,
    reorderArrayByIndex,
    setSvgAttribute,
    spawn,
    spawnNS,
    swapArrayPositions,
    translateX,
    translateY,
    updateCssClasses,
    walkTheDOM,
    createSvg,
    createConfig,
    parseUserConfig,
    parseUserDataset,
    clearDataAttributes,
    getDrawingArea,
    isValidUserValue,
    createLinearGradient,
    shiftHue
};

export default utils;

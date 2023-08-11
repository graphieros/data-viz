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

/** Get an HTMLELement by its data-slide attribute id
 * 
 * @param elementId - string
 * @returns an HTMLElement
 */
export function grabByData(elementId: string) {
    return document.querySelector(`[data-slide="${elementId}"]`)
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


const utils = {
    addTo,
    applyEllipsis,
    createUid,
    findClassNameSuffix,
    findClosestAncestorByClassName,
    getCssColor,
    grabId,
    grabByData,
    logError,
    reorderArrayByIndex,
    setSvgAttribute,
    spawn,
    spawnNS,
    swapArrayPositions,
    translateX,
    translateY,
    updateCssClasses,
    walkTheDOM
};

export default utils;

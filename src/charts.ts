import {
    prepareXy
} from "./xy"


export function createCharts(attr = "") {
    const targets = document.getElementsByClassName("data-vision") as any

    if (targets.length) {

        if (!attr || attr === "data-vision-xy") {
            const type_xy = Array.from(targets).filter((node: any) => {
                return node.hasAttribute("data-vision-xy")
            });
            type_xy.forEach(line => prepareXy(line as unknown as HTMLDivElement));
        }
    }
}

const charts = {
    createCharts
}

export default charts;

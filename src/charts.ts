import { CssClass, DataVisionAttribute } from "./constants";
import {
    prepareXy
} from "./xy"


export function createCharts(attr = "") {
    const targets: HTMLCollection = document.getElementsByClassName(CssClass.DATA_VISION);

    if (targets.length) {

        if (!attr || attr === DataVisionAttribute.XY) {
            const type_xy = Array.from(targets).filter((dataVisionWrapper) => {
                return dataVisionWrapper.hasAttribute(DataVisionAttribute.XY)
            });
            type_xy.forEach(xy => prepareXy(xy as unknown as HTMLDivElement));
        }
    }
}

const charts = {
    createCharts
}

export default charts;
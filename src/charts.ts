import { CssClass, DataVisionAttribute } from "./constants";
import { prepareDonut } from "./donut";
import { prepareXy } from "./xy";
import { prepareVerticalBar } from "./verticalBar";

export function createCharts(attr = "") {
    const targets: HTMLCollection = document.getElementsByClassName(CssClass.DATA_VISION);
    // const uisStartPattern = /^[a-zA-Z0-9]{4}-/;

    if (targets.length) {

        if (!attr || attr === DataVisionAttribute.XY) {
            const type_xy = Array.from(targets).filter((dataVisionWrapper) => {
                return dataVisionWrapper.hasAttribute(DataVisionAttribute.XY)
            });
            type_xy.forEach(xy => prepareXy(xy as unknown as HTMLDivElement));
        }

        if (!attr || attr === DataVisionAttribute.DONUT) {
            const type_donut = Array.from(targets).filter((dataVisionWrapper) => {
                return dataVisionWrapper.hasAttribute(DataVisionAttribute.DONUT)
            });
            type_donut.forEach(donut => prepareDonut(donut as unknown as HTMLDivElement));
        }

        if (!attr || attr === DataVisionAttribute.VERTICAL_BAR) {
            const type_vertical_bar = Array.from(targets).filter((dataVisionWrapper) => {
                return dataVisionWrapper.hasAttribute(DataVisionAttribute.VERTICAL_BAR)
            });
            type_vertical_bar.forEach(verticalBar => prepareVerticalBar(verticalBar as unknown as HTMLDivElement));
        }
    }
}

const charts = {
    createCharts
}

export default charts;
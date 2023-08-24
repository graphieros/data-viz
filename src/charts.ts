import { CssClass, DataVisionAttribute } from "./constants";
import { prepareDonut } from "./donut";
import { prepareXy } from "./xy";
import { prepareVerticalBar } from "./verticalBar";
import { prepareGauge } from "./gauge";
import { prepareRadialBar } from "./radialBar";
import { prepareWaffle } from "./waffle";

export function canProceed(element: HTMLDivElement, type: string) {
    if (element.dataset.visionSet === "ok") {
        console.warn(`Data Vision : ${type} charts are already painted`);
        return false;
    }
    return true;
}

export function createCharts(attr = "") {
    const targets: HTMLCollection = document.getElementsByClassName(CssClass.DATA_VISION);
    // const uisStartPattern = /^[a-zA-Z0-9]{4}-/;

    if (targets.length) {

        const type_xy = Array.from(targets).filter((dataVisionWrapper) => {
            return dataVisionWrapper.hasAttribute(DataVisionAttribute.XY)
        });
        const type_donut = Array.from(targets).filter((dataVisionWrapper) => {
            return dataVisionWrapper.hasAttribute(DataVisionAttribute.DONUT)
        });
        const type_vertical_bar = Array.from(targets).filter((dataVisionWrapper) => {
            return dataVisionWrapper.hasAttribute(DataVisionAttribute.VERTICAL_BAR)
        });
        const type_gauge = Array.from(targets).filter((dataVisionWrapper) => {
            return dataVisionWrapper.hasAttribute(DataVisionAttribute.GAUGE)
        });
        const type_radial_bar = Array.from(targets).filter((dataVisionWrapper) => {
            return dataVisionWrapper.hasAttribute(DataVisionAttribute.RADIAL_BAR)
        });
        const type_waffle = Array.from(targets).filter((dataVisionWrapper) => {
            return dataVisionWrapper.hasAttribute(DataVisionAttribute.WAFFLE)
        });

        if (!attr) {
            type_xy.forEach(xy => {
                if (canProceed(xy as HTMLDivElement, "xy")) {
                    prepareXy(xy as unknown as HTMLDivElement)
                }
            });
            type_donut.forEach(donut => {
                if (canProceed(donut as HTMLDivElement, "donut")) {
                    prepareDonut(donut as unknown as HTMLDivElement)
                }
            });
            type_vertical_bar.forEach(verticalBar => {
                if (canProceed(verticalBar as HTMLDivElement, "vertical-bar")) {
                    prepareVerticalBar(verticalBar as unknown as HTMLDivElement)
                }
            });
            type_gauge.forEach(gauge => {
                if (canProceed(gauge as HTMLDivElement, "gauge")) {
                    prepareGauge(gauge as unknown as HTMLDivElement)
                }
            });
            type_radial_bar.forEach(radialBar => {
                if (canProceed(radialBar as HTMLDivElement, "radial-bar")) {
                    prepareRadialBar(radialBar as unknown as HTMLDivElement)
                }
            });
            type_waffle.forEach(waffle => {
                if (canProceed(waffle as HTMLDivElement, "waffle")) {
                    prepareWaffle(waffle as unknown as HTMLDivElement)
                }
            })
        }

        if (attr === DataVisionAttribute.XY) {
            type_xy.forEach(xy => {
                if (canProceed(xy as HTMLDivElement, "xy")) {
                    prepareXy(xy as unknown as HTMLDivElement)
                }
            });
        }

        if (attr === DataVisionAttribute.DONUT) {
            type_donut.forEach(donut => {
                if (canProceed(donut as HTMLDivElement, "donut")) {
                    prepareDonut(donut as unknown as HTMLDivElement)
                }
            });
        }

        if (attr === DataVisionAttribute.VERTICAL_BAR) {
            type_vertical_bar.forEach(verticalBar => {
                if (canProceed(verticalBar as HTMLDivElement, "vertical-bar")) {
                    prepareVerticalBar(verticalBar as unknown as HTMLDivElement)
                }
            });
        }

        if (attr === DataVisionAttribute.GAUGE) {
            type_gauge.forEach(gauge => {
                if (canProceed(gauge as HTMLDivElement, "gauge")) {
                    prepareGauge(gauge as unknown as HTMLDivElement)
                }
            });
        }

        if (attr === DataVisionAttribute.RADIAL_BAR) {
            type_radial_bar.forEach(radialBar => {
                if (canProceed(radialBar as HTMLDivElement, "radial-bar")) {
                    prepareRadialBar(radialBar as unknown as HTMLDivElement)
                }
            });
        }

        if (attr === DataVisionAttribute.WAFFLE) {
            type_waffle.forEach(waffle => {
                if (canProceed(waffle as HTMLDivElement, "waffle")) {
                    prepareWaffle(waffle as unknown as HTMLDivElement)
                }
            });
        }
    }
}

const charts = {
    createCharts
}

export default charts;
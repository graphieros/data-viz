import { createCharts } from "./charts";
import { W } from "../types";
import "@/css/index.css";
import { DataVisionAttribute } from "./constants";

if (typeof window !== undefined) {

    const DataVision = (function main(
        createCharts,
    ) {
        // Private
        createCharts();

        function initXy() {
            createCharts(DataVisionAttribute.XY)
        }

        function initDonuts() {
            createCharts(DataVisionAttribute.DONUT)
        }

        // Public
        return {
            initXy,
            initDonuts,
            createCharts
        }
    }(
        createCharts,
    ));

    (window as unknown as W).DataVision = DataVision;
}


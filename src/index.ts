import { createCharts } from "./charts";
import { W } from "../types";
import "@/css/index.css";

if (typeof window !== undefined) {

    const DataVision = (function main(
        createCharts,
    ) {
        // Private
        createCharts();

        function initXy() {
            createCharts("data-vision-xy")
        }

        // Public
        return {
            initXy,
            createCharts
        }
    }(
        createCharts,
    ));

    (window as unknown as W).DataVision = DataVision;
    // DataVision.createCharts();
}


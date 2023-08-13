import { createCharts } from "./charts";
import { W } from "../types";
import "@/css/index.css";

if (typeof window !== undefined) {

    const DataVision = (function main(
        createCharts,
    ) {
        // Private
        createCharts();

        function initLineCharts() {
            createCharts("data-viz-line")
        }

        // Public
        return {
            initLineCharts
        }
    }(
        createCharts,
    ));

    (window as unknown as W).DataVision = DataVision
}


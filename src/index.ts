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

        function initVerticalBars() {
            createCharts(DataVisionAttribute.VERTICAL_BAR);
        }

        function initGauges() {
            createCharts(DataVisionAttribute.GAUGE);
        }

        function initRadialBars() {
            createCharts(DataVisionAttribute.RADIAL_BAR);
        }

        function initWaffles() {
            createCharts(DataVisionAttribute.WAFFLE);
        }

        function initSkeletons() {
            createCharts(DataVisionAttribute.SKELETON);
        }

        // Public
        return {
            createCharts,
            initXy,
            initDonuts,
            initVerticalBars,
            initGauges,
            initRadialBars,
            initWaffles,
            initSkeletons
        }
    }(
        createCharts,
    ));

    (window as unknown as W).DataVision = DataVision;
}


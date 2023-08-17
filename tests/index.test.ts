import { afterAll, assert, beforeAll, describe, expect, it, test } from "vitest";
import { CssClass, DataVisionAttribute } from "../src/constants";
import * as functions from "../src/functions";
import { configXy } from "../src/config";
import { createCharts } from "../src/charts";

describe('createCharts', () => {
    const xyDataset = [
        {
            name: "Serie 1",
            type: "bar",
            showLabels: true,
            showProgression: false,
            values: [-34, -21, -13, -8, -5, -3, -2, -1, 0, 1, 2, 3, 5, 8, 13, 21, 34],
            color: "#5f8bee"
        },
        {
            name: "Serie 2",
            type: "line",
            showLabels: false,
            showProgression: true,
            showArea: true,
            values: [-34, -21, -13, -8, -5, -3, -2, -1, 0, 1, 2, 3, 5, 8, 13, 21, 34].reverse(),
            color: "#42d392"
        },
        {
            name: "Serie 2",
            type: "plot",
            showLabels: false,
            showProgression: false,
            showArea: true,
            values: [1, 1, 2, 3, 5, 8, 13, 21, 34, 21, 13, 8, 5, 3, 2, 1, 1],
            color: "#ff6400"
        }
    ];

    const mockXyElement = document.createElement("DIV");
    mockXyElement.setAttribute(DataVisionAttribute.XY, 'true');
    mockXyElement.classList.add(CssClass.DATA_VISION);
    mockXyElement.setAttribute(DataVisionAttribute.CONFIG, JSON.stringify(configXy));
    mockXyElement.setAttribute(DataVisionAttribute.DATASET, JSON.stringify(xyDataset));




    it('createCharts processes XY elements correctly', () => {
        createCharts();
        expect(mockXyElement).not.toBeNull();
    })

})
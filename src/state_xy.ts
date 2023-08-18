import { DonutState, VerticalState, XyState } from "../types"

export const XY_STATE: XyState = {
    isTooltip: false,
    clientX: 0,
    clientY: 0,
    openTables: []
}

export const DONUT_STATE: DonutState = {
    isTooltip: false,
    clientX: 0,
    clientY: 0,
    openTables: []
}

export const VERTICAL_STATE: VerticalState = {
    isTooltip: false,
    clientX: 0,
    clientY: 0,
    openTables: []
}

const state = {
    XY_STATE,
    DONUT_STATE,
    VERTICAL_STATE
}

export default state;
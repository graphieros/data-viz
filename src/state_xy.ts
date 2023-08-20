import { DonutState, GaugeState, RadialBarState, VerticalState, XyState } from "../types"

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

export const GAUGE_STATE: GaugeState = {
    isTooltip: false,
    clientX: 0,
    clientY: 0,
    openTables: []
}

export const RADIAL_BAR_STATE: RadialBarState = {
    isTooltip: false,
    clientX: 0,
    clientY: 0,
    openTables: []
}

const state = {
    XY_STATE,
    DONUT_STATE,
    VERTICAL_STATE,
    GAUGE_STATE,
    RADIAL_BAR_STATE
}

export default state;
interface State {
    [key: string]: any;
    clientX: number;
    clientY: number;
    isTooltip: boolean;
}


export const XY_STATE = {
    isTooltip: false,
    clientX: 0,
    clientY: 0
}

export default XY_STATE as unknown as State;
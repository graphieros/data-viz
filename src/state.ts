interface State {
    charts?: {
        [key: string]: {
            selectedIndex?: number
        }
    };
    clientX?: number | undefined;
    clientY?: number | undefined;
    isTooltip: boolean;
}


export const STATE = {
    charts: {},
    isTooltip: false,
}

export default STATE as State;
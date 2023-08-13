export function createLegend({ id, state }: { id: string, state: any }) {
    console.log(state[id])
}

const legend = {
    createLegend
}

export default legend;
function nuke(attr = "") {
    const all = document.getElementsByClassName("data-viz") as any;

    if (!attr) {
        Array.from(all).forEach(t => (t as HTMLElement).innerHTML = "");
    } else {
        const targets = Array.from(all).filter((node: any) => {
            return node.hasAttribute(attr)
        });
        targets.forEach(t => (t as HTMLElement).innerHTML = "");
    }

}

export function createCharts(attr = "") {
    const targets = document.getElementsByClassName("data-viz") as any

    if (targets.length) {

        if (!attr || attr === "data-viz-line") {
            const lines = Array.from(targets).filter((node: any) => {
                return node.hasAttribute("data-viz-line")
            });
            nuke("data-viz-line");
            lines.forEach(line => createLineChart(line as unknown as HTMLDivElement))
        }
    }
}

function createLineChart(node: HTMLDivElement) {
    console.log("fff", node);
}

const charts = {
    createCharts
}

export default charts;

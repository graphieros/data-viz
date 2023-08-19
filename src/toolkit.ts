import { Config, DonutDatasetItem, GaugeDataset, VerticalDatasetItem, XyDatasetItem } from "../types";
import { DomElement, Icon } from "./constants";
import { addTo, grabId, isValidUserValue, spawn } from "./functions";
import { VERTICAL_STATE, XY_STATE } from "./state_xy";

export function createCsvContent(rows: string[][]) {
    return `data:text/csv;charset=utf-8,${rows.map(r => r.join(',')).join('\n')}`;
}

export function downloadCsv({ csvContent, title = "data-vision" }: { csvContent: string, title?: string }) {
    const encodedUri = encodeURI(csvContent);
    const link = spawn(DomElement.A);
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(encodedUri);
}

export function createToolkitWrapper({ config, id }: { config: Config, id: string }) {
    const toolkitWrapper = spawn("DIV");
    addTo(toolkitWrapper, "id", `toolkit_${id}`);
    toolkitWrapper.style.fontFamily = config.fontFamily;
    toolkitWrapper.style.width = "100%";
    toolkitWrapper.style.display = "flex";
    toolkitWrapper.style.flexDirection = "row";
    toolkitWrapper.style.alignItems = "center";
    toolkitWrapper.style.justifyContent = "flex-end";
    toolkitWrapper.style.gap = "12px";
    return toolkitWrapper;
}

export function createCsvButton({ config, wrapper, csvContent }: { config: Config, wrapper: HTMLElement, csvContent: string }) {
    const exportButton = spawn("BUTTON");
    exportButton.classList.add("data-vision-button");
    const exportIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="80%" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M8 11h8v7h-8z" /><path d="M8 15h8" /><path d="M11 11v7" /></svg>`
    exportButton.innerHTML = exportIcon;
    exportButton.style.width = `${config.toolkit.buttons.size}px`;
    exportButton.style.height = `${config.toolkit.buttons.size}px`;
    exportButton.style.background = config.toolkit.buttons.backgroundColor;
    exportButton.style.color = config.toolkit.buttons.color;
    exportButton.style.outline = config.toolkit.buttons.outline;
    exportButton.addEventListener("click", () => {
        downloadCsv({
            csvContent
        });
    });
    if (config.toolkit.csvExport.show) {
        wrapper.appendChild(exportButton);
    }
}

export function createTableButton({ config, wrapper, callback, initIcon }: { config: Config, wrapper: HTMLElement, callback: () => void, initIcon: string }) {
    const tableButton = spawn("BUTTON");
    tableButton.classList.add("data-vision-button");
    tableButton.innerHTML = initIcon;
    tableButton.style.width = `${config.toolkit.buttons.size}px`;
    tableButton.style.height = `${config.toolkit.buttons.size}px`;
    tableButton.style.background = config.toolkit.buttons.backgroundColor;
    tableButton.style.color = config.toolkit.buttons.color;
    tableButton.style.outline = config.toolkit.buttons.outline;
    tableButton.addEventListener("click", callback);
    wrapper.prepend(tableButton);
    return tableButton;
}

export function createTableSkeleton({ config, id }: { config: Config, id: string }) {
    const tableWrapper = spawn("DIV");
    tableWrapper.style.width = "100%";
    tableWrapper.style.position = "relative";
    addTo(tableWrapper, "id", `table_${id}`);
    tableWrapper.style.maxHeight = "300px";
    tableWrapper.style.overflow = "auto";

    const table = spawn("TABLE");
    table.style.fontFamily = config.fontFamily;
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = spawn("THEAD");
    thead.style.userSelect = "none";
    thead.style.border = "1px solid #e1e5e8";
    thead.style.position = "sticky";
    thead.style.top = "0";
    thead.style.background = config.table.th.backgroundColor;
    thead.style.outline = "1px solid #e1e5e8";
    const tbody = spawn("TBODY");
    return { tableWrapper, table, thead, tbody };
}

export function createToolkitGauge({
    id,
    config,
    dataset,
    parent,
    total
}: {
    id: string,
    config: Config,
    dataset: GaugeDataset,
    parent: HTMLDivElement,
    total: number
}) {
    const oldToolkit = grabId(`toolkit_${id}`);
    if (oldToolkit) {
        oldToolkit.remove();
    }
    const oldTable = grabId(`table_${id}`);
    if (oldTable) {
        oldTable.remove();
    }

    let rows = [[]] as any;
    const dataRows = dataset.series.map(s => {
        return [
            `${config.table.translations.from} ${s.from} ${config.table.translations.to} ${s.to}`,
            isValidUserValue(s.quantity) ? s.quantity.toFixed(config.table.th.roundingValue) : '-',
            isValidUserValue(s.quantity / total) ? (s.quantity / total * 100).toFixed(config.table.th.roundedPercentage) : "-"
        ]
    });

    rows = [
        [`${config.title.text || "-"} ${config.title.subtitle.text ? `: ${config.title.subtitle.text}` : ''}`, "", ""],
        [`${config.table.translations.rating} : ${isValidUserValue(dataset.value) ? dataset.value.toFixed(config.table.th.roundingRating) : '-'}`, "", ""],
        ["", config.table.translations.value, config.table.translations.toTotal],
        ["Σ", total, '100'],
        ...dataRows
    ];

    const csvContent = createCsvContent(rows);
    const toolkitWrapper = createToolkitWrapper({
        config,
        id
    });

    createCsvButton({
        config,
        wrapper: toolkitWrapper,
        csvContent
    });

    const tableButton = createTableButton({
        config,
        wrapper: toolkitWrapper,
        callback: toggleTable,
        initIcon: Icon.TABLE_CLOSED
    });

    const { tableWrapper, table, thead, tbody } = createTableSkeleton({ config, id });

    const TrTh = rows.slice(0, 4);
    TrTh.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((h: any) => {
            const th = spawn("TH");
            th.innerHTML = isNaN(h) || h === '' ? h : Number(Number(h).toFixed(config.table.th.roundingValue)).toLocaleString();
            th.style.textAlign = "right";
            th.style.paddingRight = "6px";
            th.style.background = config.table.th.backgroundColor;
            th.style.color = config.table.th.color;
            th.style.fontSize = `${config.table.th.fontSize}px`;
            th.style.outline = "1px solid #e1e5e8";
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });

    const TrTd = rows.slice(4).map((row: any) => {
        return row;
    });

    TrTd.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((r: any, i: number) => {
            const td = spawn("TD");
            td.style.border = "1px solid #e1e5e8";
            td.style.textAlign = "right";
            td.style.paddingRight = "6px";
            td.style.fontVariantNumeric = "tabluar-nums";
            td.style.fontSize = `${config.table.td.fontSize}px`;
            td.style.background = config.table.td.backgroundColor;
            td.style.color = config.table.td.color;
            td.innerHTML = isNaN(r) || r === '' ? r : Number(Number(r).toFixed(i === 1 ? config.table.td.roundingPercentage : config.table.td.roundingValue)).toLocaleString();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    [thead, tbody].forEach(el => table.appendChild(el));
    tableWrapper.appendChild(table);

    if (config.table.show || VERTICAL_STATE.openTables.includes(id)) {
        tableWrapper.style.display = "flex";
        tableButton.innerHTML = Icon.TABLE_CLOSED;
        VERTICAL_STATE.openTables.push(id);
    } else {
        tableWrapper.style.display = "none";
        tableButton.innerHTML = Icon.TABLE_OPEN;
        VERTICAL_STATE.openTables = VERTICAL_STATE.openTables.filter(el => el !== id)
    }

    parent.appendChild(tableWrapper);

    function toggleTable() {
        if (tableWrapper.style.display === "none") {
            tableWrapper.style.display = "flex";
            tableButton.innerHTML = Icon.TABLE_CLOSED;
            VERTICAL_STATE.openTables.push(id);
        } else {
            tableWrapper.style.display = "none";
            tableButton.innerHTML = Icon.TABLE_OPEN;
            VERTICAL_STATE.openTables = VERTICAL_STATE.openTables.filter(el => el !== id)
        }
    }

    parent.prepend(toolkitWrapper);
}

export function createToolkitVerticalBar({ id, config, dataset, parent, total, average }: { id: string, config: Config, dataset: VerticalDatasetItem[], parent: HTMLDivElement, total: number, average: number }) {
    const oldToolkit = grabId(`toolkit_${id}`);
    if (oldToolkit) {
        oldToolkit.remove();
    }
    const oldTable = grabId(`table_${id}`);
    if (oldTable) {
        oldTable.remove();
    }

    let rows = [[]] as any;

    const dataRows = dataset.map(ds => {
        if (!ds.isChild && !ds.children) {
            return [ds.name, isNaN(ds.value) ? '-' : ds.value.toFixed(config.table.td.roundingValue), isNaN(ds.proportion) ? '-' : (ds.proportion * 100).toFixed(config.table.td.roundingPercentage), "", "", "", ""]
        } else {
            if (ds.isFirstChild) {
                return [ds.parentName, isNaN(ds.parentValue) ? '-' : ds.parentValue.toFixed(config.table.td.roundingValue), isNaN(ds.parentProportion) ? '-' : (ds.parentProportion * 100).toFixed(config.table.td.roundingPercentage), ds.name, isNaN(ds.value) ? '-' : ds.value.toFixed(config.table.td.roundingValue), isNaN(ds.proportionToParent) ? '-' : (ds.proportionToParent * 100).toFixed(config.table.td.roundingPercentage), isNaN(ds.proportion) ? '-' : (ds.proportion * 100).toFixed(config.table.td.roundingPercentage)]
            } else {
                return ["", "", "", ds.name, isNaN(ds.value) ? '-' : ds.value.toFixed(config.table.td.roundingValue), isNaN(ds.proportionToParent) ? '-' : (ds.proportionToParent * 100).toFixed(config.table.td.roundingPercentage), isNaN(ds.proportion) ? '-' : (ds.proportion * 100).toFixed(config.table.td.roundingPercentage)]
            }
        }
    });

    rows = [
        [`${config.title.text || "-"} ${config.title.subtitle.text ? `: ${config.title.subtitle.text}` : ''}`, "", "", "", "", "", ""],
        [config.table.translations.serie, config.table.translations.value, config.table.translations.toTotal, config.table.translations.child, config.table.translations.value, config.table.translations.toSerie, config.table.translations.toTotal],
        ["", `Σ ${isNaN(total) ? '-' : total.toFixed(config.table.th.roundingValue)}`, '100', "", "", "", ""],
        ["", `μ ${isNaN(average) ? '-' : average.toFixed(config.table.th.roundingAverage)}`, "", "", "", "", ""],
        ...dataRows
    ];

    const csvContent = createCsvContent(rows);
    const toolkitWrapper = createToolkitWrapper({
        config,
        id
    });

    createCsvButton({
        config,
        wrapper: toolkitWrapper,
        csvContent
    });

    const tableButton = createTableButton({
        config,
        wrapper: toolkitWrapper,
        callback: toggleTable,
        initIcon: Icon.TABLE_CLOSED
    });

    const { tableWrapper, table, thead, tbody } = createTableSkeleton({ config, id });

    const TrTh = rows.slice(0, 4);
    TrTh.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((h: any) => {
            const th = spawn("TH");
            th.innerHTML = isNaN(h) || h === '' ? h : Number(Number(h).toFixed(config.table.th.roundingValue)).toLocaleString();
            th.style.textAlign = "right";
            th.style.paddingRight = "6px";
            th.style.background = config.table.th.backgroundColor;
            th.style.color = config.table.th.color;
            th.style.fontSize = `${config.table.th.fontSize}px`;
            th.style.outline = "1px solid #e1e5e8";
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });

    const TrTd = rows.slice(4).map((row: any) => {
        return row;
    });

    TrTd.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((r: any, i: number) => {
            const td = spawn("TD");
            td.style.border = "1px solid #e1e5e8";
            td.style.textAlign = "right";
            td.style.paddingRight = "6px";
            td.style.fontVariantNumeric = "tabluar-nums";
            td.style.fontSize = `${config.table.td.fontSize}px`;
            td.style.background = config.table.td.backgroundColor;
            td.style.color = config.table.td.color;
            td.innerHTML = isNaN(r) || r === '' ? r : Number(Number(r).toFixed(i === 1 ? config.table.td.roundingPercentage : config.table.td.roundingValue)).toLocaleString();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    [thead, tbody].forEach(el => table.appendChild(el));
    tableWrapper.appendChild(table);

    if (config.table.show || VERTICAL_STATE.openTables.includes(id)) {
        tableWrapper.style.display = "flex";
        tableButton.innerHTML = Icon.TABLE_CLOSED;
        VERTICAL_STATE.openTables.push(id);
    } else {
        tableWrapper.style.display = "none";
        tableButton.innerHTML = Icon.TABLE_OPEN;
        VERTICAL_STATE.openTables = VERTICAL_STATE.openTables.filter(el => el !== id)
    }

    parent.appendChild(tableWrapper);

    function toggleTable() {
        if (tableWrapper.style.display === "none") {
            tableWrapper.style.display = "flex";
            tableButton.innerHTML = Icon.TABLE_CLOSED;
            VERTICAL_STATE.openTables.push(id);
        } else {
            tableWrapper.style.display = "none";
            tableButton.innerHTML = Icon.TABLE_OPEN;
            VERTICAL_STATE.openTables = VERTICAL_STATE.openTables.filter(el => el !== id)
        }
    }

    parent.prepend(toolkitWrapper);
}

export function createToolkitDonut({ id, config, dataset, parent, total }: { id: string, config: Config, dataset: DonutDatasetItem[], parent: HTMLDivElement, total: number }) {
    const oldToolkit = grabId(`toolkit_${id}`);
    if (oldToolkit) {
        oldToolkit.remove();
    }
    const oldTable = grabId(`table_${id}`);
    if (oldTable) {
        oldTable.remove();
    }

    let rows = [[]] as any;

    const dataRows = dataset.map(ds => {
        return [
            ds.name,
            ds.value / total * 100,
            ds.value
        ]
    })

    rows = [
        [`${config.title.text || "-"} ${config.title.subtitle.text ? `: ${config.title.subtitle.text}` : ''}`, "", ""],
        [config.table.translations.serie, config.table.translations.percentage, config.table.translations.value],
        ['Σ', 100, total],
        ...dataRows
    ];

    const csvContent = createCsvContent(rows);

    const toolkitWrapper = createToolkitWrapper({
        config,
        id
    });

    createCsvButton({
        config,
        wrapper: toolkitWrapper,
        csvContent
    });

    const tableButton = createTableButton({
        config,
        wrapper: toolkitWrapper,
        callback: toggleTable,
        initIcon: Icon.TABLE_CLOSED
    });

    const { tableWrapper, table, thead, tbody } = createTableSkeleton({ config, id });

    const TrTh = rows.slice(0, 3);
    TrTh.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((h: any) => {
            const th = spawn("TH");
            th.innerHTML = isNaN(h) || h === '' ? h : Number(Number(h).toFixed(config.table.th.roundingValue)).toLocaleString();
            th.style.textAlign = "right";
            th.style.paddingRight = "6px";
            th.style.background = config.table.th.backgroundColor;
            th.style.color = config.table.th.color;
            th.style.fontSize = `${config.table.th.fontSize}px`;
            th.style.outline = "1px solid #e1e5e8";
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });

    const TrTd = rows.slice(3).map((row: any) => {
        return row;
    });

    TrTd.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((r: any, i: number) => {
            const td = spawn("TD");
            td.style.border = "1px solid #e1e5e8";
            td.style.textAlign = "right";
            td.style.paddingRight = "6px";
            td.style.fontVariantNumeric = "tabluar-nums";
            td.style.fontSize = `${config.table.td.fontSize}px`;
            td.style.background = config.table.td.backgroundColor;
            td.style.color = config.table.td.color;
            td.innerHTML = isNaN(r) || r === '' ? r : Number(Number(r).toFixed(i === 1 ? config.table.td.roundingPercentage : config.table.td.roundingValue)).toLocaleString();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    [thead, tbody].forEach(el => table.appendChild(el));
    tableWrapper.appendChild(table);

    if (config.table.show || XY_STATE.openTables.includes(id)) {
        tableWrapper.style.display = "flex";
        tableButton.innerHTML = Icon.TABLE_CLOSED;
        XY_STATE.openTables.push(id);
    } else {
        tableWrapper.style.display = "none";
        tableButton.innerHTML = Icon.TABLE_OPEN;
        XY_STATE.openTables = XY_STATE.openTables.filter(el => el !== id)
    }

    parent.appendChild(tableWrapper);

    function toggleTable() {
        if (tableWrapper.style.display === "none") {
            tableWrapper.style.display = "flex";
            tableButton.innerHTML = Icon.TABLE_CLOSED;
            XY_STATE.openTables.push(id);
        } else {
            tableWrapper.style.display = "none";
            tableButton.innerHTML = Icon.TABLE_OPEN;
            XY_STATE.openTables = XY_STATE.openTables.filter(el => el !== id)
        }
    }

    parent.prepend(toolkitWrapper);

}

export function createToolkitXy({ id, config, dataset, parent }: { id: string, config: Config, dataset: XyDatasetItem[], parent: HTMLDivElement }) {

    const oldToolkit = grabId(`toolkit_${id}`);
    if (oldToolkit) {
        oldToolkit.remove();
    }
    const oldTable = grabId(`table_${id}`);
    if (oldTable) {
        oldTable.remove();
    }

    let dataRows;
    let rows = [[]];

    if (XY_STATE[id].type === "xy") {
        dataRows = config.grid.xLabels.values.map((v: string, i: number) => {
            return [v, dataset.map(ds => isNaN(ds.values[i]) ? "-" : ds.values[i]).join(",")]
        });
        rows = [
            [`${config.title.text || "-"} ${config.title.subtitle.text ? `: ${config.title.subtitle.text}` : ''}`, "", "", ""],
            ['', ...dataset.map(ds => ds.name)],
            ['Σ', ...dataset.map(ds => ds.values.reduce((a: number, b: number) => a + b, 0))],
            ['μ', ...dataset.map(ds => {
                const len = ds.values.length;
                return ds.values.reduce((a: number, b: number) => a + b, 0) / len
            })],
            ...dataRows
        ];
    };

    const csvContent = createCsvContent(rows);

    const toolkitWrapper = createToolkitWrapper({
        config,
        id
    });

    createCsvButton({
        config,
        wrapper: toolkitWrapper,
        csvContent
    });

    const tableButton = createTableButton({
        config,
        wrapper: toolkitWrapper,
        callback: toggleTable,
        initIcon: Icon.TABLE_CLOSED
    });

    const { tableWrapper, table, thead, tbody } = createTableSkeleton({ config, id });

    const TrTh = rows.slice(0, 4);
    TrTh.forEach(t => {
        const tr = spawn("TR");
        t.forEach(h => {
            const th = spawn("TH");
            th.innerHTML = isNaN(h) || h === '' ? h : Number(Number(h).toFixed(config.table.th.roundingValue)).toLocaleString();
            th.style.textAlign = "right";
            th.style.paddingRight = "6px";
            th.style.background = config.table.th.backgroundColor;
            th.style.color = config.table.th.color;
            th.style.fontSize = `${config.table.th.fontSize}px`;
            th.style.outline = "1px solid #e1e5e8";
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });

    const TrTd = rows.slice(4).map((row: any) => {
        return [row[0], ...row[1].split(",")];
    });

    TrTd.forEach(t => {
        const tr = spawn("TR");
        t.forEach(r => {
            const td = spawn("TD");
            td.style.border = "1px solid #e1e5e8";
            td.style.textAlign = "right";
            td.style.paddingRight = "6px";
            td.style.fontVariantNumeric = "tabluar-nums";
            td.style.fontSize = `${config.table.td.fontSize}px`;
            td.style.background = config.table.td.backgroundColor;
            td.style.color = config.table.td.color;
            td.innerHTML = isNaN(r) || r === '' ? r : Number(Number(r).toFixed(config.table.td.roundingValue)).toLocaleString();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    [thead, tbody].forEach(el => table.appendChild(el));
    tableWrapper.appendChild(table);

    if (config.table.show || XY_STATE.openTables.includes(id)) {
        tableWrapper.style.display = "flex";
        tableButton.innerHTML = Icon.TABLE_CLOSED;
        XY_STATE.openTables.push(id);
    } else {
        tableWrapper.style.display = "none";
        tableButton.innerHTML = Icon.TABLE_OPEN;
        XY_STATE.openTables = XY_STATE.openTables.filter(el => el !== id)
    }

    parent.appendChild(tableWrapper);

    function toggleTable() {
        if (tableWrapper.style.display === "none") {
            tableWrapper.style.display = "flex";
            tableButton.innerHTML = Icon.TABLE_CLOSED;
            XY_STATE.openTables.push(id);
        } else {
            tableWrapper.style.display = "none";
            tableButton.innerHTML = Icon.TABLE_OPEN;
            XY_STATE.openTables = XY_STATE.openTables.filter(el => el !== id)
        }
    }

    parent.prepend(toolkitWrapper);
}

const toolkit = {
    createToolkitXy,
    createToolkitDonut,
    createToolkitVerticalBar,
    createToolkitGauge
}

export default toolkit;
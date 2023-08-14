import { addTo, grabId, spawn } from "./functions";
import XY_STATE from "./state_xy";

export function createCsvContent(rows: string[][]) {
    return `data:text/csv;charset=utf-8,${rows.map(r => r.join(',')).join('\n')}`;
}

export function downloadCsv({ csvContent, title = "data-vision" }: { csvContent: string, title?: string }) {
    const encodedUri = encodeURI(csvContent);
    const link = spawn("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(encodedUri);
}

export function createToolkit({ id, config, dataset, parent }: { id: string, config: any, dataset: any, parent: HTMLDivElement }) {

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
            return [v, dataset.map((ds: any) => isNaN(ds.values[i]) ? "-" : ds.values[i]).join(",")]
        });
        rows = [
            ['', ...dataset.map((ds: any) => ds.name)],
            ['Σ', ...dataset.map((ds: any) => ds.values.reduce((a: number, b: number) => a + b, 0))],
            ...dataRows
        ];
    };

    const csvContent = createCsvContent(rows);

    const toolkitWrapper = spawn("DIV");
    addTo(toolkitWrapper, "id", `toolkit_${id}`);
    toolkitWrapper.style.fontFamily = config.fontFamily;
    toolkitWrapper.style.width = "100%";
    toolkitWrapper.style.display = "flex";
    toolkitWrapper.style.flexDirection = "row";
    toolkitWrapper.style.alignItems = "center";
    toolkitWrapper.style.justifyContent = "flex-end";
    toolkitWrapper.style.gap = "12px";

    // CSV BUTTON
    const exportButton = spawn("BUTTON");
    exportButton.classList.add("data-vision-button");
    const exportIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="80%" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M8 11h8v7h-8z" /><path d="M8 15h8" /><path d="M11 11v7" /></svg>`
    exportButton.innerHTML = exportIcon;
    exportButton.style.width = "32px";
    exportButton.addEventListener("click", () => {
        downloadCsv({
            csvContent
        });
    });
    toolkitWrapper.appendChild(exportButton);

    // DATA TABLE
    const tableButton = spawn("BUTTON");
    tableButton.classList.add("data-vision-button");
    const tableIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="80%" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" /></svg>`;
    const tableIconOpen = `<svg xmlns="http://www.w3.org/2000/svg"  width="80%" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10" /><path d="M3 10h18" /><path d="M10 3v18" /><path d="M16 19h6" /></svg>`;
    tableButton.innerHTML = tableIcon;
    tableButton.style.width = "32px";
    tableButton.addEventListener("click", toggleTable);
    toolkitWrapper.prepend(tableButton);

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

    const TrTh = rows.slice(0, 2);
    TrTh.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((h: any) => {
            const th = spawn("TH");
            th.innerHTML = isNaN(h) || h === '' ? h : Number(Number(h).toFixed(config.table.th.roundingValue)).toLocaleString();
            th.style.background = config.table.th.backgroundColor;
            th.style.color = config.table.th.color;
            th.style.fontSize = `${config.table.th.fontSize}px`;
            th.style.outline = "1px solid #e1e5e8";
            th.style.padding = "2px 0";
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });

    const TrTd = rows.slice(2).map((row: any) => {
        return [row[0], ...row[1].split(",")];
    });

    TrTd.forEach((t: any) => {
        const tr = spawn("TR");
        t.forEach((r: any) => {
            const td = spawn("TD");
            td.style.border = "1px solid #e1e5e8";
            td.style.textAlign = "right";
            td.style.paddingRight = "6px";
            td.style.fontVariantNumeric = "tabluar-nums";
            td.style.background = config.table.td.backgroundColor;
            td.style.color = config.table.td.color;
            td.innerHTML = isNaN(r) || r === '' ? r : Number(Number(r).toFixed(config.table.td.roundingValue)).toLocaleString();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    [thead, tbody].forEach((el: any) => table.appendChild(el));
    tableWrapper.appendChild(table);

    if (config.table.show || XY_STATE.openTables.includes(id)) {
        tableWrapper.style.display = "flex";
        tableButton.innerHTML = tableIconOpen;
        XY_STATE.openTables.push(id);
    } else {
        tableWrapper.style.display = "none";
        tableButton.innerHTML = tableIcon;
        XY_STATE.openTables = XY_STATE.openTables.filter(el => el !== id)
    }

    parent.appendChild(tableWrapper);

    function toggleTable() {
        if (tableWrapper.style.display === "none") {
            tableWrapper.style.display = "flex";
            tableButton.innerHTML = tableIconOpen;
            XY_STATE.openTables.push(id);
        } else {
            tableWrapper.style.display = "none";
            tableButton.innerHTML = tableIcon;
            XY_STATE.openTables = XY_STATE.openTables.filter(el => el !== id)
        }
    }

    parent.prepend(toolkitWrapper);
}

const toolkit = {
    createToolkit
}

export default toolkit;
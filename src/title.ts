import { SvgAttribute } from "./constants";
import { addTo, spawn, spawnNS } from "./functions";

export function createTitle({ id, state }: { id: string, state: any }) {
    const config = state[id].config;

    const hasTitleText = !!config.title.text;
    if (!hasTitleText || !config.title.show) return;

    const oldTitle = document.getElementById(`title_${id}`);
    if (oldTitle) {
        oldTitle.remove();
    }

    if (config.title.useDiv) {
        const parent = state[id].parent;
        const titleContainer = spawn("DIV");
        addTo(titleContainer, "id", `title_${id}`);
        titleContainer.style.width = "100%";
        titleContainer.style.display = "flex";
        titleContainer.style.flexDirection = "column";
        titleContainer.style.gap = "6px";
        titleContainer.style.alignItems = "center";
        titleContainer.style.justifyContent = "center";
        titleContainer.style.background = config.title.backgroundColor;
        titleContainer.style.fontFamily = config.fontFamily;
        titleContainer.style.marginBottom = `${config.title.offsetY}px`;

        const title = spawn("DIV");
        title.style.color = config.title.color;
        title.style.fontSize = `${config.title.fontSize}px`;
        title.style.fontWeight = config.title.bold ? 'bold' : 'normal';
        title.innerHTML = config.title.text;
        titleContainer.appendChild(title);

        if (config.title.subtitle.text) {
            const subtitle = spawn("DIV");
            subtitle.style.color = config.title.subtitle.color;
            subtitle.style.fontSize = `${config.title.subtitle.fontSize}px`;
            subtitle.style.fontWeight = config.title.subtitle.bold ? 'bold' : 'normal';
            subtitle.innerHTML = config.title.subtitle.text;
            titleContainer.appendChild(subtitle);
        }
        parent.prepend(titleContainer)

    } else {
        const svg = state[id].svg;
        const drawingArea = state[id].drawingArea;

        const title = spawnNS("text");
        addTo(title, SvgAttribute.X, drawingArea.fullWidth / 2);
        addTo(title, SvgAttribute.Y, `${18 + config.title.offsetY}`);
        addTo(title, SvgAttribute.TEXT_ANCHOR, "middle");
        addTo(title, "font-size", config.title.fontSize * 0.8);
        addTo(title, "fill", config.title.color);
        addTo(title, "font-weight", config.title.bold ? 'bold' : 'normal');
        title.textContent = config.title.text;
        svg.appendChild(title);

        if (config.title.subtitle.text) {
            const subtitle = spawnNS("text");
            addTo(subtitle, SvgAttribute.X, drawingArea.fullWidth / 2);
            addTo(subtitle, SvgAttribute.Y, `${18 + config.title.offsetY + (config.title.fontSize * 0.8)}`);
            addTo(subtitle, SvgAttribute.TEXT_ANCHOR, "middle");
            addTo(subtitle, "font-size", config.title.subtitle.fontSize * 0.8);
            addTo(subtitle, "fill", config.title.subtitle.color);
            addTo(subtitle, "font-weight", config.title.subtitle.bold ? 'bold' : 'normal');
            subtitle.textContent = config.title.subtitle.text;
            svg.appendChild(subtitle);
        }
    }
}

const titleg = {
    createTitle
}

export default titleg;
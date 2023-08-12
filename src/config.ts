export const palette = [
    '#3366cc',
    '#dc3912',
    '#ff9900',
    '#109618',
    '#990099',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac',
    '#b77322',
    '#16d620',
    '#b91383',
    '#f4359e',
    '#9c5935',
    '#a9c413',
    '#2a778d',
    '#668d1c',
    '#bea413',
    '#0c5922',
    '#743411',
];

export const opacity = ["00", "03", "05", "08", "0A", "0D", "0F", "12", "14", "17", "1A", "1C", "1F", "21", "24", "26", "29", "2B", "2E", "30", "33", "36", "38", "3B", "3D", "40", "42", "45", "47", "4A", "4D", "4F", "52", "54", "57", "59", "5C", "5E", "61", "63", "66", "69", "6B", "6E", "70", "73", "75", "78", "7A", "7D", "80", "82", "85", "87", "8A", "8C", "8F", "91", "94", "96", "99", "9C", "9E", "A1", "A3", "A6", "A8", "AB", "AD", "B0", "B3", "B5", "B8", "BA", "BD", "BF", "C2", "C4", "C7", "C9", "CC", "CF", "D1", "D4", "D6", "D9", "DB", "DE", "E0", "E3", "E6", "E8", "EB", "ED", "F0", "F2", "F5", "F7", "FA", "FC", "FF"];

export const configLine = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    height: 316,
    width: 500,
    padding: {
        top: 48,
        right: 24,
        bottom: 48,
        left: 48
    },
    grid: {
        show: true,
        stroke: "#e1e5e8",
        strokeWidth: 1
    },
    line: {
        strokeWidth: 2,
        plots: {
            show: true,
            radius: 3,
            strokeWidth: 1,
            stroke: "#FFFFFF"
        },
        dataLabels: {
            show: true,
            color: "#2D353C",
            fontSize: 14,
            offsetY: 0,
            roundingValue: 0,
        },
        area: {
            show: true,
            opacity: 20,
            useGradient: true,
        },
        indicator: {
            color: "#2D353C",
            opacity: 5,
        }
    },

}

const config = {
    palette,
    opacity,
    configLine,
}

export default config;
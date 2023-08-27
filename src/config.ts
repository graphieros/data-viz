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

export const configXy = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    height: 316,
    width: 500,
    toolkit: {
        show: true,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: true,
        },
    },
    padding: {
        top: 48,
        right: 24,
        bottom: 48,
        left: 48
    },
    grid: {
        show: true,
        stroke: "#e1e5e8",
        strokeWidth: 1,
        verticalSeparators: {
            show: true,
            stroke: "#e1e5e8",
            strokeWidth: 0.5
        },
        yLabels: {
            show: true,
            fontSize: 12,
            bold: false,
            offsetX: 0,
            color: "#2D353C",
            rounding: 0,
        },
        xLabels: {
            show: true,
            showOnlyFirstAndLast: true,
            values: [],
            fontSize: 8,
            bold: false,
            offsetY: 0,
            color: "#2D353C"
        }
    },
    indicator: {
        color: "#2D353C",
        opacity: 5,
    },
    linearProgression: {
        strokeWidth: 1,
        label: {
            show: true,
            fontSize: 10,
            rounding: 1,
            offsetY: 0,
            offsetX: 0
        }
    },
    bars: {
        strokeWidth: 0,
        useGradient: true,
        borderRadius: 1,
        fillOpacity: 100,
        dataLabels: {
            show: true,
            color: "#2D353C",
            fontSize: 10,
            roundingValue: 0,
            positive: {
                offsetY: 0
            },
            negative: {
                offsetY: 0
            }
        }
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
            fontSize: 10,
            offsetY: 0,
            roundingValue: 0,
        },
        area: {
            opacity: 20,
            useGradient: true,
        },
    },
    plot: {
        radius: 3,
        strokeWidth: 1,
        stroke: "#FFFFFF",
        dataLabels: {
            show: true,
            color: "#2D353C",
            fontSize: 10,
            offsetY: 0,
            roundingValue: 0,
        },
        area: {
            opacity: 20,
            useGradient: true,
        },
    },
    title: {
        useDiv: true,
        show: true,
        text: "",
        fontSize: 20,
        bold: true,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        marginTop: 0,
        offsetY: 0,
        offsetX: 0,
        subtitle: {
            text: "",
            fontSize: 16,
            bold: false,
            color: "#CCCCCC",
        }
    },
    legend: {
        useDiv: true,
        show: true,
        fontSize: 14,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        offsetY: 0,
        bold: true,
        roundingValue: 0,
        paddingY: 12,
    },
    tooltip: {
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        padding: 12,
        fontSize: 14,
        fontFamily: "inherit",
        border: "1px solid #e1e5e8",
        borderRadius: 4,
        boxShadow: "0 6px 12px -3px #2D353C33",
        offsetY: 12,
        maxWidth: 300,
        value: {
            rounding: 0,
            bold: true,
        },
        percentage: {
            show: true,
            rounding: 0,
        },
        average: {
            translation: "Average",
            show: true,
            rounding: 0
        },
        total: {
            translation: "Total",
            show: true,
            rounding: 0
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingPercentage: 0,
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 1,
            roundedPercentage: 0,
        }
    }
}

export const configDonut = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    height: 380,
    width: 500,
    useDiv: true,
    gradient: {
        show: true,
        intensity: 30,
        color: "#FFFFFF",
    },
    toolkit: {
        show: true,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: true,
        },
    },
    arcs: {
        width: 64,
        selected: {
            useDropShadow: true
        }
    },
    dataLabels: {
        hideUnder: 3,
        name: {
            useEllipsis: false,
            color: "#2D353C",
            fontSize: 12,
            bold: false,
        },
        percentage: {
            color: "#2D353C",
            fontSize: 14,
            bold: true,
            rounding: 1,
        },
        value: {
            show: false,
            rounding: 0,
        },
        markers: {
            show: true,
            strokeWidth: 1,
            radius: 3,
        }
    },
    hollow: {
        total: {
            show: true,
            label: {
                color: "#808080",
                text: "Total",
                fontSize: 18,
                bold: false,
            },
            value: {
                color: "#2D353C",
                fontSize: 20,
                bold: true,
                rounding: 0
            }
        },
        average: {
            show: true,
            label: {
                color: "#808080",
                text: "Average",
                fontSize: 18,
                bold: false,
            },
            value: {
                color: "#2D353C",
                fontSize: 20,
                bold: true,
                rounding: 1,
            }
        }
    },
    padding: {
        top: 48,
        right: 0,
        bottom: 48,
        left: 0
    },
    tooltip: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        padding: 12,
        fontSize: 14,
        fontFamily: "inherit",
        border: "1px solid #e1e5e8",
        borderRadius: 4,
        boxShadow: "0 6px 12px -3px #2D353C33",
        offsetY: 12,
        maxWidth: 300,
        percentage: {
            show: true,
            rounding: 1,
            bold: true,
        },
        value: {
            show: true,
            rounding: 0,
        }
    },
    legend: {
        show: true,
        fontSize: 14,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        bold: true,
        paddingY: 12,
    },
    title: {
        show: true,
        text: "",
        fontSize: 20,
        bold: true,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        marginTop: 0,
        offsetY: 0,
        offsetX: 0,
        subtitle: {
            text: "",
            fontSize: 16,
            bold: false,
            color: "#CCCCCC",
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingPercentage: 1,
        },
        translations: {
            serie: "Serie",
            percentage: "%",
            value: "Value"
        }
    }
}

export const configVerticalBar = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    width: 500,
    height: 1,
    useDiv: true,
    padding: {
        top: 24,
        right: 96,
        bottom: 24,
        left: 108
    },
    toolkit: {
        show: true,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: true,
        },
    },
    bars: {
        height: 28,
        gap: 3,
        borderRadius: 2,
        gradientIntensity: 40,
        fillOpacity: 100,
        strokeWidth: 0,
        gradient: {
            show: true,
            intensity: 40,
            baseColor: "#FFFFFF",
            reverse: false,
        }
    },
    indicator: {
        color: "#2D353C",
        opacity: 5,
    },
    grid: {
        show: true,
        stroke: "#e1e5e8",
        strokeWidth: 1,
        stopAtBase: true,
        dashed: true,
    },
    dataLabels: {
        names: {
            fontSize: 10,
            color: "#2D353C",
            bold: true,
            useSerieColor: true,
        },
        values: {
            fontSize: 10,
            color: "#2D353C",
            bold: true,
            offsetX: 0,
            useSerieColor: true,
            quantity: {
                show: true,
                rounding: 0
            },
            percentage: {
                show: true,
                rounding: 1,
            }
        }
    },
    tooltip: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        padding: 12,
        fontSize: 14,
        fontFamily: "inherit",
        border: "1px solid #e1e5e8",
        borderRadius: 4,
        boxShadow: "0 6px 12px -3px #2D353C33",
        offsetY: 12,
        maxWidth: 300,
        percentage: {
            show: true,
            rounding: 1,
            bold: false,
            translations: {
                toTotal: "of Total",
                of: "of"
            }
        },
        value: {
            bold: true,
            show: true,
            rounding: 0,
        },
    },
    legend: {
        show: true,
        fontSize: 14,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        bold: true,
        paddingY: 12,
    },
    title: {
        show: true,
        text: "",
        fontSize: 20,
        bold: true,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        marginTop: 0,
        offsetY: 0,
        offsetX: 0,
        subtitle: {
            text: "",
            fontSize: 16,
            bold: false,
            color: "#CCCCCC",
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingAverage: 1,
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingPercentage: 1,
        },
        translations: {
            serie: "Serie",
            value: "Value",
            toTotal: "%/Total",
            child: "Child",
            toSerie: "%/Serie"
        }
    }
}

export const configGauge = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    width: 500,
    height: 400,
    useDiv: true,
    animation: {
        show: true,
        speed: 1,
        acceleration: 1,
    },
    // don't promote padding
    padding: {
        top: 24,
        right: 0,
        bottom: 24,
        left: 0
    },
    toolkit: {
        show: true,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: true,
        },
    },
    arcs: {
        sizeProportion: 1, // don't promote
        gradient: {
            show: true,
            color: "#FFFFFF",
            intensity: 40,
        },
        selected: {
            useDropShadow: true
        }
    },
    dataLabels: {
        rating: {
            fontSize: 48,
            bold: true,
            showPlusSign: false,
            rounding: 1,
            useRatingColor: true,
            color: "#2D353C"
        },
        markers: {
            color: "#FFFFFF",
            stroke: "#2D353C",
            strokeWidth: 2,
            values: {
                fontSize: 16,
                color: "#2D353C",
                bold: true,
                rounding: 0,
                offsetY: 0
            },
            shadow: {
                show: true,
                color: "#2D353C",
                opacity: 30,
            }
        }
    },
    pointer: {
        size: 1,
        stroke: "#2D353C",
        strokeWidth: 16,
        useRatingColor: true,
        color: "#FFFFFF",
        shadow: {
            show: true,
            color: "#2D353C",
            opacity: 30,
        },
        circle: {
            radius: 12,
            stroke: "#FFFFFF",
            strokeWidth: 2,
            color: "#F6F6F6"
        }
    },
    tooltip: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        padding: 12,
        fontSize: 14,
        fontFamily: "inherit",
        border: "1px solid #e1e5e8",
        borderRadius: 4,
        boxShadow: "0 6px 12px -3px #2D353C33",
        offsetY: 12,
        maxWidth: 300,
        translations: {
            from: "From",
            to: "to"
        },
        percentage: {
            show: true,
            rounding: 1,
            bold: false,
        },
        value: {
            bold: true,
            show: true,
            rounding: 0,
        },
    },
    title: {
        show: true,
        text: "",
        fontSize: 20,
        bold: true,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        marginTop: 0,
        offsetY: 0,
        offsetX: 0,
        subtitle: {
            text: "",
            fontSize: 16,
            bold: false,
            color: "#CCCCCC",
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingRating: 1,
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingPercentage: 1,
        },
        translations: {
            rating: "Rating",
            from: "from",
            to: "to",
            value: "Value",
            toTotal: "%/total"
        }
    }
}

export const configRadialBar = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    width: 500,
    height: 400,
    useDiv: true,
    padding: {
        top: 24,
        right: 0,
        bottom: 24,
        left: 0
    },
    arcs: {
        track: {
            width: 0.62
        },
        gutter: {
            color: "#e1E5e8",
            width: 0.62
        },
    },
    toolkit: {
        show: true,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: true,
        },
    },
    dataLabels: {
        show: true,
        fontSize: 14,
        bold: true,
        useSerieColor: true,
        color: "#2D353C",
        offsetX: 0,
        percentage: {
            rounding: 1,
        }
    },
    tooltip: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        padding: 12,
        fontSize: 14,
        fontFamily: "inherit",
        border: "1px solid #e1e5e8",
        borderRadius: 4,
        boxShadow: "0 6px 12px -3px #2D353C33",
        offsetY: 12,
        maxWidth: 300,
        percentage: {
            show: true,
            rounding: 1,
            bold: true,
        },
        value: {
            bold: false,
            show: true,
            rounding: 0,
        },
    },
    title: {
        show: true,
        text: "",
        fontSize: 20,
        bold: true,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        marginTop: 0,
        offsetY: 0,
        offsetX: 0,
        subtitle: {
            text: "",
            fontSize: 16,
            bold: false,
            color: "#CCCCCC",
        }
    },
    legend: {
        show: true,
        fontSize: 14,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        bold: true,
        paddingY: 12,
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingAverage: 0,
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingPercentage: 1,
        },
        translations: {
            percentage: "%",
            value: "Value",
        }
    }
}

export const configWaffle = {
    backgroundColor: "#FFFFFF",
    color: "#2D353C",
    fontFamily: "inherit",
    width: 500,
    height: 500,
    useDiv: true,
    padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    grid: {
        size: 10,
        vertical: false,
        spaceBetween: 2
    },
    rects: {
        borderRadius: 4,
        gradient: {
            show: true,
            intensity: 30,
            baseColor: "#FFFFFF"
        }
    },
    toolkit: {
        show: true,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: true,
        },
    },
    tooltip: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        padding: 12,
        fontSize: 14,
        fontFamily: "inherit",
        border: "1px solid #e1e5e8",
        borderRadius: 4,
        boxShadow: "0 6px 12px -3px #2D353C33",
        offsetY: 12,
        maxWidth: 300,
        percentage: {
            show: true,
            rounding: 1,
            bold: true,
        },
        value: {
            bold: false,
            show: true,
            rounding: 0,
        },
    },
    title: {
        show: true,
        text: "",
        fontSize: 20,
        bold: true,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        marginTop: 0,
        offsetY: 12,
        offsetX: 0,
        subtitle: {
            text: "",
            fontSize: 16,
            bold: false,
            color: "#CCCCCC",
        }
    },
    legend: {
        show: true,
        fontSize: 14,
        color: "#2D353C",
        backgroundColor: "#FFFFFF",
        bold: true,
        paddingY: 12,
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingAverage: 0,
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            fontSize: 14,
            roundingValue: 0,
            roundingPercentage: 1,
        },
        translations: {
            serie: "Serie",
            percentage: "%",
            value: "Value"
        }
    }
}

export const configSkeleton = {
    backgroundColor: "#FFFFFF",
    animated: true,
    width: 1, // hide
    height: 1, // hide
    // hide padding
    padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    // hide toolkit
    toolkit: {
        show: false,
        buttons: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            size: 32,
            outline: "1px solid #e1e5e8",
        },
        csvExport: {
            show: false,
        },
    },
    line: {
        color: "#e1e5e8",
        strokeWidth: 1
    },
    bar: {
        color: "#e1e5e8",
        strokeWidth: 1,
    },
    donut: {
        color: "#e1e5e8",
        strokeWidth: 60
    },
    waffle: {
        color: "#e1e5e8",
        borderRadius: 2,
    },
    gauge: {
        color: "#e1e5e8",
        strokeWidth: 20,
    },
    radialBar: {
        color: "#e1e5e8",
    },
    verticalBar: {
        color: "#e1e5e8",
    }
}

const config = {
    palette,
    opacity,
    configXy,
    configDonut,
    configVerticalBar,
    configRadialBar,
    configSkeleton
}

export default config;
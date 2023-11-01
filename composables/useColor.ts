export default function useColor() {
    const colors = [
        { label: "gray", code: "#6b7280" },
        { label: "red", code: "#ef4444" },
        { label: "orange", code: "#f97316" },
        { label: "amber", code: "#f59e0b" },
        { label: "yellow", code: "#fde047" },
        { label: "lime", code: "#84cc16" },
        { label: "green", code: "#22c55e" },
        { label: "emerald", code: "#10b981" },
        { label: "teal", code: "#14b8a6" },
        { label: "cyan", code: "#06b6d4" },
        { label: "sky", code: "#0ea5e9" },
        { label: "blue", code: "#3b82f6" },
        { label: "indigo", code: "#6366f1" },
        { label: "violet", code: "#8b5cf6" },
        { label: "purple", code: "#a855f7" },
        { label: "fuchsia", code: "#d946ef" },
        { label: "pink", code: "#ec4899" }
    ]

    const getColorLabelFromCode = (code: string) => {
        return colors.find((color) => color.code === code)?.label
    }

    const getColorCodeByLabel = (label: string) => {
        return colors.find((color) => color.label === label)?.code
    }

    return {colors, getColorLabelFromCode, getColorCodeByLabel}
}
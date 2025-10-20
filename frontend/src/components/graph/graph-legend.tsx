import { RELATION_COLORS } from '@/lib/constants'

export function GraphLegend() {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Edge Types</h4>
      <div className="space-y-1.5 text-xs">
        <LegendItem color={RELATION_COLORS.PREREQ} style="solid" label="Prerequisite" />
        <LegendItem color={RELATION_COLORS.COREQ} style="dashed" label="Corequisite" />
        <LegendItem color={RELATION_COLORS.ANTIREQ} style="dotted" label="Antirequisite" />
        <LegendItem color={RELATION_COLORS.EQUIV} style="solid" label="Equivalent" />
      </div>
    </div>
  )
}

interface LegendItemProps {
  color: string
  style: 'solid' | 'dashed' | 'dotted'
  label: string
}

function LegendItem({ color, style, label }: LegendItemProps) {
  const borderStyle = style === 'solid' ? 'border-0' : style === 'dashed' ? 'border-dashed' : 'border-dotted'

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-0.5 ${style === 'solid' ? '' : `border-t-2 ${borderStyle}`}`}
        style={{
          backgroundColor: style === 'solid' ? color : 'transparent',
          borderColor: style !== 'solid' ? color : undefined,
        }}
      />
      <span>{label}</span>
    </div>
  )
}


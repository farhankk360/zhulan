import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { Structure, StructureType } from '../../types'
import { getDynastyColor } from '../../utils/dynastyUtils'
import { useLanguage } from '../../hooks/useLanguage'
import type { TranslationKey } from '../../i18n/translations'
import { formatYear } from '../../utils/formatYear'

interface Props {
  structures: Structure[]
}

const TYPE_ORDER: StructureType[] = ['palace', 'residence', 'government', 'bridge']

const TYPE_LABEL_KEYS: Record<StructureType, TranslationKey> = {
  palace: 'chart.typePalace',
  residence: 'chart.typeResidence',
  government: 'chart.typeGovernment',
  bridge: 'chart.typeBridge',
}

export default function TimelineChart({ structures }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { t, lang } = useLanguage()

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const tooltip = d3.select(tooltipRef.current)

    const margin = { top: 20, right: 20, bottom: 40, left: 130 }
    const width = 700
    const height = 260

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height)

    const x = d3.scaleLinear()
      .domain([-500, 1912])
      .range([0, width - margin.left - margin.right])

    const y = d3.scaleBand()
      .domain(TYPE_ORDER)
      .range([0, height - margin.top - margin.bottom])
      .padding(0.3)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => {
        const n = d as number
        return n < 0 ? `${Math.abs(n)} ${t('chart.bce')}` : `${n}`
      }).ticks(8))
      .call(ax => ax.selectAll('text').attr('fill', '#78716C').attr('font-size', 11))
      .call(ax => ax.selectAll('line,path').attr('stroke', '#44403C'))

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(type => t(TYPE_LABEL_KEYS[type as StructureType])))
      .call(ax => ax.selectAll('text').attr('fill', '#A8A29E').attr('font-size', 12))
      .call(ax => ax.selectAll('line,path').attr('stroke', '#44403C'))

    // Dots
    const valid = structures.filter(
      s => s.yearBuilt != null && s.yearBuilt >= -500 && s.yearBuilt <= 1912 && TYPE_ORDER.includes(s.type)
    )

    g.selectAll('circle')
      .data(valid)
      .join('circle')
      .attr('cx', d => x(d.yearBuilt))
      .attr('cy', d => (y(d.type) ?? 0) + y.bandwidth() / 2)
      .attr('r', d => d.source === 'curated' ? 6 : 4)
      .attr('fill', d => getDynastyColor(d.dynasty))
      .attr('opacity', 0.8)
      .attr('stroke', '#1C1917')
      .attr('stroke-width', 1)
      .on('mouseover', (_event, d) => {
        const name = lang === 'zh' ? d.nameChinese : d.name
        const year = formatYear(d.yearBuilt, lang)
        tooltip
          .style('opacity', '1')
          .html(`<strong>${name}</strong><br/>${d.dynasty} · ${year}`)
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 28}px`)
      })
      .on('mouseout', () => {
        tooltip.style('opacity', '0')
      })
  }, [structures, t, lang])

  return (
    <div className="relative">
      <svg ref={svgRef} />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 shadow-xl opacity-0 transition-opacity z-10"
        style={{ top: 0, left: 0 }}
      />
    </div>
  )
}

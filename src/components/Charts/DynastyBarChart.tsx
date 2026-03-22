import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { Structure } from '../../types'
import { getAllDynasties } from '../../utils/dynastyUtils'

interface Props {
  structures: Structure[]
}

export default function DynastyBarChart({ structures }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const dynasties = getAllDynasties()
    const counts = new Map<string, number>()
    structures.forEach(s => {
      counts.set(s.dynasty, (counts.get(s.dynasty) ?? 0) + 1)
    })

    const data = dynasties
      .filter(d => (counts.get(d.name) ?? 0) > 0)
      .map(d => ({ name: d.name, nameChinese: d.nameChinese, count: counts.get(d.name) ?? 0, color: d.color }))
      .sort((a, b) => b.count - a.count)

    const margin = { top: 10, right: 40, bottom: 10, left: 110 }
    const width = 580
    const barHeight = 24
    const height = data.length * barHeight + margin.top + margin.bottom

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height)

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) ?? 1])
      .range([0, width - margin.left - margin.right])

    const y = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.2)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('y', d => y(d.name) ?? 0)
      .attr('width', d => x(d.count))
      .attr('height', y.bandwidth())
      .attr('fill', d => d.color)
      .attr('rx', 3)

    g.selectAll('.label-zh')
      .data(data)
      .join('text')
      .attr('class', 'label-zh')
      .attr('x', -6)
      .attr('y', d => (y(d.name) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#D6D3D1')
      .attr('font-size', 12)
      .text(d => `${d.nameChinese} ${d.name}`)

    g.selectAll('.count-label')
      .data(data)
      .join('text')
      .attr('class', 'count-label')
      .attr('x', d => x(d.count) + 4)
      .attr('y', d => (y(d.name) ?? 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', '#78716C')
      .attr('font-size', 11)
      .text(d => d.count)
  }, [structures])

  return <svg ref={svgRef} />
}

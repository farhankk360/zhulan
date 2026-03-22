import { TileLayer } from 'react-leaflet'

const SUBDOMAINS = ['0', '1', '2', '3', '4', '5', '6', '7']

function buildTiandituUrl(layer: string, key: string): string {
  return (
    `http://t{s}.tianditu.gov.cn/${layer}/wmts` +
    `?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
    `&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles` +
    `&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${key}`
  )
}

export default function TiandituLayer() {
  const key = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_TIANDITU_KEY

  if (!key) {
    // Fallback to OpenStreetMap for local dev without API key
    return (
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    )
  }

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>'
        url={buildTiandituUrl('vec_w', key)}
        subdomains={SUBDOMAINS}
      />
      <TileLayer
        url={buildTiandituUrl('cva_w', key)}
        subdomains={SUBDOMAINS}
        opacity={1}
      />
    </>
  )
}

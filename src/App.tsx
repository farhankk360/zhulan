import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import BottomNav from './components/Layout/BottomNav'
import MapView from './views/MapView'
import TimelineView from './views/TimelineView'
import AboutView from './views/AboutView'

export default function App() {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/timeline" element={<TimelineView />} />
          <Route path="/about" element={<AboutView />} />
        </Routes>
      </main>
      {/* Footer: desktop only */}
      <Footer />
      {/* Bottom nav: mobile only */}
      <BottomNav />
    </div>
  )
}

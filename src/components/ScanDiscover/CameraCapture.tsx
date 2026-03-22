import { useRef, useState, useEffect, useCallback } from 'react'
import { compressImage } from '../../services/qwenVL'
import { useLanguage } from '../../hooks/useLanguage'

interface Props {
  onIdentify: (file: File, preview: string) => void
  onClose: () => void
  isLoading: boolean
}

type Tab = 'camera' | 'upload'

export default function CameraCapture({ onIdentify, onClose, isLoading }: Props) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>('upload')
  const [preview, setPreview] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [privacyAcked, setPrivacyAcked] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(tk => tk.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (tab === 'camera') {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream
          if (videoRef.current) videoRef.current.srcObject = stream
        })
        .catch(() => setCameraError(t('scan.cameraError')))
    } else {
      stopStream()
    }
    return stopStream
  }, [tab, stopStream, t])

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setCapturedFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    setCapturedFile(file)
  }

  function captureFromCamera() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      setPreview(URL.createObjectURL(file))
      setCapturedFile(file)
      stopStream()
    }, 'image/jpeg', 0.9)
  }

  async function handleIdentify() {
    if (!capturedFile) return
    const compressed = await compressImage(capturedFile)
    const dataUrl = await new Promise<string>(res => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.readAsDataURL(compressed)
    })
    onIdentify(compressed, dataUrl)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-stone-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700">
          <div>
            <h2 className="font-semibold text-stone-100">{t('scan.modalTitle')}</h2>
            <p className="text-xs text-stone-400">{t('scan.modalSubtitle')}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 text-2xl leading-none">&times;</button>
        </div>

        {/* Privacy notice */}
        {!privacyAcked && (
          <div className="px-5 py-4 bg-stone-800 text-xs text-stone-300 flex gap-3 items-start">
            <span className="text-amber-400 mt-0.5">ⓘ</span>
            <div>
              {t('scan.privacyNotice')}{' '}
              <button onClick={() => setPrivacyAcked(true)} className="underline text-stone-100 ml-1">{t('scan.privacyAck')}</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-stone-700">
          {(['upload', 'camera'] as Tab[]).map(tb => (
            <button
              key={tb}
              onClick={() => { setTab(tb); setPreview(null); setCapturedFile(null) }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === tb ? 'text-red-400 border-b-2 border-red-500' : 'text-stone-400 hover:text-stone-200'}`}
            >
              {tb === 'upload' ? t('scan.tabUpload') : t('scan.tabCamera')}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {preview ? (
            <div className="space-y-3">
              <img src={preview} alt="Preview" className="w-full rounded-lg object-contain max-h-64 bg-stone-800" />
              <button onClick={() => { setPreview(null); setCapturedFile(null) }} className="text-xs text-stone-400 hover:text-stone-200 underline">
                {t('scan.changeImage')}
              </button>
            </div>
          ) : tab === 'upload' ? (
            <label
              className="flex flex-col items-center justify-center border-2 border-dashed border-stone-600 rounded-xl h-40 cursor-pointer hover:border-red-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <span className="text-3xl mb-2">🏯</span>
              <span className="text-sm text-stone-400">
                {t('scan.dropPrompt')} <span className="text-red-400 underline">{t('scan.dropBrowse')}</span>
              </span>
              <span className="text-xs text-stone-500 mt-1">{t('scan.dropFormats')}</span>
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileInput} />
            </label>
          ) : (
            <div className="space-y-3">
              {cameraError ? (
                <p className="text-amber-400 text-sm text-center py-8">{cameraError}</p>
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
              )}
              {!cameraError && (
                <button onClick={captureFromCamera} className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg text-sm font-medium">
                  {t('scan.captureButton')}
                </button>
              )}
            </div>
          )}

          {capturedFile && (
            <button
              onClick={handleIdentify}
              disabled={isLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="animate-spin">⟳</span> {t('scan.identifyingButton')}</>
              ) : (
                t('scan.identifyButton')
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase/client'
import type { Job, JobStatus } from '@/types/database'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface BBox {
  north: number
  south: number
  east: number
  west: number
}

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedBBox, setSelectedBBox] = useState<BBox | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [139.6917, 35.6895], // 東京
      zoom: 15,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // 既存のジョブを読み込む
    loadJobs()

    return () => {
      map.current?.remove()
    }
  }, [])

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      if (data) {
        setJobs(data as Job[])
        // マップ上にマーカーを表示
        displayJobMarkers(data as Job[])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const displayJobMarkers = (jobList: Job[]) => {
    if (!map.current) return

    // 既存のマーカーをクリア
    const markers = document.querySelectorAll('.job-marker')
    markers.forEach(m => m.remove())

    jobList
      .filter(job => job.status === 'succeeded')
      .forEach(job => {
        const bbox = job.bbox as BBox
        const centerLng = (bbox.east + bbox.west) / 2
        const centerLat = (bbox.north + bbox.south) / 2

        const el = document.createElement('div')
        el.className = 'job-marker'
        el.style.width = '20px'
        el.style.height = '20px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#3b82f6'
        el.style.border = '2px solid white'
        el.style.cursor = 'pointer'
        el.title = `Job ${job.id.slice(0, 8)}`

        new mapboxgl.Marker(el)
          .setLngLat([centerLng, centerLat])
          .addTo(map.current!)
      })
  }

  const startSelection = () => {
    if (!map.current) return
    setIsSelecting(true)
    setSelectedBBox(null)

    // 矩形選択の実装（簡易版）
    let startLngLat: mapboxgl.LngLat | null = null
    let rect: mapboxgl.Marker | null = null

    const onMouseDown = (e: mapboxgl.MapMouseEvent) => {
      startLngLat = e.lngLat
    }

    const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!startLngLat || !map.current) return

      const bounds = new mapboxgl.LngLatBounds(startLngLat, e.lngLat)
      
      // 矩形の表示（簡易版）
      if (rect) rect.remove()
      // 実際の実装では、より詳細な矩形描画が必要
    }

    const onMouseUp = (e: mapboxgl.MapMouseEvent) => {
      if (!startLngLat || !map.current) return

      const bounds = new mapboxgl.LngLatBounds(startLngLat, e.lngLat)
      const bbox: BBox = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }

      // 範囲チェック（最大1km x 1km）
      const latDiff = bbox.north - bbox.south
      const lngDiff = bbox.east - bbox.west
      const maxSize = 0.009 // 約1km

      if (latDiff > maxSize || lngDiff > maxSize) {
        alert('選択範囲が大きすぎます。最大1km x 1kmまで選択できます。')
        setIsSelecting(false)
        return
      }

      setSelectedBBox(bbox)
      setIsSelecting(false)

      map.current.off('mousedown', onMouseDown)
      map.current.off('mousemove', onMouseMove)
      map.current.off('mouseup', onMouseUp)
    }

    map.current.on('mousedown', onMouseDown)
    map.current.on('mousemove', onMouseMove)
    map.current.on('mouseup', onMouseUp)
  }

  const createJob = async () => {
    if (!selectedBBox) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bbox: selectedBBox }),
      })

      if (!response.ok) throw new Error('Failed to create job')

      const job = await response.json()
      setJobs(prev => [job, ...prev])
      setSelectedBBox(null)
      alert('ジョブを作成しました。処理が完了するまでお待ちください。')
    } catch (error) {
      console.error('Error creating job:', error)
      alert('ジョブの作成に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold mb-4">Building 3D Generator</h1>
        
        <div className="space-y-2">
          <button
            onClick={startSelection}
            disabled={isSelecting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSelecting ? '範囲を選択中...' : '範囲を選択'}
          </button>

          {selectedBBox && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <p className="text-sm">選択範囲:</p>
              <p className="text-xs text-gray-600">
                N: {selectedBBox.north.toFixed(6)}, S: {selectedBBox.south.toFixed(6)}
                <br />
                E: {selectedBBox.east.toFixed(6)}, W: {selectedBBox.west.toFixed(6)}
              </p>
              <button
                onClick={createJob}
                disabled={isLoading}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? '作成中...' : 'ジョブを作成'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">ジョブ一覧</h2>
        <div className="space-y-2">
          {jobs.map(job => (
            <div key={job.id} className="p-2 border rounded text-sm">
              <p className="font-semibold">ID: {job.id.slice(0, 8)}</p>
              <p className="text-gray-600">状態: {job.status}</p>
              <p className="text-gray-600 text-xs">
                {new Date(job.created_at).toLocaleString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


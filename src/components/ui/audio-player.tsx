"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Play, 
  Pause, 
  Volume2, 
  Download,
  SkipBack,
  SkipForward,
  RotateCcw
} from "lucide-react"

interface AudioPlayerProps {
  src: string
  title?: string
  className?: string
  onDownload?: () => void
}

export function AudioPlayer({ src, title, className, onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      audio.play()
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error playing audio:', error)
          setIsLoading(false)
        })
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const newTime = (value[0] / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0] / 100
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  const changePlaybackRate = () => {
    const audio = audioRef.current
    if (!audio) return

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const nextRate = rates[nextIndex]
    
    audio.playbackRate = nextRate
    setPlaybackRate(nextRate)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressBarRef.current
    if (!audio || !progressBar || !duration) return

    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickedTime = (x / rect.width) * duration
    audio.currentTime = clickedTime
    setCurrentTime(clickedTime)
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          className="hidden"
        />
        
        {/* Audio Info */}
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            ref={progressBarRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            className="sr-only"
            max={100}
            step={0.1}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {/* Play/Pause */}
            <Button
              onClick={togglePlayPause}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Skip Back */}
            <Button
              onClick={() => skip(-10)}
              variant="outline"
              size="sm"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Skip Forward */}
            <Button
              onClick={() => skip(10)}
              variant="outline"
              size="sm"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Playback Rate */}
            <Button
              onClick={changePlaybackRate}
              variant="outline"
              size="sm"
              className="min-w-[80px]"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {playbackRate}x
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <div className="w-24">
                <Slider
                  value={[volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Download */}
            {onDownload && (
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="text-xs text-muted-foreground mt-4">
          <div className="font-medium mb-1">Keyboard Shortcuts:</div>
          <div className="space-y-1">
            <div>Space: Play/Pause</div>
            <div>←/→: Skip 10s</div>
            <div>↑/↓: Volume</div>
            <div>R: Playback Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

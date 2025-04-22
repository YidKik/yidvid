
import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { cn } from "@/lib/utils"

interface GridMotionProps {
  items?: (string | ReactNode)[]
  gradientColor?: string
  className?: string
}

export function GridMotion({
  items = [],
  gradientColor = 'black',
  className
}: GridMotionProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef(window.innerWidth / 2)

  const totalItems = 49
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`)
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems

  useEffect(() => {
    gsap.ticker.lagSmoothing(1000, 16) // Increase lag smoothing to prevent jank

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = () => {
      const maxMoveAmount = 150 // Reduced for smoother movement
      const baseDuration = 1.2 // Increased for smoother transitions
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power1.out', // Changed to power1 for smoother motion
            overwrite: 'auto',
          })
        }
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
    }
  }, [])

  return (
    <div className={cn("h-full w-full overflow-visible", className)} ref={gridRef}>
      <section
        className="relative flex h-screen w-full items-center justify-center overflow-visible"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="relative z-2 flex-none grid h-[220vh] w-[150vw] gap-5 grid-rows-[repeat(7,1fr)] grid-cols-[100%] -rotate-15 origin-center">
          {[...Array(7)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-[repeat(10,1fr)] will-change-transform will-change-filter"
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {[...Array(10)].map((_, itemIndex) => {
                const content = items[rowIndex * 10 + itemIndex]
                return (
                  <div key={itemIndex} className="relative aspect-square p-1">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-muted flex items-center justify-center text-foreground text-xs transform hover:scale-105 transition-transform duration-200">
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center rounded-full"
                          style={{
                            backgroundImage: `url(${content})`,
                            transform: 'scale(1)',
                          }}
                        />
                      ) : (
                        <div className="p-1 text-center z-1">
                          {content}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

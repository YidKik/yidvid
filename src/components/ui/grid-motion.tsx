
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

  const totalItems = 30 // Reduced number of items
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`)
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems

  useEffect(() => {
    gsap.ticker.lagSmoothing(1000, 16)

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = () => {
      const maxMoveAmount = 150
      const baseDuration = 1.2
      const inertiaFactors = [0.6, 0.4, 0.3]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power1.out',
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
      >
        {/* Reduced number of rows and adjusted grid layout */}
        <div className="relative z-2 flex-none grid h-[150vh] w-[150vw] gap-3 grid-rows-[repeat(3,1fr)] grid-cols-[100%] -rotate-15 origin-center">
          {[...Array(3)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2 grid-cols-[repeat(10,1fr)] will-change-transform will-change-filter"
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {[...Array(10)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 10 + itemIndex]
                return (
                  <div key={itemIndex} className="relative aspect-square p-0.5">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-muted flex items-center justify-center text-foreground text-[10px] transform hover:scale-105 transition-transform duration-200">
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center rounded-full"
                          style={{
                            backgroundImage: `url(${content})`,
                            transform: 'scale(0.6)', // Reduced size of circle images
                          }}
                        />
                      ) : (
                        <div className="p-0.5 text-center z-1">
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

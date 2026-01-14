import React, { useEffect, useRef } from 'react'

function StarBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resize()
    window.addEventListener('resize', resize)
    
    const stars = []
    const constellationLines = []
    
    // Create stars
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.02 + 0.005,
        alphaDirection: 1,
      })
    }
    
    // Create constellation connections
    for (let i = 0; i < 20; i++) {
      const star1 = stars[Math.floor(Math.random() * stars.length)]
      const star2 = stars[Math.floor(Math.random() * stars.length)]
      if (star1 !== star2) {
        const distance = Math.sqrt(
          Math.pow(star2.x - star1.x, 2) + Math.pow(star2.y - star1.y, 2)
        )
        if (distance < 200) {
          constellationLines.push({ star1, star2 })
        }
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw constellation lines
      constellationLines.forEach(line => {
        const gradient = ctx.createLinearGradient(
          line.star1.x, line.star1.y,
          line.star2.x, line.star2.y
        )
        gradient.addColorStop(0, `rgba(158, 127, 255, ${line.star1.alpha * 0.3})`)
        gradient.addColorStop(1, `rgba(56, 189, 248, ${line.star2.alpha * 0.3})`)
        
        ctx.beginPath()
        ctx.moveTo(line.star1.x, line.star1.y)
        ctx.lineTo(line.star2.x, line.star2.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 0.5
        ctx.stroke()
      })
      
      // Draw and animate stars
      stars.forEach(star => {
        star.alpha += star.alphaSpeed * star.alphaDirection
        if (star.alpha >= 1 || star.alpha <= 0.2) {
          star.alphaDirection *= -1
        }
        
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 2
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`)
        gradient.addColorStop(0.5, `rgba(158, 127, 255, ${star.alpha * 0.5})`)
        gradient.addColorStop(1, 'rgba(158, 127, 255, 0)')
        
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)' }}
    />
  )
}

export default StarBackground

import { keyframes } from '@emotion/react'

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

export const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

export const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`

// Animaciones para ser usadas con styled-components
export const animations = {
  fadeIn: `animation: ${fadeIn} 0.3s ease-in-out;`,
  slideUp: `animation: ${slideUp} 0.5s ease-out;`,
  slideIn: `animation: ${slideIn} 0.5s ease-out;`,
  scaleIn: `animation: ${scaleIn} 0.3s ease-out;`,
  pulse: `animation: ${pulse} 2s infinite ease-in-out;`
}
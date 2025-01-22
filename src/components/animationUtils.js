import { keyframes } from '@emotion/react'

// Animaciones básicas
export const basicAnimations = {
  fadeIn: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  fadeOut: keyframes`
    from { opacity: 1; }
    to { opacity: 0; }
  `,
  slideUp: keyframes`
    from { 
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `,
  slideDown: keyframes`
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  `
}

// Animaciones avanzadas
export const advancedAnimations = {
  popIn: keyframes`
    0% {
      transform: scale(0);
      opacity: 0;
    }
    80% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  `,
  shake: keyframes`
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  `,
  pulse: keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `,
  rotateIn: keyframes`
    from {
      transform: rotate(-180deg) scale(0);
      opacity: 0;
    }
    to {
      transform: rotate(0) scale(1);
      opacity: 1;
    }
  `
}

// Utilidades de animación
export const generateAnimation = (animation, duration = '0.3s', timing = 'ease') => `
  animation: ${animation} ${duration} ${timing};
`

// Helpers para elementos específicos
export const cardAnimations = {
  enter: generateAnimation(basicAnimations.fadeIn, '0.4s'),
  hover: generateAnimation(advancedAnimations.pulse, '0.3s'),
  exit: generateAnimation(basicAnimations.fadeOut, '0.3s')
}

export const buttonAnimations = {
  click: generateAnimation(advancedAnimations.shake, '0.4s'),
  hover: generateAnimation(advancedAnimations.pulse, '0.3s')
}

export const modalAnimations = {
  enter: generateAnimation(advancedAnimations.popIn, '0.5s'),
  exit: generateAnimation(basicAnimations.fadeOut, '0.3s')
}

// Animaciones compuestas
export const createSequentialAnimation = (animations, gap = 0.1) => {
  return animations.map((animation, index) => ({
    animation: generateAnimation(animation, '0.3s'),
    delay: `${index * gap}s`
  }))
}

// Ejemplo de uso:
// const sequentialFade = createSequentialAnimation([basicAnimations.fadeIn, basicAnimations.slideUp])
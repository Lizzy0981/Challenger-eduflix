import { createGlobalStyle } from 'styled-components'
import {
  colorBlack,
  colorPrimary,
  fontWeightLight,
  fontWeightNormal,
  fontWeightBold,
  gradientDark
} from './components/UI/variablesStyle'

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    background: ${gradientDark};
    color: white;
    overflow-x: hidden;
  }

  h1 {
    font-size: 3.75rem;
    font-weight: ${fontWeightBold};
  }

  h2 {
    font-size: 2.5rem;
    font-weight: ${fontWeightBold};
  }

  h3 {
    font-size: 1.875rem;
    font-weight: ${fontWeightNormal};
  }

  h4 {
    font-size: 1.688rem;
    font-weight: ${fontWeightLight};
  }

  p {
    font-size: 1.125rem;
    font-weight: ${fontWeightLight};
    line-height: 1.6;
  }

  span {
    font-size: 1rem;
    font-weight: ${fontWeightLight};
  }

  /* Clases de utilidad */
  .text-gradient {
    background: linear-gradient(to right, ${colorPrimary}, #2980b9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .bg-glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-hover {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(52, 152, 219, 0.2);
    }
  }

  /* Animaciones */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .slide-up {
    animation: slideUp 0.5s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
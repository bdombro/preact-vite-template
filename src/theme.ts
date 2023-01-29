import { stylesheet } from 'astroturf'

export const theme = {}

stylesheet`
  :root {
    /* @link https://utopia.fyi/type/calculator?c=320,18,1.2,1240,20,1.25,6,2,&s=0.75|0.5|0.25,1.5|2|3|4|6,s-l&g=s,l,xl,12 */
    --step--2: clamp(0.7rem, calc(0.7rem + 0.03vw), 0.8rem);
    --step--1: clamp(0.9rem, calc(0.9rem + 0.1vw), 1rem);
    --step-0: clamp(1.1rem, calc(1.1rem + 0.25vw), 1.3rem);
    --step-1: clamp(1.3rem, calc(1.3rem + 0.4vw), 1.6rem);
    --step-2: clamp(1.6rem, calc(1.5rem + 0.6vw), 2rem);
    --step-3: clamp(2rem, calc(1.8rem + 0.9vw), 2.4rem);
    --step-4: clamp(2.3rem, calc(2.1rem + 1.3vw), 3rem);
    --step-5: clamp(2.8rem, calc(2.5rem + 1.8vw), 3.8rem);
    --step-6: clamp(3.3rem, calc(2.9rem + 2.5vw), 4.7rem);
  }
  body {
    margin: 0;

    * {
      font-size: var(--step-0);
      line-height: var(--step-1);
    }

    a {
      text-decoration: none;
    }
    button {
      font-size: var(--step--1);
      line-height: var(--step-0);
    }
    h1 {
      font-size: var(--step-5);
      line-height: var(--step-5);
    }
    h2 {
      font-size: var(--step-4);
      line-height: var(--step-4);
    }
    h3 {
      font-size: var(--step-3);
      line-height: var(--step-3);
    }
    h4 {
      font-size: var(--step-2);
      line-height: var(--step-2);
    }
    h5 {
      font-size: var(--step-1);
      line-height: var(--step-1);
    }
    h6 {
      font-size: var(--step-0);
      line-height: var(--step-0);
    }
    input {
      font-size: var(--step-0);
      line-height: var(--step-0);
    }
    p a {
      font-decoration: underline;
    }
    small {
      font-size: var(--step--1);
      line-height: var(--step-0);
    }
	}
`

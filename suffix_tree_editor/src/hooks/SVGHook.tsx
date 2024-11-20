import { useRef, useEffect } from "react";

export type DrawFunction = (svg: SVGSVGElement, frameCount: number) => void;

const useSVG = (draw: DrawFunction) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let frameCount = 0;
    let animationFrameId: number;

    const render = () => {
      frameCount++;
      draw(svg, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return svgRef;
};

export default useSVG;

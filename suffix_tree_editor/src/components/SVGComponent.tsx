import React, { useState, useRef, useEffect } from "react";
import useSVG, { DrawFunction } from "../hooks/SVGHook";

interface Circle {
  x: number;
  y: number;
  id: string;
  label?: string; // Added label field
}

interface Line {
  start: Circle;
  end: Circle;
}

const SVGComponent: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [dragging, setDragging] = useState(false);
  const [tempLine, setTempLine] = useState<{
    start: Circle;
    end: { x: number; y: number };
  } | null>(null);
  const [movingCircle, setMovingCircle] = useState<{
    circle: Circle;
    index: number;
  } | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [editingLabel, setEditingLabel] = useState(false);

  // Create a unique ID for new circles
  const nextId = useRef(0);
  const generateId = () => {
    nextId.current += 1;
    return `circle-${nextId.current}`;
  };

  // Add keyboard event listener for delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedCircle &&
        !editingLabel
      ) {
        console.log("Delete key pressed");
        // Remove the selected circle
        setCircles(circles.filter((circle) => circle.id !== selectedCircle.id));
        // Remove any lines connected to this circle
        setLines(
          lines.filter(
            (line) =>
              line.start.id !== selectedCircle.id &&
              line.end.id !== selectedCircle.id
          )
        );
        setSelectedCircle(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCircle, circles, lines, editingLabel]);

  const draw: DrawFunction = (svg, frameCount) => {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw lines
    lines.forEach(({ start, end }) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", start.x.toString());
      line.setAttribute("y1", start.y.toString());
      line.setAttribute("x2", end.x.toString());
      line.setAttribute("y2", end.y.toString());
      line.setAttribute("stroke", "gray");
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    });

    // Draw temp line if dragging
    if (tempLine) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", tempLine.start.x.toString());
      line.setAttribute("y1", tempLine.start.y.toString());
      line.setAttribute("x2", tempLine.end.x.toString());
      line.setAttribute("y2", tempLine.end.y.toString());
      line.setAttribute("stroke", "gray");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-dasharray", "5,5");
      svg.appendChild(line);
    }

    // Draw circles
    circles.forEach((circle) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

      const circleElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circleElement.setAttribute("cx", circle.x.toString());
      circleElement.setAttribute("cy", circle.y.toString());
      circleElement.setAttribute("r", "30");
      circleElement.setAttribute("fill", "lightgray");
      circleElement.setAttribute(
        "stroke",
        circle.id === selectedCircle?.id ? "blue" : "gray"
      );
      circleElement.setAttribute(
        "stroke-width",
        circle.id === selectedCircle?.id ? "3" : "2"
      );
      group.appendChild(circleElement);

      // Add label if it exists
      if (circle.label) {
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", circle.x.toString());
        text.setAttribute("y", circle.y.toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "black");
        text.textContent = circle.label;
        group.appendChild(text);
      }

      svg.appendChild(group);
    });
  };

  const getCircleAtPoint = (point: { x: number; y: number }) => {
    return circles.find((circle) => {
      const dx = circle.x - point.x;
      const dy = circle.y - point.y;
      return Math.sqrt(dx * dx + dy * dy) < 30;
    });
  };

  const getTransformedPoint = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM()?.inverse());
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    const transformedPoint = getTransformedPoint(event);
    const circle = getCircleAtPoint(transformedPoint);

    if (circle) {
      if (event.shiftKey) {
        // Start moving the circle
        const circleIndex = circles.findIndex((c) => c.id === circle.id);
        setMovingCircle({ circle, index: circleIndex });
      } else {
        // Start drawing a line
        setDragging(true);
        setTempLine({ start: circle, end: transformedPoint });
      }
      // Set selected circle
      setSelectedCircle(circle);
    } else {
      setSelectedCircle(null);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const transformedPoint = getTransformedPoint(event);

    if (movingCircle) {
      // Create a new circle position
      const movedCircle: Circle = {
        ...movingCircle.circle,
        x: transformedPoint.x,
        y: transformedPoint.y,
      };

      // Update circles array
      const newCircles = [...circles];
      newCircles[movingCircle.index] = movedCircle;

      // Update all lines connected to the moving circle
      const newLines = lines.map((line) => {
        if (line.start.id === movingCircle.circle.id) {
          return { ...line, start: movedCircle };
        }
        if (line.end.id === movingCircle.circle.id) {
          return { ...line, end: movedCircle };
        }
        return line;
      });

      setCircles(newCircles);
      setLines(newLines);
    } else if (dragging && tempLine) {
      setTempLine({ ...tempLine, end: transformedPoint });
    }
  };

  const handleMouseUp = (event: React.MouseEvent<SVGSVGElement>) => {
    if (movingCircle) {
      setMovingCircle(null);
    } else if (dragging && tempLine) {
      const transformedPoint = getTransformedPoint(event);
      const endCircle = getCircleAtPoint(transformedPoint);

      if (endCircle && endCircle !== tempLine.start) {
        setLines([...lines, { start: tempLine.start, end: endCircle }]);
      }

      setDragging(false);
      setTempLine(null);
    }
  };

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (dragging || movingCircle) return;

    const transformedPoint = getTransformedPoint(event);
    const newCircle: Circle = {
      x: transformedPoint.x,
      y: transformedPoint.y,
      id: generateId(),
    };
    setCircles([...circles, newCircle]);
  };

  const handleLabelChange = (newLabel: string) => {
    if (selectedCircle) {
      const updatedCircles = circles.map((circle) =>
        circle.id === selectedCircle.id
          ? { ...circle, label: newLabel }
          : circle
      );
      setCircles(updatedCircles);
      setSelectedCircle({ ...selectedCircle, label: newLabel });
    }
  };

  const svgRef = useSVG(draw);

  return (
    <div className="flex flex-col w-full h-full">
      <svg
        ref={svgRef}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-gray-100"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
      />
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => {
            setCircles([]);
            setLines([]);
            setSelectedCircle(null);
            nextId.current = 0;
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-400"
        >
          Clear Nodes
        </button>
        {selectedCircle && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Label:</label>
            <input
              type="text"
              value={selectedCircle.label || ""}
              onChange={(e) => handleLabelChange(e.target.value)}
              onFocus={() => setEditingLabel(true)}
              onBlur={() => setEditingLabel(false)}
              className="px-2 py-1 border rounded"
              placeholder="Enter label"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SVGComponent;

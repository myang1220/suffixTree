import React, { useState, useRef, useEffect } from "react";
import useSVG, { DrawFunction } from "../hooks/SVGHook";
import InstructionsModal from "./InstructionsModal";

interface Circle {
  x: number;
  y: number;
  id: string;
  label?: string; // Added label field
}

interface Line {
  start: Circle;
  end: Circle;
  label?: string;
  id: string;
}

const SVGComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [editingLineLabel, setEditingLineLabel] = useState(false);

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
        !editingLabel &&
        !editingLineLabel
      ) {
        if (selectedCircle) {
          // Existing circle deletion logic
          setCircles(
            circles.filter((circle) => circle.id !== selectedCircle.id)
          );
          setLines(
            lines.filter(
              (line) =>
                line.start.id !== selectedCircle.id &&
                line.end.id !== selectedCircle.id
            )
          );
          setSelectedCircle(null);
        } else if (selectedLine) {
          // New line deletion logic
          setLines(lines.filter((line) => line.id !== selectedLine.id));
          setSelectedLine(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCircle,
    selectedLine,
    circles,
    lines,
    editingLabel,
    editingLineLabel,
  ]);

  const draw: DrawFunction = (svg, frameCount) => {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw lines with directional arrows
    lines.forEach((line) => {
      const lineElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      lineElement.setAttribute("x1", line.start.x.toString());
      lineElement.setAttribute("y1", line.start.y.toString());
      lineElement.setAttribute("x2", line.end.x.toString());
      lineElement.setAttribute("y2", line.end.y.toString());

      // Highlight selected line
      lineElement.setAttribute(
        "stroke",
        line.id === selectedLine?.id ? "blue" : "gray"
      );
      lineElement.setAttribute(
        "stroke-width",
        line.id === selectedLine?.id ? "3" : "2"
      );

      const drawArrowhead = (line: Line, arrowSize: number) => {
        const dx = line.end.x - line.start.x;
        const dy = line.end.y - line.start.y;
        const lineLength = Math.sqrt(dx * dx + dy * dy);

        // Adjust start point to be at the circle's edge
        const startX = line.start.x + (dx / lineLength) * 30;
        const startY = line.start.y + (dy / lineLength) * 30;

        // Adjust end point to be at the circle's edge
        const endX = line.end.x - (dx / lineLength) * 30;
        const endY = line.end.y - (dy / lineLength) * 30;

        const angle = Math.atan2(endY - startY, endX - startX);

        const arrowHead = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        const arrowPoints = [
          endX,
          endY,
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6),
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6),
        ];
        arrowHead.setAttribute(
          "d",
          `M${arrowPoints[0]} ${arrowPoints[1]} L${arrowPoints[2]} ${arrowPoints[3]} L${arrowPoints[4]} ${arrowPoints[5]} Z`
        );
        arrowHead.setAttribute("fill", "black");
        return arrowHead;
      };

      const arrowHead = drawArrowhead(line, 20);

      // Create a group for the line and arrowhead
      const lineGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );

      lineGroup.appendChild(lineElement);
      lineGroup.appendChild(arrowHead);

      // Add line label if it exists
      if (line.label) {
        const dx = line.end.x - line.start.x;
        const dy = line.end.y - line.start.y;
        const lineLength = Math.sqrt(dx * dx + dy * dy);

        // Calculate an offset perpendicular to the line
        const perpendicularOffsetX = (-dy / lineLength) * 20; // 20 is the offset distance
        const perpendicularOffsetY = (dx / lineLength) * 20;

        const midX = (line.start.x + line.end.x) / 2 + perpendicularOffsetX;
        const midY = (line.start.y + line.end.y) / 2 + perpendicularOffsetY;

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", midX.toString());
        text.setAttribute("y", midY.toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "black");
        text.textContent = line.label;
        lineGroup.appendChild(text);
      }

      svg.appendChild(lineGroup);
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
        const newLine: Line = {
          start: tempLine.start,
          end: endCircle,
          id: `line-${Date.now()}`, // Generate unique ID
        };
        setLines([...lines, newLine]);
      }

      setDragging(false);
      setTempLine(null);
    }
  };

  // Add method to handle line selection
  const handleLineSelection = (line: Line) => {
    setSelectedLine(line);
    setSelectedCircle(null);
  };

  // Add line label change handler
  const handleLineLabelChange = (newLabel: string) => {
    if (selectedLine) {
      const updatedLines = lines.map((line) =>
        line.id === selectedLine.id ? { ...line, label: newLabel } : line
      );
      setLines(updatedLines);
      setSelectedLine({ ...selectedLine, label: newLabel });
    }
  };

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (dragging || movingCircle) return;

    const transformedPoint = getTransformedPoint(event);

    // Check if a line was clicked
    const clickedLine = lines.find((line) => {
      // Simple line segment click detection
      const dx1 = line.start.x - transformedPoint.x;
      const dy1 = line.start.y - transformedPoint.y;
      const dx2 = line.end.x - transformedPoint.x;
      const dy2 = line.end.y - transformedPoint.y;
      const distanceToStart = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      const distanceToEnd = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      const lineLength = Math.sqrt(
        (line.end.x - line.start.x) ** 2 + (line.end.y - line.start.y) ** 2
      );

      // If the sum of distances to start and end is close to line length,
      // the point is close to the line
      return Math.abs(distanceToStart + distanceToEnd - lineLength) < 10;
    });

    if (clickedLine) {
      handleLineSelection(clickedLine);
      return;
    }

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
        className="bg-gray-100 rounded-3xl border border-gray-500 cursor-pointer"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
      />
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors duration-200"
        >
          Instructions
        </button>

        {isModalOpen && (
          <InstructionsModal onClose={() => setIsModalOpen(false)} />
        )}

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
        {selectedLine && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Line Label:</label>
            <input
              type="text"
              value={selectedLine.label || ""}
              onChange={(e) => handleLineLabelChange(e.target.value)}
              onFocus={() => setEditingLineLabel(true)}
              onBlur={() => setEditingLineLabel(false)}
              className="px-2 py-1 border rounded"
              placeholder="Enter line label"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SVGComponent;

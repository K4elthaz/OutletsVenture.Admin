"use client";
import { useRef, useEffect, useState } from "react";
import React from "react";
import { Box, Button, Card, IconButton, Tooltip } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface MapCanvasProps {
  imageSrc: string;
  onSave: (points: Point[]) => void;
  initialPoints: Point[]; // New prop for initial points
}

type Point = [number, number];

const MapCanvas: React.FC<MapCanvasProps> = ({
  imageSrc,
  onSave,
  initialPoints,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [points, setPoints] = useState<Point[]>(initialPoints); // Initialize points with the initialPoints prop
  const [redoStack, setRedoStack] = useState<Point[]>([]);

  // Draw the map and route when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;

    if (canvas && ctx && img) {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        drawRoute(ctx);
      };
    }
  }, []);

  // Re-draw route whenever points change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      drawRoute(ctx);
    }
  }, [points]);

  useEffect(() => {
    setPoints(initialPoints); // Update points when initialPoints change
  }, [initialPoints]);

  const drawRoute = (ctx: CanvasRenderingContext2D) => {
    const img = imgRef.current;
    if (img && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);

      if (points.length > 1) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();

        points.forEach((point, index) => {
          const [x, y] = point;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      }

      if (points.length > 0) {
        const [originX, originY] = points[0];
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(originX, originY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = "14px Arial";
        ctx.fillText("Origin", originX + 10, originY - 10);
      }

      if (points.length > 1) {
        const [destX, destY] = points[points.length - 1];
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(destX, destY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = "14px Arial";
        ctx.fillText("Destination", destX + 10, destY - 10);
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const img = imgRef.current;
    if (rect && img) {
      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      setPoints((prevPoints) => [...prevPoints, [x, y]]);
      setRedoStack([]); // Clear redo stack on new point click
    }
  };

  const handleUndo = () => {
    if (points.length > 0) {
      const newPoints = [...points];
      const lastPoint = newPoints.pop();
      if (lastPoint) {
        setRedoStack((prev) => [lastPoint, ...prev]);
        setPoints(newPoints);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const [redoPoint, ...restRedoStack] = redoStack;
      setPoints((prevPoints) => [...prevPoints, redoPoint]);
      setRedoStack(restRedoStack);
    }
  };

  const handleReset = () => {
    setPoints(initialPoints); // Reset points to initial state
    setRedoStack([]); // Clear redo stack
  };

  useEffect(() => {
    onSave(points);
  }, [points, onSave]);

  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Tooltip title="Undo" arrow>
            <IconButton
              onClick={handleUndo}
              disabled={points.length === 0}
              color="primary"
            >
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset" arrow>
            <IconButton
              onClick={handleReset}
              disabled={points.length === 0 && redoStack.length === 0}
              color="secondary"
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo" arrow>
            <IconButton
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              color="primary"
            >
              <RedoIcon />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <img ref={imgRef} src={imageSrc} alt="map" style={{ display: "none" }} />
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ width: "100%", height: "auto", cursor: "crosshair" }}
          />
        </div>
      </div>
  );
};

export default MapCanvas;

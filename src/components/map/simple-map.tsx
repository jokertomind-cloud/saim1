"use client";

import { useMemo } from "react";
import type { GameMap, MapPoint } from "@/types/models";

interface Props {
  map: GameMap;
  points: Array<{ id: string; data: MapPoint }>;
  playerX: number;
  playerY: number;
  onMove: (dx: number, dy: number) => void;
  onPointTap: (pointId: string) => void;
  onCellTap: (x: number, y: number) => void;
}

export const SimpleMap = ({ map, points, playerX, playerY, onMove, onPointTap, onCellTap }: Props) => {
  const cells = useMemo(() => {
    const all: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        all.push({ x, y });
      }
    }
    return all;
  }, [map.height, map.width]);

  return (
    <div className="stack">
      <div
        className="map-grid"
        style={{
          gridTemplateColumns: `repeat(${map.width}, minmax(0, 1fr))`
        }}
      >
        {cells.map((cell) => {
          const isPlayer = cell.x === playerX && cell.y === playerY;
          const point = points.find((item) => item.data.x === cell.x && item.data.y === cell.y);
          const blocked = map.obstacles.some((item) => item.x === cell.x && item.y === cell.y);
          return (
            <button
              key={`${cell.x}-${cell.y}`}
              className={`map-cell ${blocked ? "blocked" : ""} ${isPlayer ? "player" : ""}`}
              disabled={blocked}
              onClick={() => {
                if (point) onPointTap(point.id);
                onCellTap(cell.x, cell.y);
              }}
              type="button"
            >
              {point ? <span className="point-dot">{point.data.name.slice(0, 1)}</span> : null}
              {isPlayer ? <span className="avatar-dot" /> : null}
            </button>
          );
        })}
      </div>

      <div className="pad">
        <p className="hint">十字パッドでも、隣のマスをタップしても移動できます。</p>
        <button className="button" onClick={() => onMove(0, -1)} type="button">
          ↑
        </button>
        <div className="pad-row">
          <button className="button" onClick={() => onMove(-1, 0)} type="button">
            ←
          </button>
          <button className="button" onClick={() => onMove(1, 0)} type="button">
            →
          </button>
        </div>
        <button className="button" onClick={() => onMove(0, 1)} type="button">
          ↓
        </button>
      </div>
    </div>
  );
};

import { check } from "@placemarkio/check-geojson";
import { type AllGeoJSON } from "@turf/turf";
import { useState } from "react";
import type { ActiveAction, Point } from "./App";

export interface EraseContext {
  erasablePoints: Point[];
  onErasePoint: (newPoints: Point[]) => void;
  onHoverPoint?: (hoveredPoint: Point) => void;
}

export interface NewGeoJsonContext {
  onCreateGeojson: (newGeojson: AllGeoJSON) => void;
}

export interface ContxtMenuProps {
  currentActiveAction: ActiveAction;
  eraseContext: EraseContext;
  newGeojsonContext: NewGeoJsonContext;
}

export default function ContextMenu({
  currentActiveAction,
  eraseContext,
  newGeojsonContext,
}: ContxtMenuProps) {
  // If AddGeojson context, validate that the entered geojson is valid.
  const [newGeojson, setNewGeojson] = useState<string>("");
  const [lastGeojsonInvalid, setLastGeojsonInvalid] = useState<boolean>(false);

  return (
    <>
      <div className="w-full h-full flex flex-col gap-1">
        <p>Currently active: {currentActiveAction}</p>
        {currentActiveAction === "Erase"
          && (
            <>
              <button
                className="bg-neutral-100 hover:bg-neutral-200 p-2 rounded-md"
                onClick={() => {
                  const confirmation = confirm(
                    "Are you sure you want to erase every point on the map? This cannot be undone.",
                  );
                  if (confirmation) {
                    eraseContext.onErasePoint([]);
                  }
                }}
              >
                Erase All
              </button>
              {eraseContext.erasablePoints.map(point => (
                <button
                  className="bg-neutral-100 hover:bg-neutral-300 p-2"
                  key={point.latitude.toString() + "," + point.longitude.toString()}
                  onClick={() => {
                    const pointsMinusRemoved = eraseContext
                      .erasablePoints
                      .filter(p2 => (
                        p2.latitude !== point.latitude && p2.longitude !== point.longitude
                      ));
                    eraseContext.onErasePoint(pointsMinusRemoved);
                  }}
                >
                  {point.longitude}, {point.latitude}
                </button>
              ))}
              {eraseContext.erasablePoints.length === 0
                && <p>No points on the map</p>}
            </>
          )}
        {currentActiveAction === "AddGeojson"
          && (
            <div className="h-full w-full flex flex-col gap-2">
              <p>Enter GeoJson string:</p>
              <textarea
                className={`border ${
                  lastGeojsonInvalid ? "border-red-300 bg-red-50" : "border-neutral-400"
                } h-full w-full resize-none`}
                value={newGeojson}
                onChange={e => {
                  setNewGeojson(e.currentTarget.value);
                  setLastGeojsonInvalid(false);
                }}
              />
              <button
                disabled={newGeojson.length === 0}
                type="button"
                className="disabled:bg-neutral-400 disabled:text-neutral-600 bg-green-400 hover:bg-green-600 hover:text-white p-3 rounded-md"
                onClick={() => {
                  try {
                    console.log(newGeojson);
                    const parsedGeojson = check(newGeojson);
                    console.log(parsedGeojson);
                    newGeojsonContext.onCreateGeojson(parsedGeojson);
                    setLastGeojsonInvalid(false);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  } catch (e) {
                    // FIXME
                    setLastGeojsonInvalid(true);
                  }
                }}
              >
                Add GeoJson
              </button>
            </div>
          )}
      </div>
    </>
  );
}

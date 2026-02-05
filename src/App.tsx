import { featureCollection, lineString } from "@turf/turf";
import { Layer, type LineLayerSpecification, Map, Marker, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import { Info, MapPin, Plus } from "react-feather";

interface Point {
  latitude: number;
  longitude: number;
}

interface Line {
  points: Point[];
}

type ActiveAction = "Default" | "PlacePoint" | "PlaceLine" | "PlacePolygon" | "DeletePoint";

function App() {

	/* 
	 * A workflow is a series of steps that can either return void (do nothing),
	 * a valid geoJson (put it onto the map), a string (display it in the workflow
   * window), or a number (display it in the workflow window).
	 * 
	 * Each step may have: an input, an output and a processing function
	*/


  // Map state
  const [lat, setLat] = useState<number>(-33);
  const [lng, setLng] = useState<number>(151);
  const [zoom, setZoom] = useState<number>(11);

  // App state
  const [activeAction, setActiveAction] = useState<ActiveAction>("Default");
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  const displayToast = useMemo(() => {
    if (activeAction === "PlacePoint" || activeAction === "PlaceLine") {
      return true;
    } else {
      return false;
    }
  }, [activeAction]);

  const toastText = useMemo(() => {
    if (activeAction === "Default") {
      return "";
    } else if (activeAction === "PlacePoint") {
      return "Left click the map to place a point at the cursor's location";
    } else if (activeAction === "PlaceLine") {
      return "Left click to place the next vertex of the line. Double click to place the next vertex and complete the line.";
    } else {
      return "";
    }
  }, [activeAction]);

  // Temporary states
  // Track a new line as it is being drawn.
  const [drawingLine, setDrawingLine] = useState<Line | null>(null);
  const [ghostPoint, setGhostPoint] = useState<Point | null>(null);

  // Generated layer data
  const drawingLineLayer: LineLayerSpecification = {
    id: "drawingLineLayer",
    source: "drawingLineData",
    type: "line",
    paint: {
      "line-color": "#000000",
      "line-width": 2,
    },
  };

  const drawingLineGeoJson = useMemo(() => {
    if (drawingLine === null) {
      return null;
    } else if (drawingLine !== null && drawingLine.points.length > 0) {
      const lineToPositionArr = drawingLine.points.map(p => [p.longitude, p.latitude]);

      // Add the ghost line
      if (ghostPoint) {
        lineToPositionArr.push([ghostPoint.longitude, ghostPoint.latitude]);
      }

      if (lineToPositionArr.length > 1) {
        const lineStr = lineString(lineToPositionArr, { name: "drawingLine" });
        return lineStr;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }, [drawingLine, ghostPoint]);

  // Confirmed, drawn lines
  const lineLayer: LineLayerSpecification = {
    id: "line-layer-1",
    source: "linedata",
    type: "line",
    paint: {
      "line-color": "#000000",
      "line-width": 2,
    },
  };

  const lineGeoJson = useMemo(() => {
    if (lines.length === 0) {
      return null;
    } else {
      const allLinesAsGeoJson = lines.map(targetLine => {
        const lineToPositionArr = targetLine.points.map(p => [p.longitude, p.latitude]);
        const lineStr = lineString(lineToPositionArr, { name: "test" });
        return lineStr;
      });

      const consolidatedGeoJsons = featureCollection(allLinesAsGeoJson);
      return consolidatedGeoJsons;
    }
  }, [lines]);

  return (
    <>
      <div id="app-container" className="w-screen h-screen flex flex-row">
        <div id="tools-section" className="w-60 flex flex-col gap-2 relative">
          <div className="w-full h-full flex flex-col p-2 gap-2 overflow-auto">
            <input type="search" className="w-full bg-neutral-300 p-2 rounded-sm sticky" placeholder="Search tool..." />
            <details open className="w-full">
              <summary className="font-bold">Draw</summary>
              <button
                className={`mt-2 w-full p-1 ${
                  activeAction === "PlacePoint" ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"
                } rounded-t-sm`}
                onClick={() => {
                  if (activeAction === "PlacePoint") {
                    setActiveAction("Default");
                    setGhostPoint(null);
                  } else {
                    setActiveAction("PlacePoint");
                  }
                }}
              >
                Add point
              </button>
              <button
                disabled
                className="mt-1 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 hover:bg-neutral-200 bg-neutral-100"
              >
                Add polygon
              </button>
              <button
                className={`mt-2 w-full p-1 ${
                  activeAction === "PlaceLine" ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"
                } rounded-t-sm`}
                onClick={() => {
                  if (activeAction === "PlaceLine") {
                    setActiveAction("Default");
                    setDrawingLine(null);
                    setGhostPoint(null);
                  } else {
                    setActiveAction("PlaceLine");
                  }
                }}
              >
                Add line
              </button>
              <button
                disabled
                className="mt-1 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 hover:bg-neutral-200 bg-neutral-100 rounded-b-sm"
              >
                Import GeoJSON
              </button>
            </details>
            <details open className="w-full">
              <summary className="font-bold">Erase</summary>
              <button
                disabled
                className={`mt-2 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 ${
                  activeAction === "DeletePoint"
                    ? "bg-neutral-400 animate-pulse"
                    : "bg-neutral-100 hover:bg-neutral-200"
                } rounded-t-sm`}
                onClick={() => {
                  if (activeAction !== "DeletePoint") {
                    setActiveAction("DeletePoint");
                  } else {
                    setActiveAction("Default");
                  }
                }}
              >
                Erase point
              </button>
              <button
                disabled={points.length === 0}
                className={`mt-1 w-full disabled:bg-neutral-500 disabled:text-neutral-400 p-1 bg-neutral-100 hover:bg-neutral-200 rounded-b-sm`}
                onClick={() => {
                  const shouldDelete = confirm("Are you sure you want to delete all points? This cannot be undone.");
                  if (shouldDelete) {
                    setPoints([]);
                  }
                }}
              >
                Erase all points
              </button>
              <button
                disabled={lines.length === 0}
                className={`mt-1 w-full disabled:bg-neutral-500 disabled:text-neutral-400 p-1 bg-neutral-100 hover:bg-neutral-200 rounded-b-sm`}
                onClick={() => {
                  const shouldDelete = confirm("Are you sure you want to delete all lines? This cannot be undone.");
                  if (shouldDelete) {
                    setLines([]);
                  }
                }}
              >
                Erase all lines
              </button>
            </details>
          </div>
        </div>
        <div id="map-segment" className="w-full h-full relative">
          {displayToast && (
            <div
              id="toast"
              className="absolute z-20 h-14 p-4 min-w-30 max-w-3/4 bottom-10 left-10 bg-white shadow-md rounded-sm"
            >
              <div className="flex flex-row gap-3 justify-between h-full w-full items-center">
                <Info />
                <p>{toastText}</p>
              </div>
            </div>
          )}
          <Map
            style={{ height: "100%", flexGrow: 1 }}
            latitude={lat}
            longitude={lng}
            zoom={zoom}
            pitch={0}
            bearing={0}
            onDrag={e => {
              setLat(e.viewState.latitude);
              setLng(e.viewState.longitude);
            }}
            onZoom={e => {
              setLng(e.viewState.longitude);
              setLat(e.viewState.latitude);
              setZoom(e.viewState.zoom);
            }}
            mapStyle="https://tiles.versatiles.org/assets/styles/colorful/style.json"
            onMouseMove={e => {
              if (activeAction === "PlaceLine") {
                console.log(drawingLine);
                if (drawingLine && drawingLine.points.length > 0) {
                  const currCursorPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                  setGhostPoint(currCursorPoint);
                }
              } else if (activeAction === "PlacePoint") {
                const currCursorPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                setGhostPoint(currCursorPoint);
              }
            }}
            onClick={e => {
              if (activeAction === "PlacePoint") {
                const newPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                setPoints([...points, newPoint]);
                setActiveAction("Default");
                setGhostPoint(null);
              } else if (activeAction === "DeletePoint") {
                console.log(e.type);
              } else if (activeAction === "PlaceLine") {
                const newLine: Line = { points: [{ latitude: e.lngLat.lat, longitude: e.lngLat.lng }] };
                if (drawingLine === null) {
                  // Start drawing from scratch
                  setDrawingLine(newLine);
                } else {
                  // Add on to existing drawing line
                  setDrawingLine({
                    points: [...drawingLine.points, { latitude: e.lngLat.lat, longitude: e.lngLat.lng }],
                  });
                }
              }
            }}
            onDblClick={e => {
              if (activeAction === "PlaceLine") {
                e.preventDefault();
                if (drawingLine !== null) {
                  setLines([...lines, drawingLine]);
                  setDrawingLine(null);
                  setActiveAction("Default");
                  setGhostPoint(null);
                }
              }
            }}
          >
            {points.map(point => (
              <Marker longitude={point.longitude} latitude={point.latitude}>
                <MapPin className="text-white fill-neutral-500" />
              </Marker>
            ))}
            {lineGeoJson
              && (
                <Source id="linedata" type="geojson" data={lineGeoJson}>
                  <Layer {...lineLayer} />
                </Source>
              )}
            {drawingLineGeoJson
              && (
                <Source id="drawingLineData" type="geojson" data={drawingLineGeoJson}>
                  <Layer {...drawingLineLayer} />
                </Source>
              )}
            {ghostPoint
              && (
                <Marker longitude={ghostPoint.longitude} latitude={ghostPoint.latitude}>
                  <MapPin className="text-white fill-neutral-500" />
                </Marker>
              )}
          </Map>
        </div>
        <div id="workflows" className="bg-white w-md h-full p-2 flex flex-col">
          <h2 className="w-full text-center font-bold mb-4">Workflow</h2>
          <div id="pipeline-container" className="w-full basis-full flex flex-col">
            <button className="border-dashed border-2 border-neutral-400 rounded-md p-2 flex justify-center items-center hover:bg-neutral-200">
              <Plus></Plus>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

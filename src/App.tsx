import { featureCollection, lineString, type AllGeoJSON } from "@turf/turf";
import { type CircleLayerSpecification, type FillLayerSpecification, Layer, type LineLayerSpecification, Map, Marker, Source, type SymbolLayerSpecification } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import { MapPin } from "react-feather";
import ContextMenu from "./ContextMenu";

export interface Point {
  latitude: number;
  longitude: number;
}

export interface Line {
  points: Point[];
}

export type ActiveAction = "Pan" | "AddPoint" | "AddLine" | "AddPolygon" | "AddGeojson" | "Erase";

function App() {
  // Map state
  const [lat, setLat] = useState<number>(-33);
  const [lng, setLng] = useState<number>(151);
  const [zoom, setZoom] = useState<number>(11);

  // App state
  const [activeAction, setActiveAction] = useState<ActiveAction>("Pan");
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
	const [geojsons, setGeojsons] = useState<AllGeoJSON[]>([]);

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

	const geojsonsFillLayer: FillLayerSpecification = {
		id: "geojsonsFillLayer",
		source: "geojsons",
		type: "fill",
		paint: {
			"fill-color": "#61616180",
		},
		filter: ["==", ["geometry-type"], "Polygon"],
	};

	const geojsonsLineLayer: LineLayerSpecification = {
		id: "geojsonsLineLayer",
		source: "geojsons",
		type: "line",
		"paint": {
			"line-color": "#616161",
			"line-width": 2,
		}
	}
	
	const geojsonsSymbolLayer: SymbolLayerSpecification = {
		id: "geojsonsSymbolLayer",
		source: "geojsons",
		type: "symbol",
		layout: {
			"icon-image": "pin-marker",
		},
		paint: {
			"icon-color": "#616161",
		},
		filter: ["==", ["geometry-type"], "Point"]
	}

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
                  activeAction === "AddPoint" ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"
                } rounded-t-sm`}
                onClick={() => {
                  if (activeAction === "AddPoint") {
                    setActiveAction("Pan");
                    setGhostPoint(null);
                  } else {
                    setActiveAction("AddPoint");
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
                  activeAction === "AddLine" ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"
                } rounded-t-sm`}
                onClick={() => {
                  if (activeAction === "AddLine") {
                    setActiveAction("Pan");
                    setDrawingLine(null);
                    setGhostPoint(null);
                  } else {
                    setActiveAction("AddLine");
                  }
                }}
              >
                Add line
              </button>
              <button
                className={`disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 ${
                  activeAction !== "AddGeojson" ? "hover:bg-neutral-200 bg-neutral-100" : "bg-green-400"
                }`}
                onClick={() => {
                  if (activeAction === "AddGeojson") {
                    setActiveAction("Pan");
                  } else {
                    setActiveAction("AddGeojson");
                    setDrawingLine(null);
                    setGhostPoint(null);
                  }
                }}
              >
                Add GeoJSON
              </button>
              <button
                className={`mt-2 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 ${
                  activeAction === "Erase"
                    ? "bg-neutral-400 animate-pulse"
                    : "bg-neutral-100 hover:bg-neutral-200"
                } rounded-t-sm`}
                onClick={() => {
                  if (activeAction !== "Erase") {
                    setActiveAction("Erase");
                    setDrawingLine(null);
                    setGhostPoint(null);
                  } else {
                    setActiveAction("Pan");
                  }
                }}
              >
                Erase
              </button>
            </details>
          </div>
        </div>
        <div id="map-segment" className="w-full h-full relative">
          <Map
            style={{ height: "100%", flexGrow: 1 }}
            latitude={lat}
            longitude={lng}
            zoom={zoom}
            pitch={0}
            bearing={0}
						onLoad={e => {
							const res = e.target.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png');
							res.then(d => {
								e.target.addImage('pin-marker', d.data);
							}).catch(e => {
								throw e
							});
						}}
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
              if (activeAction === "AddLine") {
                console.log(drawingLine);
                if (drawingLine && drawingLine.points.length > 0) {
                  const currCursorPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                  setGhostPoint(currCursorPoint);
                }
              } else if (activeAction === "AddPoint") {
                const currCursorPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                setGhostPoint(currCursorPoint);
              }
            }}
            onClick={e => {
              if (activeAction === "AddPoint") {
                const newPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                setPoints([...points, newPoint]);
                setActiveAction("Pan");
                setGhostPoint(null);
              } else if (activeAction === "Erase") {
                console.log(e.type);
              } else if (activeAction === "AddLine") {
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
              if (activeAction === "AddLine") {
                e.preventDefault();
                if (drawingLine !== null) {
                  setLines([...lines, drawingLine]);
                  setDrawingLine(null);
                  setActiveAction("Pan");
                  setGhostPoint(null);
                }
              }
            }}
          >
            {points.map(point => (
              <Marker key={point.latitude + point.longitude} longitude={point.longitude} latitude={point.latitude}>
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
						{
							geojsons.map(currGeojson => (
								<Source id="geojsons" type="geojson" data={currGeojson}>
									<Layer {...geojsonsFillLayer} />
									<Layer {...geojsonsLineLayer} />
									<Layer {...geojsonsSymbolLayer} />
								</Source>
							))
						}
          </Map>
        </div>
        <div id="context-window" className="w-md h-full flex flex-col p-2 gap-2">
          <h2 className="text-center font-bold">Context Menu</h2>
          <ContextMenu
            currentActiveAction={activeAction}
            eraseContext={{ erasablePoints: points, onErasePoint: newPoints => setPoints(newPoints) }}
            newGeojsonContext={{
              onCreateGeojson: newGeojson => {
                console.log(newGeojson);
								setGeojsons([...geojsons, newGeojson]);
              },
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;

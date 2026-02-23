import { type AllGeoJSON, featureCollection, lineString } from "@turf/turf";
import {
  type FillLayerSpecification,
  Layer,
  type LineLayerSpecification,
  Map,
  Marker,
  Source,
  type SymbolLayerSpecification,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import { HelpCircle, MapPin } from "react-feather";
import ContextMenu from "./ContextMenu";
import MappingButton from "./ui/MappingButton";

export interface Point {
  latitude: number;
  longitude: number;
}

export interface Line {
  points: Point[];
}

export type ActiveAction = "Pan" | "AddPoint" | "AddLine" | "AddPolygon" | "AddGeojson" | "PreviewGeojson" | "AddWKT" | "PreviewWKT";
export type Basemap = "colorful" | "neutrino";

function App() {
  // Map state
  const [lat, setLat] = useState<number>(-33);
  const [lng, setLng] = useState<number>(151);
  const [zoom, setZoom] = useState<number>(11);

  const [basemap, setBasemap] = useState<Basemap>("colorful");

  // App state
  const [activeAction, setActiveAction] = useState<ActiveAction>("Pan");
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [geojsons, setGeojsons] = useState<AllGeoJSON[]>([]);
	const [previewGeojson, setPreviewGeojson] = useState<AllGeoJSON | null>(null);

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
    },
  };

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
    filter: ["==", ["geometry-type"], "Point"],
  };

  const drawingLineGeoJson = useMemo(() => {
    if (drawingLine === null) {
      return null;
    } else if (drawingLine.points.length > 0) {
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
        <div id="tools-section" className="w-90 flex flex-col relative border-r border-neutral-400">
          <div className="bg-neutral-100 py-2 px-1 h-12 w-full border-b border-neutral-400 flex flex-row justify-between items-center">
            <p className="font-bold">Actions</p>
          </div>
          <div className="w-full h-full flex flex-col gap-2 overflow-auto p-2">
            <input
              type="search"
              className="w-full border border-neutral-200 p-2 sticky rounded-sm"
              placeholder="Search actions..."
            />
            <div className="bg-neutral-100 p-2 rounded-sm flex flex-col gap-1">
              <div className="border-b border-neutral-300 header-row flex flex-row justify-between items-center py-1">
                <h3 className="font-semibold">Add</h3>
								<HelpCircle
									className="font-normal h-4 text-neutral-500"
								/>
              </div>
              <MappingButton
                isActive={activeAction === "AddPoint"}
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
              </MappingButton>
              <MappingButton
                isActive={activeAction === "AddLine"}
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
              </MappingButton>
              <MappingButton
                isActive={activeAction === "AddGeojson"}
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
              </MappingButton>
              <MappingButton
                isActive={activeAction === "AddWKT"}
                onClick={() => {
                  if (activeAction === "AddWKT") {
                    setActiveAction("Pan");
                  } else {
                    setActiveAction("AddWKT");
                    setDrawingLine(null);
                    setGhostPoint(null);
                  }
                }}
              >
                Add Wellknown Text (WKT)
              </MappingButton>
            </div>
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
              const res = e.target.loadImage("https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png");
              res.then(d => {
                e.target.addImage("pin-marker", d.data);
              }).catch((e: unknown) => {
                throw e;
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
            mapStyle={`https://tiles.versatiles.org/assets/styles/${basemap}/style.json`}
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
            {geojsons.map(currGeojson => (
              <Source key={JSON.stringify(currGeojson)} id="geojsons" type="geojson" data={currGeojson}>
                <Layer {...geojsonsFillLayer} />
                <Layer {...geojsonsLineLayer} />
                <Layer {...geojsonsSymbolLayer} />
              </Source>
            ))}
						{previewGeojson !== null &&
							<Source key={JSON.stringify(previewGeojson)} id='preview-geojson' type='geojson' data={previewGeojson}>
                <Layer {...geojsonsFillLayer} />
                <Layer {...geojsonsLineLayer} />
                <Layer {...geojsonsSymbolLayer} />
							</Source>
						}
          </Map>
        </div>
        <div id="context-window" className="w-md h-full border-l border-neutral-400 flex flex-col">
					{/* <ObjectMenu /> */}
          <ContextMenu
            currentActiveAction={activeAction}
            eraseContext={{
              erasablePoints: points,
              onErasePoint: newPoints => {
                setPoints(newPoints);
              },
            }}
            onChangeActiveAction={newAction => {
              setActiveAction(newAction);
            }}
            newGeojsonContext={{
              onCreateGeojson: newGeojson => {
                console.log(newGeojson);
                setGeojsons([...geojsons, newGeojson]);
              },
							onLiveUpdateGeojson: newGeojson => {
								setPreviewGeojson(newGeojson);
								console.log(newGeojson);
							}
            }}
            basemap={basemap}
            onChangeBasemap={e => {
              setBasemap(e);
            }}
          />
        </div>
      </div>
    </>
  );
}

export default App;

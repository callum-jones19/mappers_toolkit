import { type AllGeoJSON } from "@turf/turf";
import { Layer, Map, Marker, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useState } from "react";
import { MapPin } from "react-feather";
import ContextMenu from "./ContextMenu";
import { geojsonsFillLayer, geojsonsLineLayer, geojsonsSymbolLayer } from "./LayerDefinitions";
import ToolSidebar from "./ToolSidebar";
import ActionSidebar from "./ActionSidebar";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Point {
  position: Coordinate;
  id: string;
}

export interface Line {
  points: Coordinate[];
  id: string;
}

export interface MappedGeojson {
  geojson: AllGeoJSON;
  id: string;
}

export type ActiveAction =
  | "None"
  | "AddPoint"
  | "AddLine"
  | "AddPolygon"
  | "AddGeojson"
  | "PreviewGeojson"
  | "AddWKT"
  | "PreviewWKT";
export type MapMode = "Pan" | "Select";
export type Basemap = "colorful" | "neutrino";

function App() {
  // Map state
  const [lat, setLat] = useState<number>(-33);
  const [lng, setLng] = useState<number>(151);
  const [zoom, setZoom] = useState<number>(11);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [basemap, setBasemap] = useState<Basemap>("colorful");

  // App state
  const [activeAction, setActiveAction] = useState<ActiveAction>("None");
  // const [mapMode, setMapMode] = useState<MapMode>("Pan");
  const [points, setPoints] = useState<Point[]>([]);
  // const [lines, setLines] = useState<Line[]>([]);
  const [geojsons, setGeojsons] = useState<MappedGeojson[]>([]);
  const [previewGeojson, setPreviewGeojson] = useState<AllGeoJSON | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<null | Point>(null);
  const [selectedPoint, setSelectedPoint] = useState<null | Point>(null);

  const pointIdCounter = useRef<number>(0);
  const geojsonsIdCounter = useRef<number>(0);

  function createNewPoint(position: Coordinate) {
    const newPointId = pointIdCounter.current;
    pointIdCounter.current = pointIdCounter.current + 1;
    const newPoint: Point = {
      id: newPointId.toString(),
      position,
    };

    return newPoint;
  }

  return (
    <>
      <div id="app-container" className="w-screen h-screen flex flex-row">
        <div id="tools-sidebar" className="w-72 h-full border-r border-neutral-400 shrink-0">
          {activeAction !== "None"
            && (
              <ContextMenu
                currentActiveAction={activeAction}
                onChangeActiveAction={newAction => {
                  setActiveAction(newAction);
                }}
                newGeojsonContext={{
                  onCreateGeojson: g => {
                    const currGeojsonId = geojsonsIdCounter.current;
                    geojsonsIdCounter.current += 1;
                    const newGeojson: MappedGeojson = {
                      geojson: g,
                      id: currGeojsonId.toString(),
                    };
                    setGeojsons([...geojsons, newGeojson]);
                  },
                  onLiveUpdateGeojson: newGeojson => {
                    setPreviewGeojson(newGeojson);
                    console.log(newGeojson);
                  },
                }}
                basemap={basemap}
                onChangeBasemap={e => {
                  setBasemap(e);
                }}
                selectedPoint={selectedPoint}
              />
            )}
          {activeAction === "None"
            && (
              <ToolSidebar
                activeAction={activeAction}
                onChangeActiveAction={newActiveAction => {
                  setActiveAction(newActiveAction);
                }}
              />
            )}
        </div>
        <div
          id="map-segment"
          className='w-full h-full relative grow'
        >
          {/* <div className="absolute z-30 bg-white top-2 left-2 p-1 flex flex-row gap-1 items-center justify-between shadow-md rounded-sm"> */}
          {/*   <MappingButton */}
          {/*     isActive={mapMode === "Pan"} */}
          {/*     onClick={() => { */}
          {/*       setMapMode("Pan"); */}
          {/*     }} */}
          {/*   > */}
          {/*     <Move className="h-5 w-5" /> */}
          {/*   </MappingButton> */}
          {/*   <MappingButton */}
          {/*     isActive={mapMode === "Select"} */}
          {/*     onClick={() => { */}
          {/*       setMapMode("Select"); */}
          {/*     }} */}
          {/*   > */}
          {/*     <MousePointer className="h-5 w-5" /> */}
          {/*   </MappingButton> */}
          {/* </div> */}
          <Map
            style={{
              height: "100%",
              flexGrow: 1,
            }}
            cursor={activeAction === "AddPoint"
              ? "crosshair"
              : isDragging
              ? "grabbing"
              : hoveredPoint !== null
              ? "default"
              : "grab"}
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
            onDragStart={() => {
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
            }}
            onZoom={e => {
              setLng(e.viewState.longitude);
              setLat(e.viewState.latitude);
              setZoom(e.viewState.zoom);
            }}
            mapStyle={`https://tiles.versatiles.org/assets/styles/${basemap}/style.json`}
            onClick={e => {
              if (activeAction === "AddPoint") {
                const newP = createNewPoint({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
                setPoints([...points, newP]);
              }
            }}
          >
            {points.map(point => (
              <Marker
                key={point.id}
                longitude={point.position.longitude}
                latitude={point.position.latitude}
              >
                <MapPin
                  className={`text-white
										${
                    hoveredPoint?.id === point.id
                      ? "fill-blue-500 cursor-default"
                      : selectedPoint?.id === point.id
                      ? "fill-blue-700"
                      : "fill-neutral-500"
                  }`}
                  onClick={() => {
										if (selectedPoint !== null && selectedPoint.id === point.id) {
											setSelectedPoint(null);
										} else {
											setSelectedPoint(point);

										}
                  }}
                  onMouseEnter={() => {
                    setHoveredPoint(point);
                  }}
                  onMouseLeave={() => {
                    setHoveredPoint(null);
                  }}
                />
              </Marker>
            ))}
            {geojsons.map(currGeojson => (
              <Source
                key={currGeojson.id}
                id="geojsons"
                type="geojson"
                data={currGeojson.geojson}
              >
                <Layer {...geojsonsFillLayer} />
                <Layer {...geojsonsLineLayer} />
                <Layer {...geojsonsSymbolLayer} />
              </Source>
            ))}
            {previewGeojson !== null
              && (
                <Source
                  key={JSON.stringify(previewGeojson)}
                  id="preview-geojson"
                  type="geojson"
                  data={previewGeojson}
                >
                  <Layer {...geojsonsFillLayer} />
                  <Layer {...geojsonsLineLayer} />
                  <Layer {...geojsonsSymbolLayer} />
                </Source>
              )}
          </Map>
        </div>
        <div id="context-window" className="w-72 h-full border-l border-neutral-400 flex flex-col shrink-0">
					<ActionSidebar
						selectedPoint={selectedPoint}
						onDeletePoint={deletedPoint => {
							setSelectedPoint(null);
							const updatedPoints = points.filter(p => p.id !== deletedPoint.id);
							setPoints(updatedPoints);
						}}
					/>
        </div>
      </div>
    </>
  );
}

export default App;

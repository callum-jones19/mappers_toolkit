import { type AllGeoJSON, featureCollection, lineString } from "@turf/turf";
import {
  Layer,
  Map,
  Marker,
  Source,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import { MapPin, MousePointer, Move } from "react-feather";
import ContextMenu from "./ContextMenu";
import MappingButton from "./ui/MappingButton";
import { geojsonsFillLayer, geojsonsLineLayer, geojsonsSymbolLayer, lineLayer } from "./LayerDefinitions";
import ToolSidebar from "./ToolSidebar";

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
				<ToolSidebar
					activeAction={activeAction}
					onChangeActiveAction={newActiveAction => {
						setActiveAction(newActiveAction);
					}}
				/>
        <div
					id="map-segment"
					className={`w-full h-full relative`}
				>
					<div
						className="absolute z-30 bg-white top-2 left-2 p-1 flex flex-row gap-1 items-center justify-between shadow-md rounded-sm"
					>
						<MappingButton isActive>
							<Move className="h-5 w-5" />
						</MappingButton>
						<MappingButton>
							<MousePointer className="h-5 w-5" />
						</MappingButton>
					</div>
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
            onClick={e => {
              if (activeAction === "AddPoint") {
                const newPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
                setPoints([...points, newPoint]);
                setActiveAction("Pan");
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

import { featureCollection, lineString } from '@turf/turf';
import { Layer, Map, Marker, Source, type LineLayerSpecification, type SourceSpecification } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMemo, useState } from 'react';
import { Info, MapPin } from 'react-feather';

interface Point {
	latitude: number;
	longitude: number;
}

interface Line {
	points: Point[];
}

type ActiveAction = "Default" | "PlacePoint" | "PlaceLine" | "PlacePolygon" | "DeletePoint";

function App() {

  // Map state
  const [lat, setLat] = useState<number>(-33.822650425718024);
  const [lng, setLng] = useState<number>(151.17170925183657);
  const [zoom, setZoom] = useState<number>(13);

  // App state
  const [activeAction, setActiveAction] = useState<ActiveAction>("Default");
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  
  const displayToast = useMemo(() => {
	if (activeAction === 'PlacePoint' || activeAction === 'PlaceLine') {
		return true;
	} else {
		return false;
	}
  }, [activeAction]);

  const toastText = useMemo(() => {
	if (activeAction === 'Default') {
		return "";
	} else if (activeAction === "PlacePoint") {
		return "Left click the map to place a point at the cursor's location"
	} else if (activeAction === "PlaceLine") {
		return "Left click to place the next vertex of the line. Double click to place the next vertex and complete the line."
	} else {
		return "";
	}
  }, [activeAction]);


  // Temporary states
  // Track a new line as it is being drawn.
  const [drawingLine, setDrawingLine] = useState<Line | null>(null);
  const [ghostLine, setGhostLine] = useState<Line | null>(null);
  const [ghostPoint, setGhostPoint] = useState<Point | null>(null);


  // Generated layer data
  const drawingLineLayer: LineLayerSpecification = {
	  id: 'drawingLineLayer',
	  source: 'drawingLineData',
	  type: 'line',
	  paint: {
		  "line-color": "#000000",
		  "line-width": 2,
	  }
  };

  const drawingLineGeoJson = useMemo(() => {
  	if (drawingLine === null) {
		return null;
	} else if (drawingLine !== null && drawingLine.points.length > 1) {
		const lineToPositionArr = drawingLine.points.map(p => [p.longitude, p.latitude]);
		const lineStr = lineString(lineToPositionArr, { name: 'drawingLine' });
		return lineStr;
	} else {
		return null;
	}
  }, [drawingLine]);

  // Confirmed, drawn lines
  const lineLayer: LineLayerSpecification = {
	  id: 'line-layer-1',
	  source: 'linedata',
	  type: 'line',
	  paint: {
		  "line-color": "#000000",
		  "line-width": 2,
	  }
  };

  const lineGeoJson = useMemo(() => {
  	if (lines.length === 0) {
		return null;
	} else {
		const allLinesAsGeoJson = lines.map(targetLine => {
			const lineToPositionArr = targetLine.points.map(p => [p.longitude, p.latitude]);
			const lineStr = lineString(lineToPositionArr, { name: 'test' });
			return lineStr;
		});

		// Add the ghost line
		if (ghostLine) {
			const ghostLineStr = lineString(ghostLine.points.map(p => [p.longitude, p.latitude]), { name: 'ghostLine' });
			allLinesAsGeoJson.push(ghostLineStr);
		}
		
		const consolidatedGeoJsons = featureCollection(allLinesAsGeoJson);
		return consolidatedGeoJsons;
	}
  }, [lines, ghostLine]);

  return (
    <>
	  <div id='app-container' className='w-screen h-screen flex flex-row'>
	  	<div className='w-xs flex flex-col gap-2 relative'>
			<div id='tools-section' className='w-full h-full flex flex-col p-2 gap-2 overflow-auto'>
				<input type='search' className='w-full bg-neutral-300 p-2 rounded-sm sticky' placeholder='Search tool...' />
				<details open className='w-full'>
					<summary className='font-bold'>Draw</summary>
					<button
						className={`mt-2 w-full p-1 ${activeAction === 'PlacePoint' ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"} rounded-t-sm`}
						onClick={() => {
							if (activeAction === 'PlacePoint') {
								setActiveAction('Default');
							} else {
								setActiveAction('PlacePoint')
							}
						}}
					>
						Add point
					</button>
					<button disabled className='mt-1 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 hover:bg-neutral-200 bg-neutral-100'>Add polygon</button>
					<button
						className={`mt-2 w-full p-1 ${activeAction === 'PlaceLine' ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"} rounded-t-sm`}
						onClick={() => {
							if (activeAction === 'PlaceLine') {
								setActiveAction('Default');
							} else {
								setActiveAction('PlaceLine');
							}
						}}
					>
						Add line
					</button>
					<button disabled className='mt-1 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 hover:bg-neutral-200 bg-neutral-100 rounded-b-sm'>Import GeoJSON</button>
				</details>
				<details open className='w-full'>
					<summary className='font-bold'>Erase</summary>
					<button
						disabled
						className={`mt-2 disabled:bg-neutral-500 disabled:text-neutral-400 w-full p-1 ${activeAction === 'DeletePoint' ? "bg-neutral-400 animate-pulse" : "bg-neutral-100 hover:bg-neutral-200"} rounded-t-sm`}
						onClick={() => {
							if (activeAction !== 'DeletePoint') {
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
							setPoints([]);
						}}
					>
						Erase all points
					</button>
					<button
						disabled={lines.length === 0}
						className={`mt-1 w-full disabled:bg-neutral-500 disabled:text-neutral-400 p-1 bg-neutral-100 hover:bg-neutral-200 rounded-b-sm`}
						onClick={() => {
							setLines([]);
						}}
					>
						Erase all lines
					</button>
				</details>
			</div>
		</div>
		<div className='w-full h-full relative'>
			{displayToast && <div
				id='toast'
				className='absolute z-20 h-14 p-4 min-w-30 max-w-3/4 bottom-10 left-10 bg-white shadow-md rounded-sm'
			>
				<div className='flex flex-row gap-3 justify-between h-full w-full items-center'>
					<Info />
					<p>{toastText}</p>
				</div>
			</div>}
			<Map
			  style={{ height: '100%', flexGrow: 1 }}
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
				if (activeAction === 'PlaceLine') {
					if (drawingLine && drawingLine.points.length > 0) {
						const currCursorPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
						const ghostLine: Line = { points: [ drawingLine.points[drawingLine.points.length - 1], currCursorPoint ] };
						setGhostLine(ghostLine);
					}
				} else if (activeAction === 'PlacePoint') {
					const currCursorPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
					setGhostPoint(currCursorPoint);
				}
			  }}
			  onClick={e => {
				  if (activeAction === 'PlacePoint') {
					  const newPoint: Point = { latitude: e.lngLat.lat, longitude: e.lngLat.lng };
					  setPoints([...points, newPoint]);
					  setActiveAction('Default');
					  setGhostPoint(null);
				  } else if (activeAction === 'DeletePoint') {
					  console.log(e.type);
				  } else if (activeAction === 'PlaceLine') {
					  const newLine: Line = { points: [{ latitude: e.lngLat.lat, longitude: e.lngLat.lng }] };
				  	  if (drawingLine === null) {
						  // Start drawing from scratch
						  setDrawingLine(newLine);
					  } else {
						  // Add on to existing drawing line
						  setDrawingLine({points: [...drawingLine.points, { latitude: e.lngLat.lat, longitude: e.lngLat.lng }]});
					  }
				  }
			  }}
			  onDblClick={e => {
				  if (activeAction === 'PlaceLine') {
					  e.preventDefault();
					  if (drawingLine !== null) {
						  setLines([...lines, drawingLine]);
						  setDrawingLine(null);
						  setActiveAction('Default')
						  setGhostLine(null);
					  }
				  }
			  }}	
			>
				{points.map(point => (
					<Marker longitude={point.longitude} latitude={point.latitude}>
						<MapPin className='text-white fill-neutral-500' />
					</Marker>
				))}
				{lineGeoJson &&
					<Source id="linedata" type='geojson' data={lineGeoJson}>
						<Layer {...lineLayer} />
					</Source>
				}
				{drawingLineGeoJson &&
					<Source id="drawingLineData" type='geojson' data={drawingLineGeoJson}>
						<Layer {...drawingLineLayer}/>
					</Source>
				}
				{ghostPoint &&
					<Marker longitude={ghostPoint.longitude} latitude={ghostPoint.latitude}>
						<MapPin className='text-white fill-neutral-500' />
					</Marker>
				}
			</Map>
		</div>
	  </div>
    </>
  )
}

export default App

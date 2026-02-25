import type { FillLayerSpecification, LineLayerSpecification, SymbolLayerSpecification } from "@vis.gl/react-maplibre";

// Generated layer data
export const drawingLineLayer: LineLayerSpecification = {
  id: "drawingLineLayer",
  source: "drawingLineData",
  type: "line",
  paint: {
    "line-color": "#000000",
    "line-width": 2,
  },
};

export const geojsonsFillLayer: FillLayerSpecification = {
  id: "geojsonsFillLayer",
  source: "geojsons",
  type: "fill",
  paint: {
    "fill-color": "#61616180",
  },
  filter: ["==", ["geometry-type"], "Polygon"],
};

export const geojsonsLineLayer: LineLayerSpecification = {
  id: "geojsonsLineLayer",
  source: "geojsons",
  type: "line",
  "paint": {
    "line-color": "#616161",
    "line-width": 2,
  },
};

export const geojsonsSymbolLayer: SymbolLayerSpecification = {
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

// Confirmed, drawn lines
export const lineLayer: LineLayerSpecification = {
  id: "line-layer-1",
  source: "linedata",
  type: "line",
  paint: {
    "line-color": "#000000",
    "line-width": 2,
  },
};

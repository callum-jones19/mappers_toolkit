import { check } from "@placemarkio/check-geojson";
import { type AllGeoJSON } from "@turf/turf";
import { useState } from "react";
import { ChevronDown, X } from "react-feather";
import type { ActiveAction, Basemap, Point } from "./App";
import MappingButton from "./ui/MappingButton";

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
  onChangeActiveAction: (newActive: ActiveAction) => void;
  eraseContext: EraseContext;
  newGeojsonContext: NewGeoJsonContext;
  basemap: Basemap;
  onChangeBasemap: (newBasemap: Basemap) => void;
}

type AddGeojsonOptions = "JSON" | "IMPORT";

export default function ContextMenu({
  currentActiveAction,
  onChangeActiveAction,
  // eraseContext,
  newGeojsonContext,
  basemap,
  onChangeBasemap,
}: ContxtMenuProps) {
  // If AddGeojson context, validate that the entered geojson is valid.
  const [newGeojson, setNewGeojson] = useState<string>("");
  const [lastGeojsonInvalid, setLastGeojsonInvalid] = useState<boolean>(false);

  const [currentGeojsonMode, setCurrentGeojsonMode] = useState<AddGeojsonOptions>("JSON");
  return (
    <>
      <div className="w-full h-full flex flex-col gap-1">
        <div className="bg-neutral-100 py-2 px-1 h-12 w-full border-b border-neutral-400 flex flex-row justify-between items-center">
          <p className="font-bold">
            {"Map"}
            <span className="font-normal">
              {currentActiveAction === "Pan"
                ? ""
                : currentActiveAction === "AddPoint"
                ? " > Add Point"
                : currentActiveAction === "AddLine"
                ? " > Add Line"
                : currentActiveAction === "AddGeojson"
                ? " > Add GeoJSON"
                : currentActiveAction === "AddPolygon"
                ? " > Add Polygon"
                : " > " + currentActiveAction}
            </span>
          </p>
          <button
            hidden={currentActiveAction === "Pan"}
            onClick={() => {
              onChangeActiveAction("Pan");
            }}
            className="w-fit hover:bg-white hover:text-blue-600"
            type="button"
          >
            <X />
          </button>
        </div>
        <div className="w-full basis-full flex flex-col gap-2 p-2">
          {currentActiveAction === "Pan"
            && (
              <div className="w-full flex flex-col p-2 gap-2 bg-neutral-100 rounded-sm">
                <div className="border-b border-neutral-300 header-row flex flex-row justify-between items-center py-1">
                  <h3>Map Settings</h3>
                  <ChevronDown />
                </div>
                <div className="flex flex-row justify-between items-center">
                  <label htmlFor="basemaps">Basemap</label>
                  <select
                    defaultValue={"colorful"}
                    onChange={e => {
                      // FIXME
                      console.log(e.currentTarget.value);
                      onChangeBasemap(e.currentTarget.value);
                    }}
                    name="basemaps"
                    id="basemaps"
                    className="p-1 rounded-sm border-neutral-400 bg-neutral-200 border"
                  >
                    <option value="colorful">Colorful</option>
                    <option value="neutrino">Neutrino</option>
                  </select>
                </div>
              </div>
            )}
          {currentActiveAction === "Erase"
            && (
              <>
              </>
            )}
          {currentActiveAction === "AddGeojson"
            && (
              <>
								<div className="w-full flex flex-row justify-evenly gap-1 bg-neutral-100 rounded-sm p-1">
									<MappingButton
										isActive={currentGeojsonMode === 'JSON'}
										onClick={() => {setCurrentGeojsonMode('JSON')}}
									>
										JSON
									</MappingButton>
									<MappingButton
										isActive={currentGeojsonMode === 'IMPORT'}
										onClick={() => {setCurrentGeojsonMode('IMPORT')}}
									>
										Upload
									</MappingButton>
								</div>
                <div className="w-full h-full flex flex-col bg-neutral-100 rounded-sm p-2 gap-2">
                  {currentGeojsonMode === "JSON"
                    && (
                      <div className="w-full h-full flex flex-col gap-2">
                        <textarea
                          className={`border ${
                            lastGeojsonInvalid ? "border-red-300 bg-red-50" : "border-neutral-300"
                          } h-full w-full resize-none bg-neutral-50 rounded-sm`}
                          value={newGeojson}
                          onChange={e => {
                            setNewGeojson(e.currentTarget.value);
                            setLastGeojsonInvalid(false);
                          }}
                        />
                        <MappingButton
                          disabled={newGeojson.length === 0}
                          type="button"
                          className="p-1 hover:bg-blue-500 hover:text-white font-bold rounded-sm bg-neutral-50 border border-neutral-500"
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
                        </MappingButton>
                      </div>
                    )}
                  {currentGeojsonMode === "IMPORT"
                    && (
                      <div className="flex flex-col w-full justify-between items-center gap-1">
                        <input
                          type="file"
                          id="geojson-upload"
                          className="w-full border border-neutral-300 rounded-sm p-1"
                          accept=".json,.geojson"
                        />
                        <button className="bg-white border-neutral-300 rounded-sm p-1">Confirm</button>
                      </div>
                    )}
                </div>
              </>
            )}
        </div>
      </div>
    </>
  );
}

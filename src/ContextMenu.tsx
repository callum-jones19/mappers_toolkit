import { check } from "@placemarkio/check-geojson";
import { type AllGeoJSON } from "@turf/turf";
import { useState } from "react";
import { X } from "react-feather";
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
	onChangeBasemap
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
        <div className="w-full basis-full flex flex-col gap-2">
          {currentActiveAction === "Pan"
            && (
              <div className="w-full h-full flex flex-col p-2">
								<div className="flex flex-row justify-between">
									<label htmlFor='basemaps'>Basemap</label>
									<select
										defaultValue={basemap}
										onChange={e => {
											// FIXME
											console.log(e.currentTarget.value);
											onChangeBasemap(e.currentTarget.value);
										}}
										name='basemaps'
										id='basemaps'
									>
										<option value='colorful'>Colorful</option>
										<option value='neutrino'>Neutrino</option>
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
                <div className="h-full w-full flex flex-col gap-2 p-2">
                  <div className="w-full h-full flex flex-col gap-2 bg-neutral-50 border border-neutral-200 p-2 ">
                    <div className="w-full flex flex-row justify-between items-center">
                      {/* <MappingButton */}
                      {/*   isActive={currentGeojsonMode === "JSON"} */}
                      {/*   onClick={() => { */}
                      {/*     setCurrentGeojsonMode("JSON"); */}
                      {/*   }} */}
                      {/* > */}
                      {/*   JSON */}
                      {/* </MappingButton> */}
                      {/* <MappingButton */}
                      {/*   isActive={currentGeojsonMode === "IMPORT"} */}
                      {/*   onClick={() => { */}
                      {/*     setCurrentGeojsonMode("IMPORT"); */}
                      {/*   }} */}
                      {/* > */}
                      {/*   Upload */}
                      {/* </MappingButton> */}
											<label htmlFor="geojson-source">GeoJSON Source:</label>
											<select
												id='geojson-source'
												name="geojson-source"
												className="bg-neutral-50 py-1 px-2 border border-neutral-300 rounded-sm"
												defaultValue='json'
												onChange={e => {
													if (e.currentTarget.value === "json") {
														setCurrentGeojsonMode('JSON');
													} else {
														setCurrentGeojsonMode('IMPORT');
													}
												}}
											>
												<option value='json'>JSON</option>
												<option value='upload'>Upload</option>
											</select>
                    </div>
                    {currentGeojsonMode === "JSON"
                      && (
                        <div className="w-full h-full flex flex-col gap-2">
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
                          <MappingButton
                            disabled={newGeojson.length === 0}
                            type="button"
                            className="disabled:bg-neutral-300 disabled:text-neutral-500 border border-neutral-400 hover:bg-blue-600 hover:text-white font-bold p-2"
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
                        <div className="flex flex-col w-full justify-between items-center">
													<label
														htmlFor='geojson-upload'
														className="border border-neutral-300"
													>
														Select Files
													</label>
                          <input
														type="file"
														id='geojson-upload'
														className="w-full border border-neutral-300 rounded-sm p-1"
														accept=".json,.geojson"
													/>
													<button>Confirm</button>
                        </div>
                      )}
                  </div>
                </div>
              </>
            )}
        </div>
      </div>
    </>
  );
}

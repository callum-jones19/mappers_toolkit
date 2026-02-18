import { check } from "@placemarkio/check-geojson";
import { type AllGeoJSON } from "@turf/turf";
import { useState } from "react";
import { X } from "react-feather";
import type { ActiveAction, Point } from "./App";
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
}

type AddGeojsonOptions = "JSON" | "IMPORT";

export default function ContextMenu({
  currentActiveAction,
  onChangeActiveAction,
  // eraseContext,
  newGeojsonContext,
}: ContxtMenuProps) {
  // If AddGeojson context, validate that the entered geojson is valid.
  const [newGeojson, setNewGeojson] = useState<string>("");
  const [lastGeojsonInvalid, setLastGeojsonInvalid] = useState<boolean>(false);

  const [currentGeojsonMode, setCurrentGeojsonMode] = useState<AddGeojsonOptions>("JSON");

  return (
    <>
      <div className="w-full h-full flex flex-col gap-1">
        <div className="bg-blue-600 text-white p-2 w-full border-b border-neutral-600 flex flex-row justify-between items-center">
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
                  <div className="w-full h-full flex flex-col">
                    <div className="w-full flex flex-row">
                      <MappingButton
                        isActive={currentGeojsonMode === "JSON"}
                        onClick={() => {
                          setCurrentGeojsonMode("JSON");
                        }}
                      >
                        JSON
                      </MappingButton>
                      <MappingButton
                        isActive={currentGeojsonMode === "IMPORT"}
                        onClick={() => {
                          setCurrentGeojsonMode("IMPORT");
                        }}
                      >
                        Upload
                      </MappingButton>
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
                            className="disabled:bg-neutral-300 disabled:text-neutral-500 bg-green-300 p-2"
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
                        <div className="p-2">
                          <MappingButton>
                            Upload file
                          </MappingButton>
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

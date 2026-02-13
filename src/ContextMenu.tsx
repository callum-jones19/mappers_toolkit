import type { ActiveAction, Point } from "./App";

export interface EraseContext {
  erasablePoints: Point[];
  onErasePoint: (newPoints: Point[]) => void;
  onHoverPoint?: (hoveredPoint: Point) => void;
}

export interface ContxtMenuProps {
  currentActiveAction: ActiveAction;
  eraseContext: EraseContext;
}

export default function ContextMenu({ currentActiveAction, eraseContext }: ContxtMenuProps) {
  return (
    <>
      <div className="w-full h-full flex flex-col gap-1">
        <p>Currently active: {currentActiveAction}</p>
        {currentActiveAction === "Erase"
          && (
            <>
							<button
								className="bg-neutral-100 hover:bg-neutral-200 p-2 rounded-md"
								onClick={() => {
									const confirmation = confirm("Are you sure you want to erase every point on the map? This cannot be undone.");
									if (confirmation) {
										eraseContext.onErasePoint([]);
									}
								}}
							>
								Erase All
							</button>
              {eraseContext.erasablePoints.map(point => (
                <button
                  className="bg-neutral-100 hover:bg-neutral-300 p-2"
                  key={point.latitude + "," + point.longitude}
                  onClick={() => {
                    const pointsMinusRemoved = eraseContext
                      .erasablePoints
                      .filter(p2 => (
                        p2.latitude !== point.latitude && p2.longitude !== point.longitude
                      ));
                    eraseContext.onErasePoint(pointsMinusRemoved);
                  }}
                >
                  {point.longitude}, {point.latitude}
                </button>
              ))}
							{eraseContext.erasablePoints.length === 0 &&
								<p>No points on the map</p>
							}
            </>
          )}
      </div>
    </>
  );
}

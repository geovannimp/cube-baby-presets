import clsx from "clsx";
import { CSSProperties, useMemo } from "react";

interface KnobProps {
  size?: number;
  min?: number;
  max?: number;
  numTicks?: number;
  degrees?: number;
  value?: number;
  style?: CSSProperties;
  tickClassName?: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const convertRange = (
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
  oldValue: number
) => {
  return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
};

export const Knob = ({
  size = 150,
  min = 10,
  max = 30,
  numTicks = 0,
  degrees = 270,
  value = 0,
  disabled = false,
  onChange,
  style,
  tickClassName,
}: KnobProps) => {
  const fullAngle = degrees;
  const startAngle = (360 - degrees) / 2;
  const endAngle = startAngle + degrees;

  const deg = useMemo(
    () => Math.floor(convertRange(min, max, startAngle, endAngle, value)),
    [min, max, startAngle, endAngle, value]
  );

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // @ts-ignore
    const knob = e.target.getBoundingClientRect();
    const pts = {
      x: knob.left + knob.width / 2,
      y: knob.top + knob.height / 2,
    };
    const moveHandler = (e: MouseEvent) => {
      let currentDeg = getDeg(e.clientX, e.clientY, pts);
      let newValue = Math.floor(
        convertRange(startAngle, endAngle, min, max, currentDeg)
      );
      onChange(newValue);
    };
    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", (e) => {
      document.removeEventListener("mousemove", moveHandler);
    });
  };

  const getDeg = (cX: number, cY: number, pts: { x: number; y: number }) => {
    const x = cX - pts.x;
    const y = cY - pts.y;
    let deg = (Math.atan(y / x) * 180) / Math.PI;
    if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
      deg += 90;
    } else {
      deg += 270;
    }
    let finalDeg = Math.min(Math.max(startAngle, deg), endAngle);
    return finalDeg;
  };

  const renderTicks = () => {
    let ticks = [];
    const incr = fullAngle / numTicks;
    const tickSize = size / 2;
    for (let deg = startAngle; deg <= endAngle; deg += incr) {
      const tick = {
        deg: deg,
        tickStyle: {
          height: tickSize + 6,
          left: tickSize - 2,
          top: tickSize,
          transform: "rotate(" + deg + "deg)",
          transformOrigin: "top",
        },
      };
      ticks.push(tick);
    }
    return ticks;
  };

  let knobStyle = useMemo(
    () => ({
      width: size,
      height: size,
      ...style,
    }),
    [size, style]
  );

  let innerStyle = useMemo(
    () => ({
      width: size * 0.6,
      height: size * 0.6,
      transform: "rotate(" + deg + "deg)",
    }),
    [size, deg]
  );

  let outerStyle = useMemo(
    () => ({
      ...knobStyle,
    }),
    [knobStyle]
  );

  return (
    <div className="flex relative box-content" style={knobStyle}>
      <div className="absolute">
        {numTicks
          ? renderTicks().map((tick, i) => (
              <div
                key={i}
                className="absolute bg-transparent w-1"
                style={tick.tickStyle}
              >
                <div
                  className={clsx(
                    "absolute bottom-0 w-1 h-1 rounded-full bg-gray-700",
                    tickClassName
                  )}
                />
              </div>
            ))
          : null}
      </div>
      <div
        className="flex justify-center items-center rounded-full border-2 border-gray-400 bg-gray-300"
        style={outerStyle}
        onMouseDown={!disabled ? startDrag : undefined}
      >
        <div
          className="relative flex justify-center items-end rounded-full bg-gray-700"
          style={innerStyle}
        >
          <div className="w-1/12 h-1/5 bg-gray-300 mb-0.5" />
        </div>
      </div>
    </div>
  );
};

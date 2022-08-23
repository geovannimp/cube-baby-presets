import { CSSProperties, useEffect, useMemo, useState } from "react";
import s from "./Knob.module.css";

interface KnobProps {
  size?: number;
  min?: number;
  max?: number;
  numTicks?: number;
  degrees?: number;
  value?: number;
  style?: CSSProperties;
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
          height: tickSize + 5,
          left: tickSize - 1,
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
    <div className={s.knob} style={knobStyle}>
      <div className={s.ticks}>
        {numTicks
          ? renderTicks().map((tick, i) => (
              <div key={i} className={s.tick} style={tick.tickStyle} />
            ))
          : null}
      </div>
      <div
        className={s.knobOuter}
        style={outerStyle}
        onMouseDown={!disabled ? startDrag : undefined}
      >
        <div className={s.knobInner} style={innerStyle}>
          <div className={s.grip} />
        </div>
      </div>
    </div>
  );
};

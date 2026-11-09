import React, { useState } from 'react';
import { WEEKDAYS, Weekday } from '../utils/studyEngine';

interface StudyAreaChartProps {
  weeklyMap: Record<Weekday, number>;
  dailyTargetHours: number;
  selectedDay: Weekday | null;
  onSelectDay: (day: Weekday) => void;
  chartType: 'area' | 'bar';
}

export const StudyAreaChart: React.FC<StudyAreaChartProps> = ({
  weeklyMap,
  dailyTargetHours,
  selectedDay,
  onSelectDay,
  chartType,
}) => {
  const [hoveredDay, setHoveredDay] = useState<Weekday | null>(null);

  const values = WEEKDAYS.map((d) => weeklyMap[d] || 0);
  const maxVal = Math.max(6, dailyTargetHours + 1, ...values);
  const yMax = Math.ceil(maxVal);

  // SVG coordinate system
  const width = 760;
  const height = 290;
  const padLeft = 48;
  const padRight = 28;
  const padTop = 28;
  const padBottom = 44;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const points = WEEKDAYS.map((day, idx) => {
    const val = weeklyMap[day] || 0;
    const x = padLeft + (idx / (WEEKDAYS.length - 1)) * plotWidth;
    const y = padTop + plotHeight - (val / yMax) * plotHeight;
    return { day, val, x, y, idx };
  });

  // Generate smooth monotone cubic bezier path (fl_chart isCurved: true equivalent)
  const buildSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpy2 = p1.y;
      d += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const baselineY = padTop + plotHeight;
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY.toFixed(1)} L ${points[0].x.toFixed(1)} ${baselineY.toFixed(1)} Z`;

  const targetY =
    padTop + plotHeight - (Math.min(dailyTargetHours, yMax) / yMax) * plotHeight;

  const yTicks = [0, Math.round(yMax * 0.25 * 10) / 10, Math.round(yMax * 0.5 * 10) / 10, Math.round(yMax * 0.75 * 10) / 10, yMax];

  const activeDay = hoveredDay || selectedDay || 'Fri';
  const activePoint = points.find((p) => p.day === activeDay) || points[0];

  return (
    <div className="w-full" data-testid="study-progress-chart">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="font-medium text-slate-900">
            Selected: {activePoint.day} ({activePoint.val.toFixed(1)} hrs)
          </span>
          <span aria-hidden="true">·</span>
          <span>Daily Target: {dailyTargetHours.toFixed(1)} hrs/day</span>
        </div>
        <div className="text-slate-500 font-mono tabular-nums">
          fl_chart · LineChartBarData(isCurved: true)
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label="Weekly study hours progress chart from Monday to Sunday"
        >
          <defs>
            <linearGradient id="trekAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.34" />
              <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="trekBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick, idx) => {
            const y = padTop + plotHeight - (tick / yMax) * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={idx === 0 ? undefined : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px] font-mono tabular-nums"
                >
                  {tick.toFixed(1)}h
                </text>
              </g>
            );
          })}

          {/* Daily Target Reference Line */}
          {dailyTargetHours > 0 && dailyTargetHours <= yMax && (
            <g>
              <line
                x1={padLeft}
                y1={targetY}
                x2={width - padRight}
                y2={targetY}
                stroke="#0f172a"
                strokeOpacity="0.28"
                strokeDasharray="6 4"
                strokeWidth="1.25"
              />
              <text
                x={width - padRight - 4}
                y={targetY - 6}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono tabular-nums"
              >
                Goal {dailyTargetHours.toFixed(1)}h
              </text>
            </g>
          )}

          {chartType === 'area' ? (
            <>
              {/* Gradient Area Fill Underneath Line */}
              <path d={areaPath} fill="url(#trekAreaGradient)" />

              {/* Stylized Smooth Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Vertical Guide Line */}
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={baselineY}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth="1"
              />

              {/* Interactive Data Points */}
              {points.map((pt) => {
                const isSelected = pt.day === activeDay;
                return (
                  <g
                    key={pt.day}
                    className="cursor-pointer"
                    onClick={() => onSelectDay(pt.day)}
                    onMouseEnter={() => setHoveredDay(pt.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={16}
                      fill="transparent"
                    />
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={9}
                        fill="#2563eb"
                        fillOpacity="0.16"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5.5 : 4}
                      fill={isSelected ? '#2563eb' : '#ffffff'}
                      stroke="#2563eb"
                      strokeWidth={isSelected ? 3 : 2.25}
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-mono tabular-nums transition-opacity ${
                        isSelected
                          ? 'fill-slate-900 font-semibold opacity-100'
                          : 'fill-slate-500 opacity-75'
                      }`}
                    >
                      {pt.val.toFixed(1)}h
                    </text>
                  </g>
                );
              })}
            </>
          ) : (
            /* Bar Chart Mode */
            points.map((pt) => {
              const barWidth = 38;
              const barHeight = Math.max(2, baselineY - pt.y);
              const isSelected = pt.day === activeDay;
              return (
                <g
                  key={pt.day}
                  className="cursor-pointer"
                  onClick={() => onSelectDay(pt.day)}
                  onMouseEnter={() => setHoveredDay(pt.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <rect
                    x={pt.x - barWidth / 2}
                    y={pt.y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill="url(#trekBarGradient)"
                    opacity={isSelected ? 1 : 0.78}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="fill-slate-700 text-[11px] font-mono tabular-nums font-medium"
                  >
                    {pt.val.toFixed(1)}h
                  </text>
                </g>
              );
            })
          )}

          {/* X-Axis Weekday Labels */}
          {points.map((pt) => {
            const isSelected = pt.day === activeDay;
            return (
              <text
                key={`label-${pt.day}`}
                x={pt.x}
                y={height - 14}
                textAnchor="middle"
                onClick={() => onSelectDay(pt.day)}
                className={`cursor-pointer text-xs font-medium ${
                  isSelected ? 'fill-blue-600 font-semibold' : 'fill-slate-600'
                }`}
              >
                {pt.day}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Accessible Weekday Button Bar for Keyboard / Touch Selection */}
      <div
        className="grid grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-slate-100"
        role="group"
        aria-label="Filter sessions by weekday"
      >
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDay === day;
          const hrs = weeklyMap[day] || 0;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={isSelected}
              className={`min-h-[44px] px-2 py-1.5 rounded-lg text-center transition-colors flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[11px] font-medium whitespace-nowrap">{day}</span>
              <span
                className={`text-xs font-mono tabular-nums ${
                  isSelected ? 'text-blue-200' : 'text-slate-500'
                }`}
              >
                {hrs.toFixed(1)}h
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

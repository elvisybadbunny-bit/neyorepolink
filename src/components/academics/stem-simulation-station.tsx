"use client";

/**
 * PART EE.13 — Interactive STEM Canvas Simulations & Virtual Lab Station (`EE.13`).
 *
 * Interactive virtual science and math lab simulations with real-time sliders,
 * live physical equations, and dynamic SVG Canvas schematics:
 * 1. Ohm's Law Circuit Lab (`Physics · Grade 7–10`): I = V/R
 * 2. Levers & Moments Balance Lab (`Integrated Science · Grade 8`): Effort × EA = Load × LA
 * 3. Pythagoras & Right Triangle Lab (`Mathematics · Grade 7–10`): c = √(a² + b²)
 */
import * as React from "react";
import { Sparkles, Zap, Scale, Triangle, RefreshCw, CheckCircle2, Sliders } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function StemSimulationStation() {
  const [activeLab, setActiveLab] = React.useState<"circuit" | "levers" | "pythagoras">("circuit");

  // Lab 1: Ohm's Law Circuit
  const [voltage, setVoltage] = React.useState(12); // Volts
  const [resistance, setResistance] = React.useState(6); // Ohms
  const current = Math.round((voltage / resistance) * 100) / 100; // Amperes
  const power = Math.round(voltage * current * 100) / 100; // Watts
  const bulbBrightness = Math.min(1, Math.max(0.1, power / 50)); // 0.1 to 1.0 opacity

  // Lab 2: Levers & Moments
  const [effortForce, setEffortForce] = React.useState(50); // Newtons
  const [effortArm, setEffortArm] = React.useState(2.0); // Meters
  const [loadForce, setLoadForce] = React.useState(100); // Newtons
  const [loadArm, setLoadArm] = React.useState(1.0); // Meters
  const clockwiseMoment = Math.round(loadForce * loadArm * 10) / 10;
  const anticlockwiseMoment = Math.round(effortForce * effortArm * 10) / 10;
  const isBalanced = Math.abs(clockwiseMoment - anticlockwiseMoment) <= 2;
  const tiltAngle = Math.max(-25, Math.min(25, (clockwiseMoment - anticlockwiseMoment) * 0.2));

  // Lab 3: Pythagoras Right Triangle
  const [sideA, setSideA] = React.useState(6); // cm
  const [sideB, setSideB] = React.useState(8); // cm
  const sideC = Math.round(Math.sqrt(sideA * sideA + sideB * sideB) * 100) / 100;
  const area = Math.round(0.5 * sideA * sideB * 10) / 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-200 pb-3 dark:border-navy-800">
        <div>
          <h2 className="text-xl font-black text-navy-950 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Interactive STEM Virtual Lab &amp; Simulations Station (`EE.13`)
          </h2>
          <p className="text-xs font-medium text-navy-500 dark:text-navy-400">
            Real-time physical sliders and dynamic SVG Canvas experiments designed for Kenyan CBC/CBE Grade 7–10 science and mathematics.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={activeLab === "circuit" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveLab("circuit")}
            className="rounded-full font-bold"
          >
            <Zap className="h-4 w-4 mr-1 text-amber-400" /> Ohm&apos;s Law Circuit (`PHY`)
          </Button>
          <Button
            variant={activeLab === "levers" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveLab("levers")}
            className="rounded-full font-bold"
          >
            <Scale className="h-4 w-4 mr-1 text-green-500" /> Levers &amp; Moments (`ISC`)
          </Button>
          <Button
            variant={activeLab === "pythagoras" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveLab("pythagoras")}
            className="rounded-full font-bold"
          >
            <Triangle className="h-4 w-4 mr-1 text-blue-500" /> Pythagoras Geometry (`MAT`)
          </Button>
        </div>
      </div>

      {activeLab === "circuit" && (
        <Card className="rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-white to-amber-50/30 p-6 shadow-card dark:from-navy-900 dark:to-navy-950">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <div>
              <Badge tone="amber" className="mb-1">Physics · Grade 7–10</Badge>
              <CardTitle className="text-lg font-black">Ohm&apos;s Law &amp; Circuit Brightness Lab (`I = V / R`)</CardTitle>
            </div>
            <Button size="sm" variant="secondary" onClick={() => { setVoltage(12); setResistance(6); }} className="rounded-full">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Lab
            </Button>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive Sliders */}
            <div className="space-y-5 bg-white/80 p-5 rounded-2xl border border-navy-100 dark:bg-navy-900/80 dark:border-navy-800">
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm">
                  <span>Voltage (`V` — Battery Source):</span>
                  <span className="text-amber-600 font-mono text-base">{voltage} V</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={0.5}
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm">
                  <span>Resistance (`R` — Resistor/Bulb):</span>
                  <span className="text-blue-600 font-mono text-base">{resistance} Ω</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-navy-100 dark:border-navy-800">
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-center dark:bg-amber-950/40">
                  <p className="text-[10px] font-bold uppercase text-amber-700">Simulated Current (`I`)</p>
                  <p className="text-2xl font-black text-amber-900 dark:text-amber-200 font-mono">{current} A</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 border border-blue-200 text-center dark:bg-blue-950/40">
                  <p className="text-[10px] font-bold uppercase text-blue-700">Power Dissipated (`P`)</p>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-200 font-mono">{power} W</p>
                </div>
              </div>
            </div>

            {/* Dynamic SVG Schematic */}
            <div className="flex items-center justify-center bg-navy-950 p-6 rounded-2xl border-2 border-amber-400/40 shadow-inner min-h-[220px]">
              <svg viewBox="0 0 300 180" className="w-full h-auto max-w-[280px]">
                {/* Wires */}
                <rect x="40" y="30" width="220" height="120" fill="none" stroke="#64748b" strokeWidth="4" rx="12" />
                
                {/* Battery at bottom */}
                <line x1="130" y1="150" x2="130" y2="130" stroke="#f59e0b" strokeWidth="6" />
                <line x1="145" y1="158" x2="145" y2="122" stroke="#f59e0b" strokeWidth="10" />
                <line x1="160" y1="150" x2="160" y2="130" stroke="#f59e0b" strokeWidth="6" />
                <text x="145" y="172" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">{voltage}V Battery</text>

                {/* Resistor at top */}
                <path d="M 110,30 L 115,20 L 125,40 L 135,20 L 145,40 L 155,20 L 165,40 L 175,20 L 180,30" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinejoin="round" />
                <text x="145" y="16" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="bold">{resistance}Ω Resistor</text>

                {/* Bulb on right side */}
                <circle cx="260" cy="90" r="22" fill={`rgba(251, 191, 36, ${bulbBrightness})`} stroke="#f59e0b" strokeWidth="3" />
                <path d="M 252,90 Q 260,75 268,90" fill="none" stroke="#d97706" strokeWidth="2" />
                <text x="260" y="126" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">{power}W Bulb</text>

                {/* Current Arrows */}
                <polygon points="40,85 45,95 35,95" fill="#10b981" transform="rotate(90 40 90)" />
                <text x="56" y="94" fill="#10b981" fontSize="11" fontWeight="bold">I = {current}A</text>
              </svg>
            </div>
          </CardContent>
        </Card>
      )}

      {activeLab === "levers" && (
        <Card className="rounded-3xl border-2 border-green-300/60 bg-gradient-to-br from-white to-green-50/30 p-6 shadow-card dark:from-navy-900 dark:to-navy-950">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <div>
              <Badge tone="green" className="mb-1">Integrated Science · Grade 8</Badge>
              <CardTitle className="text-lg font-black">Levers &amp; Moments Balance Lab (`Principle of Moments`)</CardTitle>
            </div>
            <Button size="sm" variant="secondary" onClick={() => { setEffortForce(50); setEffortArm(2.0); setLoadForce(100); setLoadArm(1.0); }} className="rounded-full">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Lab
            </Button>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-white/80 p-5 rounded-2xl border border-navy-100 dark:bg-navy-900/80 dark:border-navy-800">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>Anticlockwise Effort Force (`E`):</span>
                  <span className="text-green-700 font-mono font-bold">{effortForce} N</span>
                </div>
                <input type="range" min={10} max={200} step={10} value={effortForce} onChange={(e) => setEffortForce(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>Effort Arm Distance (`EA`):</span>
                  <span className="text-green-700 font-mono font-bold">{effortArm} m</span>
                </div>
                <input type="range" min={0.5} max={3.0} step={0.1} value={effortArm} onChange={(e) => setEffortArm(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>Clockwise Load Weight (`L`):</span>
                  <span className="text-amber-700 font-mono font-bold">{loadForce} N</span>
                </div>
                <input type="range" min={10} max={300} step={10} value={loadForce} onChange={(e) => setLoadForce(Number(e.target.value))} className="w-full accent-amber-600 cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>Load Arm Distance (`LA`):</span>
                  <span className="text-amber-700 font-mono font-bold">{loadArm} m</span>
                </div>
                <input type="range" min={0.5} max={3.0} step={0.1} value={loadArm} onChange={(e) => setLoadArm(Number(e.target.value))} className="w-full accent-amber-600 cursor-pointer" />
              </div>

              <div className={`rounded-xl p-3 border text-center ${isBalanced ? "bg-green-100 border-green-400 text-green-900 dark:bg-green-950 dark:text-green-200" : "bg-red-50 border-red-300 text-red-900 dark:bg-red-950 dark:text-red-200"}`}>
                <p className="text-xs font-extrabold uppercase">
                  {isBalanced ? "✓ Perfectly Balanced (`E × EA = L × LA`)" : tiltAngle > 0 ? "⚠️ Tilted Clockwise (Load Side Heavier)" : "⚠️ Tilted Anticlockwise (Effort Side Heavier)"}
                </p>
                <p className="text-xs font-mono mt-0.5">Anticlockwise: {anticlockwiseMoment} N·m vs Clockwise: {clockwiseMoment} N·m</p>
              </div>
            </div>

            {/* Dynamic See-Saw Lever SVG */}
            <div className="flex items-center justify-center bg-navy-950 p-6 rounded-2xl border-2 border-green-400/40 min-h-[220px]">
              <svg viewBox="0 0 300 180" className="w-full h-auto max-w-[280px]">
                {/* Fulcrum Stand */}
                <polygon points="150,150 135,175 165,175" fill="#64748b" stroke="#334155" strokeWidth="2" />
                <circle cx="150" cy="150" r="5" fill="#f8fafc" />

                {/* Rotating See-Saw Beam */}
                <g transform={`rotate(${tiltAngle} 150 150)`}>
                  <line x1="30" y1="150" x2="270" y2="150" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                  
                  {/* Effort Box on Left */}
                  <rect x="50" y="118" width="32" height="30" fill="#059669" rx="4" />
                  <text x="66" y="136" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{effortForce}N</text>
                  
                  {/* Load Box on Right */}
                  <rect x="218" y="118" width="32" height="30" fill="#d97706" rx="4" />
                  <text x="234" y="136" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{loadForce}N</text>
                </g>
                <text x="150" y="30" textAnchor="middle" fill="#94a3b8" fontSize="11" fontStyle="italic">Fulcrum Pivot at Center (0.0 m)</text>
              </svg>
            </div>
          </CardContent>
        </Card>
      )}

      {activeLab === "pythagoras" && (
        <Card className="rounded-3xl border-2 border-blue-300/60 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-card dark:from-navy-900 dark:to-navy-950">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <div>
              <Badge tone="blue" className="mb-1">Mathematics · Grade 7–10</Badge>
              <CardTitle className="text-lg font-black">Right-Angled Triangle &amp; Pythagoras Lab (`c = √(a² + b²)`)</CardTitle>
            </div>
            <Button size="sm" variant="secondary" onClick={() => { setSideA(6); setSideB(8); }} className="rounded-full">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Lab
            </Button>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-white/80 p-5 rounded-2xl border border-navy-100 dark:bg-navy-900/80 dark:border-navy-800">
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm">
                  <span>Perpendicular Height (`a`):</span>
                  <span className="text-blue-600 font-mono font-bold">{sideA} cm</span>
                </div>
                <input type="range" min={3} max={15} step={1} value={sideA} onChange={(e) => setSideA(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold text-sm">
                  <span>Base Length (`b`):</span>
                  <span className="text-green-600 font-mono font-bold">{sideB} cm</span>
                </div>
                <input type="range" min={3} max={15} step={1} value={sideB} onChange={(e) => setSideB(Number(e.target.value))} className="w-full accent-green-600 cursor-pointer" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-navy-100 dark:border-navy-800">
                <div className="rounded-xl bg-blue-50 p-3 border border-blue-200 text-center dark:bg-blue-950/40">
                  <p className="text-[10px] font-bold uppercase text-blue-700">Hypotenuse (`c`)</p>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-200 font-mono">{sideC} cm</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 border border-green-200 text-center dark:bg-green-950/40">
                  <p className="text-[10px] font-bold uppercase text-green-700">Triangle Area (`½ab`)</p>
                  <p className="text-2xl font-black text-green-900 dark:text-green-200 font-mono">{area} sq cm</p>
                </div>
              </div>
            </div>

            {/* Dynamic Pythagoras SVG */}
            <div className="flex items-center justify-center bg-navy-950 p-6 rounded-2xl border-2 border-blue-400/40 min-h-[220px]">
              <svg viewBox="0 0 240 180" className="w-full h-auto max-w-[240px]">
                {/* Right triangle scaled dynamically */}
                <polygon
                  points={`40,${150 - sideA * 8} 40,150 ${40 + sideB * 10},150`}
                  fill="rgba(59, 130, 246, 0.15)"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <rect x="40" y="138" width="12" height="12" fill="none" stroke="#ef4444" strokeWidth="2" />
                <text x="24" y={150 - sideA * 4} fill="#60a5fa" fontSize="11" fontWeight="bold">{sideA}cm</text>
                <text x={40 + sideB * 5} y="168" fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">{sideB}cm</text>
                <text x={45 + sideB * 5} y={145 - sideA * 4} fill="#f8fafc" fontSize="12" fontWeight="extrabold">{sideC}cm</text>
              </svg>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

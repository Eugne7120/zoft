import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { CircuitEvaluation, ZoftCircuitConfig } from '../utils/zoftProtocolLogic';

interface ShieldedNoteOrbProps {
  config: ZoftCircuitConfig;
  evaluation: CircuitEvaluation;
  simulationPulseCount: number;
  externalHoverActive?: boolean;
  onUpdateSplit: (newSplitPercent: number) => void;
  onTriggerPulse: () => void;
}

export const ShieldedNoteOrb: React.FC<ShieldedNoteOrbProps> = ({
  config,
  evaluation,
  simulationPulseCount,
  externalHoverActive = false,
  onUpdateSplit,
  onTriggerPulse,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInteractivePulse, setIsInteractivePulse] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, specX: 32, specY: 26 });

  // Sync subtle pulsing glow whenever user interacts with split, preset, or simulation
  useEffect(() => {
    setIsInteractivePulse(true);
    const timer = setTimeout(() => setIsInteractivePulse(false), 950);
    return () => clearTimeout(timer);
  }, [
    config.withdrawalSplitPercent,
    config.presetId,
    config.sourceChain,
    config.destinationChain,
    simulationPulseCount,
  ]);

  const activePulse = isInteractivePulse || isHovered || externalHoverActive;
  const splitRatio = config.withdrawalSplitPercent;
  const changeRatio = 100 - splitRatio;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const relY = (e.clientY - rect.top) / Math.max(rect.height, 1);
    const tiltX = (0.5 - relY) * 18;
    const tiltY = (relX - 0.5) * 18;
    const specX = Math.round(20 + relX * 55);
    const specY = Math.round(16 + relY * 50);
    setTilt({ x: tiltX, y: tiltY, specX, specY });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, specX: 32, specY: 26 });
  };

  const handleOrbClick = () => {
    setIsInteractivePulse(true);
    onTriggerPulse();
  };

  return (
    <div
      onPointerEnter={() => setIsHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="mt-6 rounded-2xl bg-[#11131a]/90 border border-white/12 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden transition-colors duration-300 hover:border-white/25"
    >
      {/* Ambient background glow synced with user interaction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 -top-10 w-48 h-48 rounded-full transition-all duration-500"
        style={{
          background: activePulse
            ? 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(16,185,129,0.12) 45%, transparent 72%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(16,185,129,0.05) 45%, transparent 70%)',
          transform: activePulse ? 'scale(1.18)' : 'scale(1)',
        }}
      />

      {/* 3D-Inspired Glassmorphism Floating Shielded Note Orb */}
      <button
        type="button"
        onClick={handleOrbClick}
        aria-label="Interactive 3D Glassmorphism Shielded Note Orb — Click to pulse zero-knowledge commitment"
        className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center cursor-pointer group focus:outline-none"
        style={{ perspective: '700px' }}
      >
        {/* Outer Pulsing Halo Ring synced with user interaction */}
        <div
          aria-hidden="true"
          className="absolute inset-1 rounded-full zoft-orb-glow transition-all duration-500"
          style={{
            background: config.aspComplianceEnabled
              ? 'radial-gradient(circle, rgba(255,255,255,0.26) 0%, rgba(16,185,129,0.22) 52%, transparent 74%)'
              : 'radial-gradient(circle, rgba(248,113,113,0.28) 0%, rgba(255,255,255,0.12) 52%, transparent 74%)',
            filter: activePulse ? 'blur(12px)' : 'blur(8px)',
            transform: activePulse ? 'scale(1.22)' : 'scale(1)',
          }}
        />

        {/* Floating 3D Orb Container */}
        <div
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full zoft-orb-float flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${activePulse ? 1.06 : 1})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 3D Perspective Orbital Commitment Ring 1 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2.5 rounded-full border border-white/25 zoft-orb-ring-1"
            style={{
              boxShadow: activePulse
                ? '0 0 14px rgba(255,255,255,0.35)'
                : '0 0 6px rgba(255,255,255,0.12)',
            }}
          />

          {/* 3D Perspective Orbital Commitment Ring 2 (0xbow ASP / lzRead) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-full border border-emerald-400/30 zoft-orb-ring-2"
          />

          {/* Main Glassmorphism Sphere Shell */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden backdrop-blur-xl border border-white/30 flex flex-col items-center justify-center transition-shadow duration-500"
            style={{
              background: `radial-gradient(circle at ${tilt.specX}% ${tilt.specY}%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.10) 32%, rgba(14, 16, 23, 0.78) 70%, rgba(16, 185, 129, 0.22) 100%)`,
              boxShadow: activePulse
                ? 'inset 0 2px 18px rgba(255,255,255,0.45), inset 0 -10px 22px rgba(16,185,129,0.32), 0 12px 32px rgba(0,0,0,0.65), 0 0 26px rgba(255,255,255,0.22)'
                : 'inset 0 2px 12px rgba(255,255,255,0.28), inset 0 -8px 18px rgba(16,185,129,0.18), 0 10px 24px rgba(0,0,0,0.55)',
            }}
          >
            {/* Dynamic Internal Liquid Split Horizon (Visualizes Intent vs Change inside the Orb) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
              style={{
                height: `${Math.max(22, Math.min(84, splitRatio))}%`,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 55%, rgba(16,185,129,0.20) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.45)',
              }}
            />

            {/* Top-Left Specular Glass Lens Highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute w-10 h-5 rounded-full bg-white/45 blur-[2px] transition-all duration-200"
              style={{
                top: `${Math.max(10, Math.min(30, tilt.specY - 12))}%`,
                left: `${Math.max(14, Math.min(40, tilt.specX - 12))}%`,
                transform: 'rotate(-28deg)',
              }}
            />

            {/* Inner Encrypted Note Core Badge */}
            <div className="relative z-10 flex flex-col items-center text-center px-2">
              <div className="w-6 h-6 rounded-full bg-black/55 border border-white/30 flex items-center justify-center mb-1 shadow-inner">
                <Lock className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-mono-num uppercase tracking-wider text-zinc-200 font-semibold">
                C_note
              </span>
              <span className="text-xs font-mono-num font-bold text-white leading-tight">
                {splitRatio}% / {changeRatio}%
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Right Side: Shielded Note Telemetry & Interactive Split Sync Controls */}
      <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shielded UTXO Note Commitment (Interactive Glass Orb)</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/8 border border-white/15 text-[11px] font-mono-num text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            {activePulse ? 'Commitment Pulsing' : 'Poseidon2 Encrypted'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Hover, click the floating glass orb, or toggle a split ratio below to pulse the shielded
          note commitment <code className="text-zinc-200">{evaluation.withdrawalCommitmentHex}</code>{' '}
          and sync the 3D Join-Split reactor in real time.
        </p>

        {/* Interactive Split Ratio Sync Buttons + Live Note Breakdown */}
        <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-between gap-2 text-xs font-mono-num">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-zinc-400 text-[11px] mr-0.5 whitespace-nowrap">Sync Split:</span>
            {[60, 75, 85].map((pct) => {
              const isSelected = config.withdrawalSplitPercent === pct;
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onUpdateSplit(pct)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#070709] font-semibold shadow-sm'
                      : 'bg-[#171922] text-zinc-300 border border-white/10 hover:border-white/30'
                  }`}
                >
                  {pct}% / {100 - pct}%
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-300">
            Note Value:{' '}
            <strong className="text-white">
              {evaluation.totalInputUsdc.toLocaleString()} USDC
            </strong>{' '}
            <span className="text-zinc-500">·</span>{' '}
            <span className="text-emerald-400">Nullifier Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

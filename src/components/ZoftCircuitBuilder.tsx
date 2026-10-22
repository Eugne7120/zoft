import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Cpu,
  Eye,
  Flame,
  Layers,
  Lock,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  CHAIN_METADATA,
  ChainId,
  CircuitBlockCategory,
  CircuitEvaluation,
  LzComposeTarget,
  USE_CASE_PRESETS,
  UseCasePresetId,
  ZoftCircuitConfig,
} from '../utils/zoftProtocolLogic';
import { IsometricBrickStrip } from './IsometricBrickStrip';
import { ZoftReactorViewport } from './ZoftReactorViewport';

interface ZoftCircuitBuilderProps {
  config: ZoftCircuitConfig;
  evaluation: CircuitEvaluation;
  simulationPulseCount: number;
  isSimulating: boolean;
  simulationStep: number;
  onUpdateConfig: (partial: Partial<ZoftCircuitConfig>) => void;
  onSelectPreset: (presetId: UseCasePresetId) => void;
  onToggleNote: (noteId: string) => void;
  onPlaySimulation: () => void;
}

export const ZoftCircuitBuilder: React.FC<ZoftCircuitBuilderProps> = ({
  config,
  evaluation,
  simulationPulseCount,
  isSimulating,
  simulationStep,
  onUpdateConfig,
  onSelectPreset,
  onToggleNote,
  onPlaySimulation,
}) => {
  const [activeBlock, setActiveBlock] = useState<CircuitBlockCategory>('core_chamber');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sourceMeta = CHAIN_METADATA[config.sourceChain];
  const destMeta = CHAIN_METADATA[config.destinationChain];

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <section
      id="circuit-builder"
      aria-label="zOFT Interactive Circuit Builder"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-5 scroll-mt-20"
    >
      {/* Top Use-Case Preset Bar (Hookr-style "Start from" template selector) */}
      <div className="mb-4 bg-[#0d0e12] border border-white/10 rounded-2xl p-3.5 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3 border-b border-white/8">
          <div>
            <div className="text-xs text-zinc-400 font-mono-num">
              Builder · Modular Omnichain ZK Circuit
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight mt-0.5">
              Build a zOFT Join-Split Intent
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Plug Shielded UTXO Notes, LayerZero V2 <code className="text-zinc-200">lzRead</code>{' '}
              verifiers, and ERC-5564 Stealth settlement blocks into an atomic circuit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onPlaySimulation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#070709] font-semibold text-xs hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Simulating Proof & lzRead...' : 'Play the Proof & Settlement'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdateConfig({ stealthNonce: Math.floor(100 + Math.random() * 8999) })
              }
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#16181f] border border-white/12 text-xs font-medium text-zinc-200 hover:border-white/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Rotate Stealth Meta-Address</span>
            </button>
          </div>
        </div>

        {/* 4 Core Use Case Template Buttons */}
        <div>
          <div className="text-xs text-zinc-400 mb-2 font-medium">
            Start from a Verified Enterprise / DeFi Use Case:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(Object.keys(USE_CASE_PRESETS) as UseCasePresetId[]).map((presetKey) => {
              const preset = USE_CASE_PRESETS[presetKey];
              const isSelected = config.presetId === presetKey;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#171921] border-white text-white shadow-md'
                      : 'bg-[#101217] border-white/8 text-zinc-400 hover:border-white/25 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {preset.title}
                    </span>
                    <span className="text-[11px] font-mono-num text-zinc-400 shrink-0">
                      {preset.recommendedSplitPercent}% Split
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {preset.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Hookr-Style 2-Column Split Workspace */}
      <div className="bg-[#0d0e12] border border-white/12 rounded-2xl overflow-hidden shadow-2xl">
        {/* Workspace Header Strip with 3D Cube Inventory & Circuit Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-b border-white/10 bg-[#111318]">
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              Your zOFT Circuit Board
            </h3>
            <p className="text-xs text-zinc-400">
              Tap any module around the 3D Noir ZK Chamber to inspect or tune its cryptographic parameters.
            </p>
          </div>

          {/* Right Status Cluster: 5 Tactile 3D Isometric Cube Icons + Ready / Issues Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" aria-hidden="true">
              {['#10b981', '#ffffff', '#e4e4e7', '#f59e0b', '#38bdf8'].map((hex, i) => (
                <svg key={i} viewBox="0 0 18 18" className="w-4 h-4">
                  <polygon points="9,1 16,5 9,9 2,5" fill={hex} />
                  <polygon points="2,5 9,9 9,17 2,13" fill={hex} opacity={0.75} />
                  <polygon points="9,9 16,5 16,13 9,17" fill={hex} opacity={0.5} />
                </svg>
              ))}
            </div>
            <span className="text-xs font-mono-num text-zinc-200">
              <strong className="text-white">5</strong> modules in your circuit
            </span>

            {evaluation.issuesToFix.length > 0 ? (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono-num font-medium">
                {evaluation.issuesToFix.length} to fix
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono-num font-medium">
                Circuit Ready
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Split Grid: Left = Interactive 3D Board, Right = Accordion Block Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* ================================================================= */}
          {/* LEFT COLUMN (7 Cols): INTERACTIVE 3D CIRCUIT BOARD ("Your zOFT")  */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 bg-dot-matrix p-5 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Top Entry Node: Source Chain Deposit + 0xbow ASP Entry Guard */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-mono-num text-zinc-300 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                <span>Source Vault:</span>
                <strong className="text-white">{sourceMeta.name}</strong>
                <span>·</span>
                <span className="text-zinc-400">EID {sourceMeta.eid}</span>
              </div>

              {/* Port 1: 0xbow ASP Entry Guard Card */}
              <button
                type="button"
                onClick={() => setActiveBlock('entry_asp')}
                className={`w-full max-w-md p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeBlock === 'entry_asp'
                    ? 'bg-[#171a22] border-emerald-400/80 shadow-lg'
                    : 'bg-[#111319]/90 border-white/12 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={`w-4 h-4 ${
                        config.aspComplianceEnabled ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    />
                    <span className="text-xs font-semibold text-white">
                      0xbow ASP · Proof of Association
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-num text-zinc-400">
                    {config.aspComplianceEnabled ? 'Verified Clean Set' : 'Bypassed (Warning)'}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 font-mono-num">
                  Local Merkle Root: {evaluation.merkleRootHex} · Zero L1 Broadcast Gas
                </div>
              </button>

              {/* Vertical Connector Pipe */}
              <div
                className={`w-0.5 h-4 transition-colors ${
                  simulationStep >= 1 ? 'bg-white' : 'bg-white/25'
                }`}
              />
            </div>

            {/* Middle Row: Left Input Notes + Center 3D Noir ZK Chamber + Right LayerZero V2 lzRead */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch my-1">
              {/* LEFT SIDE PORT (3 Cols): Shielded UTXO Input Notes Consolidation */}
              <div className="md:col-span-3 flex flex-col justify-center">
                <div
                  onClick={() => setActiveBlock('input_notes')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activeBlock === 'input_notes'
                      ? 'bg-[#171a22] border-white shadow-lg'
                      : 'bg-[#111319]/90 border-white/12 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white">Input Notes</span>
                    <span className="text-[11px] font-mono-num text-zinc-400">
                      {evaluation.selectedNotesCount}/3 active
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {config.notes.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleNote(note.id);
                          setActiveBlock('input_notes');
                        }}
                        className={`w-full p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          note.selected
                            ? 'bg-white/10 border-white/40 text-white'
                            : 'bg-[#0b0c10] border-white/6 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono-num">
                          <span className="font-semibold">
                            {(note.amountUsdc / 1000).toFixed(0)}k USDC
                          </span>
                          <span>{note.selected ? 'In Circuit' : '+ Add'}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono-num truncate mt-0.5">
                          {note.commitmentHash}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER CHAMBER (6 Cols): Interactive 3D Noir ZK Join-Split Viewport */}
              <div className="md:col-span-6 flex flex-col">
                <div
                  onClick={() => setActiveBlock('core_chamber')}
                  className={`relative flex-1 min-h-[290px] rounded-2xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                    activeBlock === 'core_chamber'
                      ? 'border-white bg-[#090a0d] shadow-[0_0_30px_rgba(255,255,255,0.08)]'
                      : 'border-white/25 bg-[#090a0d] hover:border-white/50'
                  }`}
                >
                  {/* Top Bar Inside Chamber ("beforeSwap / Noir Circuit") */}
                  <div className="relative z-10 flex items-center justify-between px-3.5 pt-2.5 pointer-events-none">
                    <span className="text-[11px] font-mono-num text-zinc-400">
                      in-circuit · Noir Join-Split
                    </span>
                    <span className="text-[11px] font-mono-num text-emerald-400">
                      Nullifier {evaluation.nullifierHashHex.slice(0, 8)}
                    </span>
                  </div>

                  {/* Interactive Three.js 3D Reactor Canvas */}
                  <div className="w-full h-[210px] relative">
                    <ZoftReactorViewport
                      config={config}
                      simulationPulseCount={simulationPulseCount}
                      compactMode={true}
                      onSelectCoreComponent={(part) => setActiveBlock(part)}
                    />
                  </div>

                  {/* Bottom Bar Inside Chamber (Pool / Circuit Pair Title like Hookr) */}
                  <div className="relative z-10 px-3.5 pb-3 pt-1 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/90 to-transparent text-center pointer-events-none">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-white inline-block" />
                      <span>USDC / $ZOFT</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-300 font-mono-num">
                        { evaluation.totalInputUsdc.toLocaleString() } USDC
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono-num mt-0.5">
                      Split {config.withdrawalSplitPercent}% Intent ·{' '}
                      {100 - config.withdrawalSplitPercent}% Shielded Change
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE PORT (3 Cols): LayerZero V2 lzRead & ZK-DVN Pull Query */}
              <div className="md:col-span-3 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => setActiveBlock('lzread_dvn')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeBlock === 'lzread_dvn'
                      ? 'bg-[#171a22] border-amber-400/80 shadow-lg'
                      : 'bg-[#111319]/90 border-white/12 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-semibold text-white">LayerZero V2</span>
                    </div>
                    <span className="text-[10px] font-mono-num text-amber-300">lzRead</span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0b0c10] border border-white/8">
                    <div className="text-[11px] font-semibold text-zinc-200">
                      ZK-DVN State Pull
                    </div>
                    <div className="text-[11px] font-mono-num text-amber-300 mt-0.5">
                      -{evaluation.gasSavedPercent}% Gas Saved
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-snug">
                      Pulls {sourceMeta.name} Merkle Root on demand (${evaluation.estimatedVerifyGasUsd} vs $
                      {evaluation.legacyPushGasUsd})
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Split Output Branches: Left = Shielded Change Note, Right = ERC-5564 Stealth Settlement */}
            <div className="flex flex-col items-center mt-1">
              <div
                className={`w-1/2 h-4 border-t-2 border-x-2 rounded-t-lg transition-colors ${
                  simulationStep >= 2 ? 'border-white' : 'border-white/25'
                }`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Branch A: Shielded Change Note Output (Remains Encrypted in Vault) */}
                <button
                  type="button"
                  onClick={() => setActiveBlock('core_chamber')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeBlock === 'core_chamber'
                      ? 'bg-[#161820] border-white/50'
                      : 'bg-[#111319]/90 border-white/12 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-xs font-semibold text-white">
                        Shielded Change Note
                      </span>
                    </div>
                    <span className="text-xs font-mono-num text-zinc-300">
                      {100 - config.withdrawalSplitPercent}% Retained
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm font-mono-num font-semibold text-white">
                    {evaluation.shieldedChangeUsdc.toLocaleString()} USDC
                  </div>
                  <div className="mt-0.5 text-[11px] font-mono-num text-zinc-400 truncate">
                    Commitment: {evaluation.changeCommitmentHex}
                  </div>
                </button>

                {/* Branch B: Destination ERC-5564 Stealth Settlement + Native Gas Drop + lzCompose */}
                <button
                  type="button"
                  onClick={() => setActiveBlock('output_settlement')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeBlock === 'output_settlement'
                      ? 'bg-[#171a22] border-emerald-400/80 shadow-lg'
                      : 'bg-[#111319]/90 border-white/12 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">
                        ERC-5564 Stealth Output
                      </span>
                    </div>
                    <span className="text-xs font-mono-num text-emerald-400">
                      {destMeta.name}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-mono-num font-semibold text-white">
                      {evaluation.crossChainIntentUsdc.toLocaleString()} USDC
                    </span>
                    <span className="text-xs font-mono-num text-amber-300">
                      + {config.nativeGasDropEth} ETH Gas Drop
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] font-mono-num text-zinc-400 truncate">
                    {evaluation.stealthAddressHex} · Batch of {config.solverBatchSize}
                  </div>
                </button>
              </div>

              {/* Final Buyer / Recipient Node */}
              <div className="mt-3 flex items-center gap-2 text-xs font-mono-num text-zinc-400">
                <ArrowDown className="w-3.5 h-3.5 text-white" />
                <span>Untraceable settlement on</span>
                <strong className="text-white">{destMeta.name}</strong>
                <span>·</span>
                <span className="text-emerald-400">
                  Linkability Risk {evaluation.privacyCorrelationRiskPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN (5 Cols): HOOKR-STYLE BLOCK INSPECTOR & 3D BRICK UI  */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-[#0d0e12]">
            <div className="space-y-1.5">
              {/* Top Stack of 5 Interactive Circuit Block Accordions */}
              {[
                {
                  id: 'core_chamber' as CircuitBlockCategory,
                  title: 'In-Circuit Join-Split Ratio',
                  summary: `${config.withdrawalSplitPercent}% Cross-Chain (${evaluation.crossChainIntentUsdc.toLocaleString()} USDC) · ${
                    100 - config.withdrawalSplitPercent
                  }% Change`,
                  accentBorder: 'border-white/35',
                  icon: Layers,
                },
                {
                  id: 'input_notes' as CircuitBlockCategory,
                  title: 'Multi-Note UTXO Consolidation',
                  summary: `${evaluation.selectedNotesCount} Shielded Notes merged · ${evaluation.totalInputUsdc.toLocaleString()} USDC total`,
                  accentBorder: 'border-zinc-500/40',
                  icon: Plus,
                },
                {
                  id: 'lzread_dvn' as CircuitBlockCategory,
                  title: 'LayerZero V2 lzRead & ZK-DVN',
                  summary: `${
                    config.lzReadEnabled ? 'Pull-Based State Query' : 'Legacy Push Broadcast'
                  } · ${evaluation.gasSavedPercent}% gas saved`,
                  accentBorder: 'border-amber-500/40',
                  icon: Zap,
                },
                {
                  id: 'output_settlement' as CircuitBlockCategory,
                  title: 'ERC-5564 Stealth & lzCompose',
                  summary: `Batch ${config.solverBatchSize} · +${config.nativeGasDropEth} ETH Gas Drop · ${destMeta.name}`,
                  accentBorder: 'border-emerald-500/40',
                  icon: Flame,
                },
                {
                  id: 'entry_asp' as CircuitBlockCategory,
                  title: '0xbow ASP & Zcash Viewing Keys',
                  summary: `${
                    config.aspComplianceEnabled ? 'PoA Verified' : 'PoA Disabled'
                  } · Tax & Audit Key Ready`,
                  accentBorder: 'border-emerald-500/30',
                  icon: Eye,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isOpen = activeBlock === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveBlock(item.id)}
                    className={`w-full px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isOpen
                        ? `bg-[#171922] ${item.accentBorder} shadow-md`
                        : 'bg-[#12141b] border-white/8 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-white shrink-0" />
                        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-mono-num text-zinc-400 truncate">
                            {item.summary}
                          </span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Detailed Parameter Tuning Card for Selected Block (Hookr Bottom-Right Card) */}
              <div className="mt-2.5 p-3.5 sm:p-4 rounded-2xl bg-[#13151c] border border-white/25 shadow-xl">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-display text-xs sm:text-sm font-semibold text-white">
                        Noir Join-Split & Omnichain Parameters
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Click any 3D brick below to adjust the Cross-Chain Intent vs Shielded Change ratio.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Callout Pill Box */}
                <div className="px-3 py-2 rounded-xl bg-[#0b0c10] border border-white/10 text-xs text-zinc-300 leading-relaxed mb-3">
                  Splitting <strong className="text-white font-mono-num">{evaluation.totalInputUsdc.toLocaleString()} USDC</strong> on{' '}
                  <strong className="text-white">{sourceMeta.name}</strong> into{' '}
                  <strong className="text-white font-mono-num">
                    {evaluation.crossChainIntentUsdc.toLocaleString()} USDC
                  </strong>{' '}
                  stealth payout on <strong className="text-white">{destMeta.name}</strong> and{' '}
                  <strong className="text-white font-mono-num">
                    {evaluation.shieldedChangeUsdc.toLocaleString()} USDC
                  </strong>{' '}
                  shielded change.
                </div>

                {/* 1. Join-Split Ratio with 3D Isometric Bricks (Hookr signature interaction) */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-zinc-300">
                      Cross-Chain Intent Split Ratio
                    </span>
                    <span className="font-mono-num text-lg font-semibold text-white">
                      {config.withdrawalSplitPercent}%
                    </span>
                  </div>

                  {/* Interactive 3D Isometric Brick Bar */}
                  <IsometricBrickStrip
                    valuePercent={config.withdrawalSplitPercent}
                    totalBricks={18}
                    activeScheme="white"
                    showRemainderAsSecondary={true}
                    onSelectPercent={(pct) =>
                      onUpdateConfig({
                        withdrawalSplitPercent: Math.max(15, Math.min(100, pct)),
                      })
                    }
                    ariaLabel="Cross-Chain Intent Split Ratio 3D Bricks"
                  />

                  {/* Quick Ratio Segmented Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[35, 65, 75, 90].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => onUpdateConfig({ withdrawalSplitPercent: pct })}
                        className={`py-1.5 rounded-lg text-xs font-mono-num font-medium border transition-colors cursor-pointer ${
                          config.withdrawalSplitPercent === pct
                            ? 'bg-white text-[#070709] border-white font-semibold'
                            : 'bg-[#0b0c10] text-zinc-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {pct}% / {100 - pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Source & Destination Chain Pair Selectors */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label
                      htmlFor="source-chain-select"
                      className="block text-[11px] text-zinc-400 mb-1"
                    >
                      Source Chain (Vault)
                    </label>
                    <select
                      id="source-chain-select"
                      value={config.sourceChain}
                      onChange={(e) =>
                        onUpdateConfig({ sourceChain: e.target.value as ChainId })
                      }
                      className="w-full bg-[#0b0c10] border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-white"
                    >
                      {(Object.keys(CHAIN_METADATA) as ChainId[]).map((cid) => (
                        <option key={cid} value={cid}>
                          {CHAIN_METADATA[cid].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dest-chain-select"
                      className="block text-[11px] text-zinc-400 mb-1"
                    >
                      Destination Chain (Stealth)
                    </label>
                    <select
                      id="dest-chain-select"
                      value={config.destinationChain}
                      onChange={(e) =>
                        onUpdateConfig({ destinationChain: e.target.value as ChainId })
                      }
                      className="w-full bg-[#0b0c10] border border-white/15 rounded-lg px-2.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-white"
                    >
                      {(Object.keys(CHAIN_METADATA) as ChainId[]).map((cid) => (
                        <option key={cid} value={cid}>
                          {CHAIN_METADATA[cid].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Solver Batch Anonymity Set & Native Gas Drop */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <span className="block text-[11px] text-zinc-400 mb-1">
                      Solver Anonymity Batch
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 10, 25].map((batch) => (
                        <button
                          key={batch}
                          type="button"
                          onClick={() => onUpdateConfig({ solverBatchSize: batch })}
                          className={`py-1.5 rounded-lg text-xs font-mono-num border transition-colors cursor-pointer ${
                            config.solverBatchSize === batch
                              ? 'bg-white text-[#070709] border-white font-semibold'
                              : 'bg-[#0b0c10] text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {batch}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-zinc-400 mb-1">
                      Native ETH Gas Drop
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.005, 0.015, 0.03].map((eth) => (
                        <button
                          key={eth}
                          type="button"
                          onClick={() => onUpdateConfig({ nativeGasDropEth: eth })}
                          className={`py-1.5 rounded-lg text-xs font-mono-num border transition-colors cursor-pointer ${
                            config.nativeGasDropEth === eth
                              ? 'bg-white text-[#070709] border-white font-semibold'
                              : 'bg-[#0b0c10] text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {eth}Ξ
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Protocol Switches: LayerZero V2 lzRead + 0xbow ASP + lzCompose Target */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300">
                      LayerZero V2 <code className="text-white">lzRead</code> Pull Verification
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({ lzReadEnabled: !config.lzReadEnabled })
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-mono-num font-medium cursor-pointer transition-colors ${
                        config.lzReadEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-white/10'
                      }`}
                    >
                      {config.lzReadEnabled ? 'Enabled (-91% Gas)' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300">
                      0xbow ASP Compliance Proof
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig({
                          aspComplianceEnabled: !config.aspComplianceEnabled,
                        })
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-mono-num font-medium cursor-pointer transition-colors ${
                        config.aspComplianceEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {config.aspComplianceEnabled ? 'PoA Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label htmlFor="lzcompose-select" className="text-xs text-zinc-300">
                      Atomic <code className="text-white">lzCompose</code> DeFi Route
                    </label>
                    <select
                      id="lzcompose-select"
                      value={config.lzComposeTarget}
                      onChange={(e) =>
                        onUpdateConfig({
                          lzComposeTarget: e.target.value as LzComposeTarget,
                        })
                      }
                      className="bg-[#0b0c10] border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white font-mono-num"
                    >
                      <option value="none">Direct to Stealth Wallet</option>
                      <option value="aave_v3_supply">Aave V3 Shielded Supply</option>
                      <option value="uniswap_v4_lp">Uniswap v4 Hook Swap</option>
                      <option value="pendle_pt_vault">Pendle Fixed Yield PT</option>
                    </select>
                  </div>
                </div>

                {/* Circuit Warnings / Issues to Fix */}
                {evaluation.issuesToFix.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    {evaluation.issuesToFix.map((issue, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-[11px] text-amber-200"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Viewing Key & Cryptographic Spec Copy Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-zinc-400">
                      Zcash-Style Audit Viewing Key
                    </div>
                    <div className="text-xs font-mono-num text-zinc-200 truncate">
                      {evaluation.viewingKeyExportHex}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy('vk', evaluation.viewingKeyExportHex)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b0c10] border border-white/15 text-xs text-white hover:border-white/40 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'vk' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary dApp Execution CTA inside Inspector */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onPlaySimulation}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-[#070709] font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isSimulating
                        ? simulationStep === 1
                          ? 'Step 1/2: Proving Noir Join-Split & Pulling lzRead Root...'
                          : 'Step 2/2: Settling to ERC-5564 Stealth Address...'
                        : `Execute Join-Split Proof (${evaluation.crossChainIntentUsdc.toLocaleString()} USDC → ${destMeta.shortName})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

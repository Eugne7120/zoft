import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Cpu,
  Eye,
  EyeOff,
  FileCheck2,
  GitMerge,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  CHAIN_METADATA,
  CircuitEvaluation,
  USE_CASE_PRESETS,
  UseCasePresetId,
  ZoftCircuitConfig,
} from '../utils/zoftProtocolLogic';
import { IsometricBrickStrip } from './IsometricBrickStrip';
import { ShieldedNoteOrb } from './ShieldedNoteOrb';
import { ZoftReactorViewport } from './ZoftReactorViewport';

interface ZoftOverviewSectionsProps {
  config: ZoftCircuitConfig;
  evaluation: CircuitEvaluation;
  simulationPulseCount: number;
  onUpdateConfig: (partial: Partial<ZoftCircuitConfig>) => void;
  onSelectPreset: (presetId: UseCasePresetId) => void;
  onPlaySimulation: () => void;
  onLaunchDapp: (presetId?: UseCasePresetId) => void;
}

export const ZoftOverviewSections: React.FC<ZoftOverviewSectionsProps> = ({
  config,
  evaluation,
  simulationPulseCount,
  onUpdateConfig,
  onSelectPreset,
  onPlaySimulation,
  onLaunchDapp,
}) => {
  const [viewingKeyDecrypted, setViewingKeyDecrypted] = useState(true);
  const [copiedAudit, setCopiedAudit] = useState(false);
  const [heroCtaHovered, setHeroCtaHovered] = useState(false);

  const sourceMeta = CHAIN_METADATA[config.sourceChain];
  const destMeta = CHAIN_METADATA[config.destinationChain];

  const handleCopyAuditJson = () => {
    const payload = JSON.stringify(
      {
        protocol: 'zOFT-v1-Noir-JoinSplit',
        viewingKey: evaluation.viewingKeyExportHex,
        sourceChain: sourceMeta.name,
        destinationChain: destMeta.name,
        merkleRoot: evaluation.merkleRootHex,
        nullifier: evaluation.nullifierHashHex,
        crossChainIntentUsdc: evaluation.crossChainIntentUsdc,
        shieldedChangeUsdc: evaluation.shieldedChangeUsdc,
        erc5564StealthRecipient: evaluation.stealthAddressHex,
        aspAssociationSet: config.aspComplianceEnabled ? '0xbow-Verified-Mainnet' : 'Unverified',
      },
      null,
      2
    );
    navigator.clipboard?.writeText(payload).catch(() => {});
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 1800);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* =================================================================== */}
      {/* 1. HERO SECTION: 2-Column Split + Full-Width 4-Column KPI Strip     */}
      {/* =================================================================== */}
      <section
        id="overview-hero"
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 scroll-mt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (7 Cols): Executive Thesis, 3D Glassmorphism Shielded Note Orb & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#0d0e12] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs font-mono-num text-zinc-400">
                <span className="text-white font-semibold">$ZOFT</span>
                <span aria-hidden="true">·</span>
                <span>Omnichain ZK Join-Split Protocol</span>
                <span aria-hidden="true">·</span>
                <span>LayerZero V2 lzRead</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">ERC-5564 Stealth</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white mt-4 leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Untraceable Multi-Chain Capital Mobility Without Correlation Leaks.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-[65ch]">
                Conventional bridges broadcast identical nominal amounts across chains, exposing
                your entire treasury and DeFi history to AI mempool trackers.{' '}
                <strong className="text-white">zOFT Protocol</strong> combines client-side Noir ZK
                Join-Split circuits, pull-based{' '}
                <strong className="text-white">LayerZero V2 lzRead</strong> verification, and{' '}
                <strong className="text-white">0xbow ASP</strong> compliance to sever amount,
                timing, and address correlation permanently.
              </p>

              {/* 3D-Inspired Glassmorphism Floating 'Shielded Note' Orb */}
              <ShieldedNoteOrb
                config={config}
                evaluation={evaluation}
                simulationPulseCount={simulationPulseCount}
                externalHoverActive={heroCtaHovered}
                onUpdateSplit={(pct) => onUpdateConfig({ withdrawalSplitPercent: pct })}
                onTriggerPulse={onPlaySimulation}
              />
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div
                className="flex flex-wrap items-center gap-3"
                onPointerEnter={() => setHeroCtaHovered(true)}
                onPointerLeave={() => setHeroCtaHovered(false)}
              >
                <button
                  type="button"
                  onClick={() => onLaunchDapp()}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#070709] font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
                >
                  <span>Launch Circuit Builder dApp (/app)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onPlaySimulation}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#161820] border border-white/15 text-xs sm:text-sm font-medium text-white hover:border-white/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulate 3D Join-Split Proof</span>
                </button>
              </div>

              <div className="text-xs font-mono-num text-zinc-400">
                Active Route: <strong className="text-white">{sourceMeta.name}</strong> →{' '}
                <strong className="text-white">{destMeta.name}</strong>
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Live Interactive 3D Noir ZK Reactor Showcase */}
          <div className="lg:col-span-5 bg-[#090a0d] border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between min-h-[380px] relative">
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#0d0e12]">
              <div>
                <div className="text-xs font-semibold text-white">
                  3D Noir ZK Join-Split Reactor
                </div>
                <div className="text-[11px] font-mono-num text-zinc-400">
                  Drag to orbit 360° · Live Split {config.withdrawalSplitPercent}% /{' '}
                  {100 - config.withdrawalSplitPercent}%
                </div>
              </div>
              <span className="text-xs font-mono-num text-emerald-400">ZK-DVN Active</span>
            </div>

            <div className="flex-1 min-h-[260px] w-full">
              <ZoftReactorViewport
                config={config}
                simulationPulseCount={simulationPulseCount}
                compactMode={false}
              />
            </div>

            <div className="p-3.5 bg-[#0d0e12] border-t border-white/10 flex items-center justify-between text-xs font-mono-num">
              <span className="text-zinc-400">
                Intent:{' '}
                <strong className="text-white">
                  {evaluation.crossChainIntentUsdc.toLocaleString()} USDC
                </strong>
              </span>
              <span className="text-zinc-400">
                Change:{' '}
                <strong className="text-zinc-200">
                  {evaluation.shieldedChangeUsdc.toLocaleString()} USDC
                </strong>
              </span>
              <span className="text-amber-300">-{evaluation.gasSavedPercent}% lzRead Gas</span>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Quantitative Proof Strip Below Hero */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'LayerZero V2 lzRead Gas Reduction',
              value: `-${evaluation.gasSavedPercent}%`,
              sub: `$${evaluation.estimatedVerifyGasUsd} pull verify vs $${evaluation.legacyPushGasUsd} push broadcast`,
            },
            {
              label: 'Cross-Chain Amount Correlation',
              value: '0.00%',
              sub: 'Broken via In-Circuit UTXO Join-Split & Solver Batching',
            },
            {
              label: 'Destination Stealth Standard',
              value: 'ERC-5564',
              sub: `Ephemeral Stealth Address + ${config.nativeGasDropEth} ETH Native Gas Drop`,
            },
            {
              label: 'Regulatory Compliance Engine',
              value: '0xbow ASP',
              sub: 'In-circuit Proof of Association + Zcash Viewing Keys',
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#0d0e12] border border-white/10 rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="text-xs text-zinc-400">{stat.label}</div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white font-mono-num mt-1.5">
                {stat.value}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. HIGH-LEVEL ARCHITECTURE & DATA FLOW (3-STAGE OMNICHAIN PIPELINE) */}
      {/* =================================================================== */}
      <section
        id="architecture"
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-mono-num text-zinc-400">
              01. High-Level Architecture & Data Flow
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1">
              End-to-End Omnichain Join-Split Pipeline
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onLaunchDapp()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14161d] border border-white/15 text-xs font-semibold text-white hover:border-white/40 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Configure Pipeline in /app</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Stage 1: Source Chain Vault */}
          <div className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400 mb-3">
                <span>STAGE 01 · SOURCE VAULT</span>
                <span className="text-white">
                  {sourceMeta.name} (EID {sourceMeta.eid})
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Shielded Deposit & Local Merkle Tree
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Users deposit assets into the source <strong className="text-white">zOFT Vault</strong>,
                minting a Pedersen/Poseidon commitment <code className="text-zinc-200">C_in</code>.
                Instead of paying expensive cross-chain messaging gas on deposit, the contract only
                updates its local Incremental Merkle Tree.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5 text-xs font-mono-num">
              <div className="flex justify-between">
                <span className="text-zinc-400">Local Merkle Root</span>
                <span className="text-zinc-200">{evaluation.merkleRootHex.slice(0, 18)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">0xbow ASP Screening</span>
                <span className="text-emerald-400">Proof of Association Valid</span>
              </div>
            </div>
          </div>

          {/* Stage 2: Omnigraph / LayerZero V2 lzRead & Noir ZK */}
          <div className="bg-[#0d0e12] border border-white/20 rounded-2xl p-6 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-amber-300 mb-3">
                <span>STAGE 02 · OMNIGRAPH & NOIR ZK</span>
                <span>LayerZero V2 lzRead</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Client-Side Join-Split & ZK-DVN State Pull
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Inside the browser’s Noir Barretenberg prover, input UTXOs are consolidated and
                fractured into a <strong className="text-white">Cross-Chain Withdrawal Intent</strong>{' '}
                and a <strong className="text-white">Shielded Change Note</strong>. LayerZero V2{' '}
                <code className="text-amber-300">lzRead</code> pulls the source Merkle Root on-demand
                via <strong className="text-white">ZK-DVN</strong>.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5 text-xs font-mono-num">
              <div className="flex justify-between">
                <span className="text-zinc-400">Join-Split Ratio</span>
                <span className="text-white">
                  {config.withdrawalSplitPercent}% Intent / {100 - config.withdrawalSplitPercent}% Change
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Omnichain Gas Saved</span>
                <span className="text-amber-300">
                  -{evaluation.gasSavedPercent}% (${evaluation.estimatedVerifyGasUsd} vs $
                  {evaluation.legacyPushGasUsd})
                </span>
              </div>
            </div>
          </div>

          {/* Stage 3: Destination Verifier & ERC-5564 Stealth Settlement */}
          <div className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-emerald-400 mb-3">
                <span>STAGE 03 · DESTINATION SETTLEMENT</span>
                <span className="text-white">
                  {destMeta.name} (EID {destMeta.eid})
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                ERC-5564 Stealth Payout & Atomic lzCompose
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                The destination Verifier validates the ZK-SNARK proof and Nullifier. Institutional
                solvers settle liquidity in batched rebalances directly to a fresh{' '}
                <strong className="text-white">ERC-5564 Ephemeral Stealth Address</strong> with an
                automatic ETH gas drop or into DeFi via <code className="text-zinc-200">lzCompose</code>.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5 text-xs font-mono-num">
              <div className="flex justify-between">
                <span className="text-zinc-400">Stealth Recipient</span>
                <span className="text-emerald-400">
                  {evaluation.stealthAddressHex.slice(0, 18)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Native ETH Gas Drop</span>
                <span className="text-white">+{config.nativeGasDropEth} ETH Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. CORE BREAKTHROUGHS: 4 Interactive Architecture Cards             */}
      {/* =================================================================== */}
      <section
        id="breakthroughs"
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-20"
      >
        <div className="mb-6">
          <div className="text-xs font-mono-num text-zinc-400">
            02. Core Cryptographic Breakthroughs
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1">
            Why zOFT Changes Omnichain Privacy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Breakthrough A: In-Circuit Join-Split */}
          <div className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400 mb-2">
                <span>01 · IN-CIRCUIT JOIN-SPLIT (NOIR ZK)</span>
                <span className="text-white">UTXO Model</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Severing Nominal Amount Correlation Across Chains
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Standard bridges send the exact same amount from Chain A to Chain B, making
                cross-chain clustering trivial. Inside zOFT’s Noir ZK circuit, deposits are
                fractured into a{' '}
                <strong className="text-white">Cross-Chain Withdrawal Intent</strong> and an
                encrypted <strong className="text-white">Shielded Change Note</strong>.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-mono-num mb-1">
                <span className="text-white">
                  Intent Out: {evaluation.crossChainIntentUsdc.toLocaleString()} USDC (
                  {config.withdrawalSplitPercent}%)
                </span>
                <span className="text-zinc-400">
                  Change Note: {evaluation.shieldedChangeUsdc.toLocaleString()} USDC (
                  {100 - config.withdrawalSplitPercent}%)
                </span>
              </div>
              <IsometricBrickStrip
                valuePercent={config.withdrawalSplitPercent}
                totalBricks={16}
                activeScheme="white"
                showRemainderAsSecondary={true}
                onSelectPercent={(pct) =>
                  onUpdateConfig({ withdrawalSplitPercent: Math.max(15, Math.min(95, pct)) })
                }
                ariaLabel="Breakthrough Join-Split Interactive Bricks"
              />
            </div>
          </div>

          {/* Breakthrough B: LayerZero V2 lzRead */}
          <div className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400 mb-2">
                <span>02 · LAYERZERO V2 LZREAD & ZK-DVN</span>
                <span className="text-amber-300">-90% Gas Overhead</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Pull-Based Merkle Root Synchronization
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Legacy privacy bridges force every depositor to pay cross-chain messaging gas to
                push Merkle roots to all destination networks. zOFT updates the local Merkle tree
                cheaply and uses <strong className="text-white">LayerZero V2 lzRead</strong> to pull
                verified state asynchronously via <strong className="text-white">ZK-DVN</strong>{' '}
                only upon withdrawal.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-mono-num mb-1">
                <span className="text-amber-300">
                  zOFT lzRead Pull: ${evaluation.estimatedVerifyGasUsd}
                </span>
                <span className="text-zinc-500">
                  Legacy 12-Chain Push: ${evaluation.legacyPushGasUsd}
                </span>
              </div>
              <IsometricBrickStrip
                valuePercent={evaluation.gasSavedPercent}
                totalBricks={16}
                activeScheme="amber"
                ariaLabel="LayerZero V2 lzRead Gas Efficiency Bricks"
              />
            </div>
          </div>

          {/* Breakthrough C: Anti-Consolidation Stealth Execution & lzCompose */}
          <div className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400 mb-2">
                <span>03 · ANTI-CONSOLIDATION & LZCOMPOSE</span>
                <span className="text-emerald-400">Atomic DeFi Entry</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Multi-Note Consolidation & Native Gas Drop
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Merging multiple stealth wallets on a public chain exposes your past receiving
                history. zOFT consolidates multiple UTXO notes inside the zero-knowledge circuit and
                settles atomically to a fresh{' '}
                <strong className="text-white">ERC-5564 Stealth Address</strong> or directly into
                Aave/Uniswap via <code className="text-white">lzCompose</code> with an automatic ETH
                gas drop.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-num">
              <div className="flex items-center gap-2 text-zinc-300">
                <GitMerge className="w-4 h-4 text-white" />
                <span>{evaluation.selectedNotesCount} Notes Consolidated In-Circuit</span>
              </div>
              <span className="text-emerald-400">+{config.nativeGasDropEth} ETH Gas Drop</span>
            </div>
          </div>

          {/* Breakthrough D: 0xbow ASP & Zcash Viewing Keys */}
          <div className="bg-[#0d0e12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono-num text-zinc-400 mb-2">
                <span>04 · 0XBOW ASP & ZCASH VIEWING KEYS</span>
                <span className="text-emerald-400">Institutional Audit Ready</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                Compliance Without Compromising On-Chain Anonymity
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Every zOFT proof embeds an in-circuit{' '}
                <strong className="text-white">0xbow Association Set Provider (ASP)</strong>{' '}
                membership check, proving funds originate from non-sanctioned deposits without
                revealing which deposit is yours. Export encrypted{' '}
                <strong className="text-white">Viewing Keys</strong> for tax & corporate auditors.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-num">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Proof of Association (PoA) Active</span>
              </div>
              <span className="text-zinc-400">Viewing Key Standard: ZVK-256</span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. ENTERPRISE & DEFI USE CASES MATRIX (Interactive 4-Tab Switcher)  */}
      {/* =================================================================== */}
      <section
        id="use-cases"
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-20"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono-num text-zinc-400">03. Operational Verticals</div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1">
              Complete Use-Case Specifications
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0d0e12] border border-white/10 rounded-xl">
            {(Object.keys(USE_CASE_PRESETS) as UseCasePresetId[]).map((id) => {
              const p = USE_CASE_PRESETS[id];
              const active = config.presetId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectPreset(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#070709] font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.title.split(' ').slice(0, 2).join(' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Use Case Deep-Dive Panel */}
        {(() => {
          const activePreset = USE_CASE_PRESETS[config.presetId];
          return (
            <div className="bg-[#0d0e12] border border-white/12 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-mono-num text-zinc-400">
                  {activePreset.subtitle} · {activePreset.actorRole}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-white">
                  {activePreset.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#12141b] border border-white/8">
                    <div className="text-xs font-semibold text-zinc-200 mb-1">
                      Structural Surveillance Problem
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {activePreset.problemStatement}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#12141b] border border-white/20">
                    <div className="text-xs font-semibold text-white mb-1">
                      zOFT Protocol Mechanism
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {activePreset.zoftSolution}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#12141b] border border-white/12 rounded-xl p-5 space-y-3">
                <div className="text-xs font-semibold text-white">
                  Live Circuit Parameters for {activePreset.title}
                </div>
                <div className="space-y-2 text-xs font-mono-num">
                  <div className="flex justify-between py-1.5 border-b border-white/8">
                    <span className="text-zinc-400">Omnichain Route</span>
                    <span className="text-white">
                      {CHAIN_METADATA[activePreset.defaultSource].name} →{' '}
                      {CHAIN_METADATA[activePreset.defaultDest].name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/8">
                    <span className="text-zinc-400">Recommended Join-Split</span>
                    <span className="text-white">
                      {activePreset.recommendedSplitPercent}% Intent /{' '}
                      {100 - activePreset.recommendedSplitPercent}% Change
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/8">
                    <span className="text-zinc-400">Solver Anonymity Batch</span>
                    <span className="text-emerald-400">
                      {activePreset.defaultBatchSize} Pooled Intents
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-400">Native ETH Gas Drop</span>
                    <span className="text-amber-300">
                      +{activePreset.defaultGasDropEth} ETH on Settlement
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchDapp(activePreset.id)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white text-[#070709] font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Scenario in 3D Builder dApp (/app)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* =================================================================== */}
      {/* 5. ZCASH-STYLE VIEWING KEY AUDITOR & 0XBOW ASP INSPECTOR            */}
      {/* =================================================================== */}
      <section
        id="compliance-auditor"
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-20"
      >
        <div className="bg-[#0d0e12] border border-white/12 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div>
              <div className="text-xs font-mono-num text-zinc-400">
                04. Selective Disclosure & Tax Compliance
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-white mt-1">
                Zcash-Style Viewing Key & 0xbow ASP Compliance Inspector
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Toggle between what public block explorers / AI bots see versus what your corporate
                auditor sees using your read-only Viewing Key.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewingKeyDecrypted(!viewingKeyDecrypted)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  viewingKeyDecrypted
                    ? 'bg-white text-[#070709] border-white'
                    : 'bg-[#161820] text-zinc-200 border-white/15 hover:border-white/40'
                }`}
              >
                {viewingKeyDecrypted ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Auditor View (Decrypted via Viewing Key)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Public Explorer View (Ciphertext Only)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyAuditJson}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#161820] border border-white/15 text-xs font-medium text-white hover:border-white/40 transition-colors cursor-pointer"
              >
                {copiedAudit ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exported JSON</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Export Tax Proof JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-num text-xs">
            <div className="p-4 rounded-xl bg-[#12141b] border border-white/8">
              <div className="text-zinc-400 mb-1">Source Deposit & Nullifier</div>
              {viewingKeyDecrypted ? (
                <div className="space-y-1 text-white">
                  <div>Vault: {sourceMeta.name}</div>
                  <div>Consolidated Input: {evaluation.totalInputUsdc.toLocaleString()} USDC</div>
                  <div className="text-zinc-400">Nullifier: {evaluation.nullifierHashHex}</div>
                </div>
              ) : (
                <div className="space-y-1 text-zinc-500">
                  <div>Vault: Shielded Merkle Pool</div>
                  <div>Amount: [ZK-SNARK ENCRYPTED]</div>
                  <div>Nullifier: {evaluation.nullifierHashHex}</div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#12141b] border border-white/8">
              <div className="text-zinc-400 mb-1">In-Circuit Join-Split Notes</div>
              {viewingKeyDecrypted ? (
                <div className="space-y-1 text-white">
                  <div>
                    Intent Out: {evaluation.crossChainIntentUsdc.toLocaleString()} USDC (
                    {config.withdrawalSplitPercent}%)
                  </div>
                  <div>
                    Change Note: {evaluation.shieldedChangeUsdc.toLocaleString()} USDC (
                    {100 - config.withdrawalSplitPercent}%)
                  </div>
                  <div className="text-emerald-400">0xbow ASP Set: Verified Clean</div>
                </div>
              ) : (
                <div className="space-y-1 text-zinc-500">
                  <div>Commitment A: {evaluation.withdrawalCommitmentHex}</div>
                  <div>Commitment B: {evaluation.changeCommitmentHex}</div>
                  <div className="text-emerald-400">0xbow ASP PoA: Valid Proof</div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#12141b] border border-white/8">
              <div className="text-zinc-400 mb-1">Destination Stealth Settlement</div>
              {viewingKeyDecrypted ? (
                <div className="space-y-1 text-white">
                  <div>Target: {destMeta.name}</div>
                  <div>Stealth: {evaluation.stealthAddressHex}</div>
                  <div className="text-amber-300">
                    Gas Drop: +{config.nativeGasDropEth} ETH (Batch {config.solverBatchSize}x)
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-zinc-500">
                  <div>Solver Batch Settlement (Unlinked)</div>
                  <div>Stealth Ephemeral: {evaluation.stealthAddressHex}</div>
                  <div>Origin Linkability: 0.00%</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 6. PROTOCOL SPECIFICATIONS & FINAL LAUNCH /APP CTA BANNER           */}
      {/* =================================================================== */}
      <section
        id="specs"
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 scroll-mt-20"
      >
        <div className="bg-[#0d0e12] border border-white/15 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-mono-num text-zinc-400">
              05. Ready for Untraceable Omnichain Execution?
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
              Assemble Your Join-Split Circuit in the Interactive 3D Builder
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Enter the <code className="text-white">/app</code> workspace to connect shielded UTXO
              notes, customize your Cross-Chain Intent vs. Change Note ratio with 3D Isometric
              Bricks, and execute pull-based LayerZero V2 <code className="text-white">lzRead</code>{' '}
              settlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onLaunchDapp()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#070709] font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors cursor-pointer shadow-lg"
            >
              <span>Launch zOFT dApp (/app)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

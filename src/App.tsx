/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ZoftCircuitBuilder } from './components/ZoftCircuitBuilder';
import { ZoftOverviewSections } from './components/ZoftOverviewSections';
import {
  INITIAL_SHIELDED_NOTES,
  UseCasePresetId,
  ZoftCircuitConfig,
  applyUseCasePreset,
  evaluateZoftCircuit,
} from './utils/zoftProtocolLogic';

type AppRoute = '/' | '/app';

function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/app' || path.endsWith('/app') || window.location.hash === '#/app') {
    return '/app';
  }
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(getInitialRoute);
  const [config, setConfig] = useState<ZoftCircuitConfig>({
    presetId: 'dao_payroll',
    sourceChain: 'ethereum',
    destinationChain: 'base',
    notes: INITIAL_SHIELDED_NOTES,
    withdrawalSplitPercent: 75,
    lzReadEnabled: true,
    aspComplianceEnabled: true,
    solverBatchSize: 10,
    settlementDelayMins: 5,
    nativeGasDropEth: 0.015,
    lzComposeTarget: 'none',
    stealthNonce: 1842,
  });

  const [walletConnected, setWalletConnected] = useState(false);
  const [simulationPulseCount, setSimulationPulseCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const evaluation = useMemo(() => evaluateZoftCircuit(config), [config]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(getInitialRoute());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = useCallback((nextRoute: AppRoute) => {
    try {
      window.history.pushState({}, '', nextRoute);
    } catch {
      // Fallback if history pushState is restricted
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUpdateConfig = useCallback((partial: Partial<ZoftCircuitConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSelectPreset = useCallback((presetId: UseCasePresetId) => {
    setConfig((prev) => applyUseCasePreset(prev, presetId));
    setSimulationPulseCount((c) => c + 1);
  }, []);

  const handleToggleNote = useCallback((noteId: string) => {
    setConfig((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === noteId ? { ...n, selected: !n.selected } : n
      ),
    }));
  }, []);

  const handlePlaySimulation = useCallback(() => {
    setSimulationPulseCount((c) => c + 1);
    setIsSimulating(true);
    setSimulationStep(1);
    setTimeout(() => setSimulationStep(2), 600);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationStep(0);
    }, 1800);
  }, []);

  const handleLaunchDapp = useCallback(
    (presetId?: UseCasePresetId) => {
      if (presetId) {
        setConfig((prev) => applyUseCasePreset(prev, presetId));
      }
      navigateTo('/app');
    },
    [navigateTo]
  );

  return (
    <div className="min-h-screen bg-[#070709] text-[#f4f4f6] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract (Adapts cleanly between Landing `/` and dApp `/app`) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 bg-[#070709]/95 border-b border-white/10">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/');
          }}
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          zOFT Protocol
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        {route === '/' ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a
              href="#architecture"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
            <a
              href="#breakthroughs"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Breakthroughs
            </a>
            <a
              href="#use-cases"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Use Cases
            </a>
            <a
              href="#compliance-auditor"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Viewing Keys
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              ← Home Landing
            </a>
            <a
              href="#circuit-builder"
              className="text-white font-semibold whitespace-nowrap shrink-0"
            >
              /app · 3D Circuit Builder
            </a>
            <button
              type="button"
              onClick={handlePlaySimulation}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Simulate Proof
            </button>
          </nav>
        )}

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {route === '/' ? (
            <button
              type="button"
              onClick={() => navigateTo('/app')}
              className="px-4 py-2 text-xs font-semibold text-[#070709] bg-white rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch dApp (/app)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setWalletConnected(!walletConnected)}
              className="px-4 py-2 text-xs font-semibold text-[#070709] bg-white rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {walletConnected ? '0x71C...9A4F (Shielded)' : 'Connect Stealth Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content: Route '/' renders Multi-Section Landing Page; Route '/app' renders 3D Circuit Builder dApp */}
      <main className="flex-1">
        {route === '/' ? (
          <ZoftOverviewSections
            config={config}
            evaluation={evaluation}
            simulationPulseCount={simulationPulseCount}
            onUpdateConfig={handleUpdateConfig}
            onSelectPreset={handleSelectPreset}
            onPlaySimulation={handlePlaySimulation}
            onLaunchDapp={handleLaunchDapp}
          />
        ) : (
          <ZoftCircuitBuilder
            config={config}
            evaluation={evaluation}
            simulationPulseCount={simulationPulseCount}
            isSimulating={isSimulating}
            simulationStep={simulationStep}
            onUpdateConfig={handleUpdateConfig}
            onSelectPreset={handleSelectPreset}
            onToggleNote={handleToggleNote}
            onPlaySimulation={handlePlaySimulation}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-xs text-zinc-500">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            zOFT Protocol ($ZOFT) · Client-Side Noir ZK Join-Split · LayerZero V2 lzRead · ERC-5564 Stealth
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              className={`transition-colors ${
                route === '/' ? 'text-white font-medium' : 'hover:text-zinc-300'
              }`}
            >
              Home (/)
            </a>
            <a
              href="/app"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/app');
              }}
              className={`transition-colors ${
                route === '/app' ? 'text-white font-medium' : 'hover:text-zinc-300'
              }`}
            >
              Builder dApp (/app)
            </a>
            <a
              href="#architecture"
              onClick={(e) => {
                if (route !== '/') {
                  e.preventDefault();
                  navigateTo('/');
                }
              }}
              className="hover:text-zinc-300 transition-colors"
            >
              Architecture
            </a>
            <a
              href="#compliance-auditor"
              onClick={(e) => {
                if (route !== '/') {
                  e.preventDefault();
                  navigateTo('/');
                }
              }}
              className="hover:text-zinc-300 transition-colors"
            >
              0xbow ASP Audit
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Pure simulation logic, cryptographic commitment generators, LayerZero V2 lzRead gas math,
 * Join-Split circuit constraints, and use-case presets for the zOFT Protocol ($ZOFT).
 */

export type ChainId = 'ethereum' | 'arbitrum' | 'base' | 'optimism';
export type UseCasePresetId =
  | 'dao_payroll'
  | 'whale_rebalance'
  | 'b2b_invoice'
  | 'opsec_decouple';
export type LzComposeTarget = 'none' | 'aave_v3_supply' | 'uniswap_v4_lp' | 'pendle_pt_vault';
export type CircuitBlockCategory =
  | 'entry_asp'
  | 'input_notes'
  | 'core_chamber'
  | 'lzread_dvn'
  | 'output_settlement';

export interface ShieldedNote {
  id: string;
  label: string;
  amountUsdc: number;
  sourceChain: ChainId;
  commitmentHash: string;
  leafIndex: number;
  selected: boolean;
}

export interface ZoftCircuitConfig {
  presetId: UseCasePresetId;
  sourceChain: ChainId;
  destinationChain: ChainId;
  notes: ShieldedNote[];
  /** Percentage of consolidated input sent cross-chain (10 to 100%). Remainder stays as Shielded Change Note */
  withdrawalSplitPercent: number;
  /** LayerZero V2 state synchronization mode */
  lzReadEnabled: boolean;
  /** 0xbow Association Set Provider (Proof of Association) enabled */
  aspComplianceEnabled: boolean;
  /** Solver settlement batch size (1, 5, 10, 25 intents) */
  solverBatchSize: number;
  /** Time delay in minutes before solver settlement (0, 5, 15, 60) */
  settlementDelayMins: number;
  /** Native ETH gas drop on destination chain (0 to 0.05 ETH) */
  nativeGasDropEth: number;
  /** Optional atomic DeFi execution via LayerZero V2 lzCompose */
  lzComposeTarget: LzComposeTarget;
  /** Ephemeral ERC-5564 Stealth Meta-Address seed */
  stealthNonce: number;
}

export interface CircuitEvaluation {
  totalInputUsdc: number;
  selectedNotesCount: number;
  crossChainIntentUsdc: number;
  shieldedChangeUsdc: number;
  gasSavedPercent: number;
  estimatedVerifyGasUsd: number;
  legacyPushGasUsd: number;
  privacyCorrelationRiskPercent: number;
  anonymityShieldScore: number;
  issuesToFix: string[];
  merkleRootHex: string;
  nullifierHashHex: string;
  withdrawalCommitmentHex: string;
  changeCommitmentHex: string;
  stealthAddressHex: string;
  viewingKeyExportHex: string;
}

export interface UseCaseMetadata {
  id: UseCasePresetId;
  title: string;
  subtitle: string;
  actorRole: string;
  problemStatement: string;
  zoftSolution: string;
  recommendedSplitPercent: number;
  defaultSource: ChainId;
  defaultDest: ChainId;
  defaultBatchSize: number;
  defaultDelayMins: number;
  defaultGasDropEth: number;
  defaultCompose: LzComposeTarget;
}

export const CHAIN_METADATA: Record<
  ChainId,
  { name: string; eid: number; blockTime: string; explorer: string }
> = {
  ethereum: { name: 'Ethereum L1', eid: 30101, blockTime: '12.0s', explorer: 'etherscan.io' },
  arbitrum: { name: 'Arbitrum One', eid: 30110, blockTime: '0.25s', explorer: 'arbiscan.io' },
  base: { name: 'Base Mainnet', eid: 30184, blockTime: '2.0s', explorer: 'basescan.org' },
  optimism: { name: 'OP Mainnet', eid: 30111, blockTime: '2.0s', explorer: 'optimistic.etherscan.io' },
};

export const USE_CASE_PRESETS: Record<UseCasePresetId, UseCaseMetadata> = {
  dao_payroll: {
    id: 'dao_payroll',
    title: 'Confidential Cross-Chain Payroll',
    subtitle: 'DAO & Enterprise Treasury Payouts',
    actorRole: 'DAO Treasury Multisig -> Global Contributors',
    problemStatement:
      'Transparent payroll from an L1 Multisig exposes contributor wallets, monthly salaries, and organizational burn rate to competitors and on-chain scrapers.',
    zoftSolution:
      'Funds are locked in Ethereum zOFTVault and split inside Noir ZK into exact contributor payouts on Base ERC-5564 Stealth Addresses with native ETH gas drops and Zcash Viewing Keys for tax compliance.',
    recommendedSplitPercent: 75,
    defaultSource: 'ethereum',
    defaultDest: 'base',
    defaultBatchSize: 10,
    defaultDelayMins: 5,
    defaultGasDropEth: 0.015,
    defaultCompose: 'none',
  },
  whale_rebalance: {
    id: 'whale_rebalance',
    title: 'Anti-Surveillance Whale Rebalancing',
    subtitle: 'Institutional Capital Mobility & DeFi Entry',
    actorRole: 'Liquid Token Fund / Whale Vault',
    problemStatement:
      'Moving 7-figure liquidity across bridges triggers AI mempool trackers (Arkham/Nansen), inviting front-running, copy-trading, and predatory slippage.',
    zoftSolution:
      'In-Circuit Join-Split fractures large positions into unlinked Cross-Chain Intents settled via batched solver liquidity and routed atomically into Aave V3 via lzCompose.',
    recommendedSplitPercent: 65,
    defaultSource: 'ethereum',
    defaultDest: 'arbitrum',
    defaultBatchSize: 25,
    defaultDelayMins: 15,
    defaultGasDropEth: 0.025,
    defaultCompose: 'aave_v3_supply',
  },
  b2b_invoice: {
    id: 'b2b_invoice',
    title: 'Private B2B Commercial Invoicing',
    subtitle: 'Supply Chain & Vendor Settlement',
    actorRole: 'Enterprise Vendor & Corporate Auditor',
    problemStatement:
      'Static corporate wallet addresses leak daily sales volume, supplier relationships, and profit margins on public block explorers.',
    zoftSolution:
      'Clients settle invoices across L2s into corporate Stealth Meta-Addresses while accountants verify incoming settlements privately via read-only Zcash Viewing Keys.',
    recommendedSplitPercent: 85,
    defaultSource: 'optimism',
    defaultDest: 'ethereum',
    defaultBatchSize: 5,
    defaultDelayMins: 5,
    defaultGasDropEth: 0.01,
    defaultCompose: 'none',
  },
  opsec_decouple: {
    id: 'opsec_decouple',
    title: 'OpSec Portfolio Decoupling',
    subtitle: 'Personal Wallet Identity Separation',
    actorRole: 'Doxxed ENS Holder / Power User',
    problemStatement:
      'Funding a fresh trading wallet directly from a public ENS-linked address permanently links all future DeFi activity to your historical identity.',
    zoftSolution:
      'Consolidates multiple shielded notes inside the ZK circuit with a time-delayed solver release to a fresh ERC-5564 Stealth Address plus native ETH gas drop.',
    recommendedSplitPercent: 60,
    defaultSource: 'arbitrum',
    defaultDest: 'base',
    defaultBatchSize: 10,
    defaultDelayMins: 60,
    defaultGasDropEth: 0.02,
    defaultCompose: 'uniswap_v4_lp',
  },
};

export const INITIAL_SHIELDED_NOTES: ShieldedNote[] = [
  {
    id: 'note-01',
    label: 'UTXO Note #01 · Treasury Tranche A',
    amountUsdc: 60000,
    sourceChain: 'ethereum',
    commitmentHash: '0x9f8c...31a4',
    leafIndex: 14208,
    selected: true,
  },
  {
    id: 'note-02',
    label: 'UTXO Note #02 · Shielded Reserve B',
    amountUsdc: 40000,
    sourceChain: 'ethereum',
    commitmentHash: '0x4b2e...88c1',
    leafIndex: 14219,
    selected: true,
  },
  {
    id: 'note-03',
    label: 'UTXO Note #03 · Residual Change C',
    amountUsdc: 25000,
    sourceChain: 'ethereum',
    commitmentHash: '0x7d1a...09f2',
    leafIndex: 14255,
    selected: false,
  },
];

/**
 * Deterministic 32-bit FNV-1a style hex generator for realistic cryptographic hashes
 */
export function deterministicHex(seedStr: string, bytes = 8): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h1 ^= seedStr.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  let out = '';
  let state = h1 >>> 0;
  for (let b = 0; b < bytes; b++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const byteHex = ((state >>> 0) & 0xff).toString(16).padStart(2, '0');
    out += byteHex;
  }
  return `0x${out}`;
}

/**
 * Evaluates the current zOFT circuit configuration, computing split amounts,
 * LayerZero V2 lzRead gas savings, privacy correlation risk, and circuit warnings.
 */
export function evaluateZoftCircuit(config: ZoftCircuitConfig): CircuitEvaluation {
  const selectedNotes = config.notes.filter((n) => n.selected);
  const selectedNotesCount = selectedNotes.length;
  const totalInputUsdc = selectedNotes.reduce((acc, n) => acc + n.amountUsdc, 0);

  const clampedSplit = Math.max(10, Math.min(100, Math.round(config.withdrawalSplitPercent)));
  const crossChainIntentUsdc = Math.round((totalInputUsdc * clampedSplit) / 100);
  const shieldedChangeUsdc = totalInputUsdc - crossChainIntentUsdc;

  // LayerZero V2 lzRead vs Legacy Push Bridge gas calculations
  const legacyPushGasUsd = 42.5; // Broadcasting Merkle root updates across 12 chains
  const estimatedVerifyGasUsd = config.lzReadEnabled ? 3.85 : 38.2;
  const gasSavedPercent = config.lzReadEnabled
    ? Math.round(((legacyPushGasUsd - estimatedVerifyGasUsd) / legacyPushGasUsd) * 100)
    : 10;

  // Calculate privacy correlation risk (0% is best, higher means correlation leaks)
  let risk = 4.0;
  if (clampedSplit === 100) {
    // 100% withdrawal without a Shielded Change Note leaks exact amount correlation!
    risk += 58.0;
  }
  if (config.solverBatchSize <= 1) {
    risk += 24.0;
  } else if (config.solverBatchSize >= 10) {
    risk -= 2.5;
  }
  if (config.settlementDelayMins === 0) {
    risk += 12.0;
  } else if (config.settlementDelayMins >= 15) {
    risk -= 1.5;
  }

  const privacyCorrelationRiskPercent = Math.max(
    0.4,
    Math.min(99, Math.round(risk * 10) / 10)
  );
  const anonymityShieldScore = Math.max(
    5,
    Math.min(99, Math.round(100 - privacyCorrelationRiskPercent))
  );

  // Check circuit constraints ("X to fix" like hookr.fun/builder)
  const issuesToFix: string[] = [];
  if (selectedNotesCount === 0) {
    issuesToFix.push('Select at least 1 Shielded Input Note to fund the ZK Join-Split circuit');
  }
  if (config.sourceChain === config.destinationChain) {
    issuesToFix.push('Source and Destination chains are identical; choose a cross-chain target for lzRead');
  }
  if (clampedSplit === 100) {
    issuesToFix.push('100% withdrawal leaves 0 Shielded Change, exposing exact amount correlation');
  }
  if (!config.aspComplianceEnabled) {
    issuesToFix.push('0xbow ASP Proof of Association is disabled; institutional solvers require PoA');
  }
  if (!config.lzReadEnabled) {
    issuesToFix.push('LayerZero V2 lzRead is off; falling back to expensive multi-chain root broadcast');
  }

  const seedKey = `${config.sourceChain}-${config.destinationChain}-${totalInputUsdc}-${clampedSplit}-${config.stealthNonce}`;
  const fullMerkle = deterministicHex(`merkle-${seedKey}`, 16);
  const fullNullifier = deterministicHex(`nullifier-${seedKey}`, 16);
  const fullWithdrawComm = deterministicHex(`withdraw-${crossChainIntentUsdc}-${seedKey}`, 16);
  const fullChangeComm = deterministicHex(`change-${shieldedChangeUsdc}-${seedKey}`, 16);
  const fullStealth = deterministicHex(`erc5564-${config.destinationChain}-${config.stealthNonce}`, 20);
  const viewingKey = deterministicHex(`zvk-audit-${seedKey}`, 24);

  return {
    totalInputUsdc,
    selectedNotesCount,
    crossChainIntentUsdc,
    shieldedChangeUsdc,
    gasSavedPercent,
    estimatedVerifyGasUsd,
    legacyPushGasUsd,
    privacyCorrelationRiskPercent,
    anonymityShieldScore,
    issuesToFix,
    merkleRootHex: `${fullMerkle.slice(0, 10)}...${fullMerkle.slice(-6)}`,
    nullifierHashHex: `${fullNullifier.slice(0, 10)}...${fullNullifier.slice(-6)}`,
    withdrawalCommitmentHex: `${fullWithdrawComm.slice(0, 10)}...${fullWithdrawComm.slice(-6)}`,
    changeCommitmentHex:
      shieldedChangeUsdc > 0 ? `${fullChangeComm.slice(0, 10)}...${fullChangeComm.slice(-6)}` : '0x0000...0000 (None)',
    stealthAddressHex: `st:eth:${fullStealth.slice(0, 12)}...${fullStealth.slice(-6)}`,
    viewingKeyExportHex: `zvk1_${viewingKey.slice(2, 22)}...${viewingKey.slice(-8)}`,
  };
}

/**
 * Helper to apply a UseCasePresetId onto an existing ZoftCircuitConfig
 */
export function applyUseCasePreset(
  current: ZoftCircuitConfig,
  presetId: UseCasePresetId
): ZoftCircuitConfig {
  const preset = USE_CASE_PRESETS[presetId];
  return {
    ...current,
    presetId,
    sourceChain: preset.defaultSource,
    destinationChain: preset.defaultDest,
    withdrawalSplitPercent: preset.recommendedSplitPercent,
    lzReadEnabled: true,
    aspComplianceEnabled: true,
    solverBatchSize: preset.defaultBatchSize,
    settlementDelayMins: preset.defaultDelayMins,
    nativeGasDropEth: preset.defaultGasDropEth,
    lzComposeTarget: preset.defaultCompose,
    notes: current.notes.map((n, idx) => ({
      ...n,
      sourceChain: preset.defaultSource,
      selected: idx < 2,
    })),
  };
}

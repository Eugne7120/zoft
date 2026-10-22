import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SHIELDED_NOTES,
  ZoftCircuitConfig,
  applyUseCasePreset,
  deterministicHex,
  evaluateZoftCircuit,
} from './zoftProtocolLogic';

test('deterministicHex generates consistent hex strings of requested byte length', () => {
  const h1 = deterministicHex('zoft-seed-1', 8);
  const h2 = deterministicHex('zoft-seed-1', 8);
  const h3 = deterministicHex('zoft-seed-2', 8);

  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
  assert.equal(h1.length, 2 + 16);
});

test('evaluateZoftCircuit computes Join-Split output notes and LayerZero V2 lzRead gas savings', () => {
  const baseConfig: ZoftCircuitConfig = {
    presetId: 'dao_payroll',
    sourceChain: 'ethereum',
    destinationChain: 'base',
    notes: INITIAL_SHIELDED_NOTES, // first two selected = 60,000 + 40,000 = 100,000 USDC
    withdrawalSplitPercent: 75,
    lzReadEnabled: true,
    aspComplianceEnabled: true,
    solverBatchSize: 10,
    settlementDelayMins: 15,
    nativeGasDropEth: 0.015,
    lzComposeTarget: 'none',
    stealthNonce: 101,
  };

  const evalResult = evaluateZoftCircuit(baseConfig);
  assert.equal(evalResult.totalInputUsdc, 100000);
  assert.equal(evalResult.selectedNotesCount, 2);
  assert.equal(evalResult.crossChainIntentUsdc, 75000);
  assert.equal(evalResult.shieldedChangeUsdc, 25000);
  assert.ok(evalResult.gasSavedPercent >= 90, 'Expected >= 90% gas savings when lzRead is enabled');
  assert.equal(evalResult.issuesToFix.length, 0);
});

test('evaluateZoftCircuit flags issues when 100% split or ASP disabled', () => {
  const leakyConfig: ZoftCircuitConfig = {
    presetId: 'whale_rebalance',
    sourceChain: 'ethereum',
    destinationChain: 'ethereum', // identical chain error
    notes: INITIAL_SHIELDED_NOTES,
    withdrawalSplitPercent: 100, // 0 change note correlation leak
    lzReadEnabled: false,
    aspComplianceEnabled: false,
    solverBatchSize: 1,
    settlementDelayMins: 0,
    nativeGasDropEth: 0,
    lzComposeTarget: 'none',
    stealthNonce: 202,
  };

  const result = evaluateZoftCircuit(leakyConfig);
  assert.equal(result.shieldedChangeUsdc, 0);
  assert.ok(result.issuesToFix.length >= 4);
  assert.ok(result.privacyCorrelationRiskPercent > 60);
});

test('applyUseCasePreset updates source, destination, and split ratio accurately', () => {
  const initial: ZoftCircuitConfig = {
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
    stealthNonce: 1,
  };

  const updated = applyUseCasePreset(initial, 'whale_rebalance');
  assert.equal(updated.presetId, 'whale_rebalance');
  assert.equal(updated.destinationChain, 'arbitrum');
  assert.equal(updated.withdrawalSplitPercent, 65);
  assert.equal(updated.lzComposeTarget, 'aave_v3_supply');
});

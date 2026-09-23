"""BullCamp original offline research lab. Synthetic prices; no external services."""
import argparse
import csv
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def validate(config):
    if config.get('rule') not in ('trend', 'hold'):
        raise ValueError('rule must be trend or hold')
    for key, lo, hi in [('lookback', 2, 8), ('weight', 0, 1), ('fee_rate', 0, .1)]:
        value = config.get(key)
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not lo <= value <= hi:
            raise ValueError(f'{key} must be between {lo} and {hi}')
    if int(config['lookback']) != config['lookback']:
        raise ValueError('lookback must be an integer')


def buy_cash(cash, qty, price, fee_rate):
    return cash - qty * price * (1 + fee_rate)


def sell_cash(cash, qty, price, fee_rate):
    return cash + qty * price * (1 - fee_rate)


def simulate(prices, config):
    validate(config)
    if len(prices) < 3 or any(not math.isfinite(x) or x <= 0 for x in prices):
        raise ValueError('at least three positive finite prices required')
    cash, shares, total_fees, trades = 10000., 0., 0., 0
    peak, max_drawdown = cash, 0.
    ledger = [{'period': 1, 'price': prices[0], 'cash': cash, 'shares': 0., 'equity': cash, 'fee': 0.}]
    for t in range(1, len(prices)):
        # Signal sees only prior observations. Execute at current given price.
        history = prices[max(0, t - int(config['lookback'])):t]
        signal = config['rule'] == 'hold' or (len(history) >= config['lookback'] and prices[t-1] > sum(history) / len(history))
        price = prices[t]
        target = config['weight'] if signal else 0
        desired = (cash + shares * price) * target / price
        delta = desired - shares
        fee = 0.
        if abs(delta) > .0001:
            quantity = min(delta, cash / (price * (1 + config['fee_rate']))) if delta > 0 else delta
            fee = abs(quantity) * price * config['fee_rate']
            cash = buy_cash(cash, quantity, price, config['fee_rate']) if quantity >= 0 else sell_cash(cash, -quantity, price, config['fee_rate'])
            shares += quantity
            total_fees += fee
            trades += 1
        equity = cash + shares * price
        peak = max(peak, equity)
        max_drawdown = max(max_drawdown, 1 - equity / peak)
        ledger.append({'period': t+1, 'price': price, 'signal': signal, 'cash': cash, 'shares': shares, 'equity': equity, 'fee': fee})
    return {'final_equity': ledger[-1]['equity'], 'net_return': ledger[-1]['equity'] / 10000 - 1, 'fees': total_fees, 'trades': trades, 'max_drawdown': max_drawdown, 'ledger': ledger}


def experiment(config, data_path):
    raw = data_path.read_bytes()
    groups = {}
    with data_path.open(encoding='utf-8') as f:
        for row in csv.DictReader(f):
            groups.setdefault(row['segment'], []).append(float(row['price']))
    results = {}
    for segment, prices in groups.items():
        net = simulate(prices, config)
        zero_fee = simulate(prices, {**config, 'fee_rate': 0})
        baseline = simulate(prices, {**config, 'rule': 'hold', 'weight': 1})
        results[segment] = {'strategy': net, 'zero_fee_same_rule': zero_fee, 'same_cost_hold_baseline': baseline}
    return {'format_version': 1, 'implementation': 'bullcamp-offline-1', 'data_kind': 'original synthetic teaching data; not market history', 'data_sha256': hashlib.sha256(raw).hexdigest(), 'config': config, 'assumptions': ['signal at t uses prices before t', 'execution uses given price at t', 'fractional shares', 'cash return zero', 'no dividends/tax/slippage', 'target rebalanced each period', 'each segment starts with 10000 cash'], 'results': results}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, default=ROOT / 'config.json')
    parser.add_argument('--data', type=Path, default=ROOT / 'prices.csv')
    parser.add_argument('--output', type=Path, default=Path('experiment.json'))
    args = parser.parse_args()
    try:
        config = json.loads(args.config.read_text(encoding='utf-8'))
        result = experiment(config, args.data)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, f'Experiment failed: {error}\n')
    for name, runs in result['results'].items():
        s = runs['strategy']
        print(f'{name}: equity={s["final_equity"]:.2f}, fees={s["fees"]:.2f}, max_drawdown={s["max_drawdown"]:.2%}')
    print(f'Saved reproducible record: {args.output}')


if __name__ == '__main__':
    main()

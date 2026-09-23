import unittest
from pathlib import Path
from lab import buy_cash, sell_cash, simulate, experiment, validate


class AccountingTests(unittest.TestCase):
    def test_round_trip_deducts_two_fees(self):
        cash = buy_cash(1000, 2, 100, .01)
        self.assertAlmostEqual(sell_cash(cash, 2, 100, .01), 996)

    def test_no_future_dependency_in_prefix(self):
        p = dict(rule='trend', lookback=2, weight=.8, fee_rate=.01)
        a = simulate([100, 103, 106, 110, 200], p)
        b = simulate([100, 103, 106, 110, 1], p)
        self.assertEqual(a['ledger'][:4], b['ledger'][:4])

    def test_cash_cannot_be_overspent_at_full_weight(self):
        r = simulate([100, 100, 100], dict(rule='hold', lookback=2, weight=1, fee_rate=.1))
        self.assertTrue(all(row['cash'] > -1e-8 for row in r['ledger']))
        self.assertLess(r['final_equity'], 10000)

    def test_experiment_data_and_accounting(self):
        r = experiment(dict(rule='trend', lookback=3, weight=.8, fee_rate=.002), Path(__file__).with_name('prices.csv'))
        self.assertEqual(set(r['results']), {'train', 'validation', 'test'})
        self.assertEqual(len(r['data_sha256']), 64)
        for segment in r['results'].values():
            for row in segment['strategy']['ledger']:
                self.assertAlmostEqual(row['cash'] + row['shares'] * row['price'], row['equity'])

    def test_reject_bad_parameters(self):
        base = dict(rule='trend', lookback=3, weight=.8, fee_rate=.002)
        for change in [dict(fee_rate=-.1), dict(weight=1.5), dict(lookback=2.5), dict(weight=float('nan'))]:
            with self.assertRaises(ValueError):
                validate({**base, **change})


if __name__ == '__main__':
    unittest.main()

"""Exercise runner; excluded from project's normal test discovery by load_tests."""
import unittest
from exercise import buy_cash, sell_cash


class FeeExercise(unittest.TestCase):
    def test_purchase_fee(self):
        self.assertAlmostEqual(buy_cash(1000, 2, 100, .01), 798)

    def test_sale_fee(self):
        self.assertAlmostEqual(sell_cash(1000, 2, 100, .01), 1198)

    def test_no_trade(self):
        self.assertEqual(buy_cash(1000, 0, 100, .02), 1000)
        self.assertEqual(sell_cash(1000, 0, 100, .02), 1000)

    def test_zero_fee(self):
        self.assertEqual(buy_cash(1000, 2, 100, 0), 800)
        self.assertEqual(sell_cash(1000, 2, 100, 0), 1200)


def load_tests(loader, tests, pattern):
    return unittest.TestSuite() if pattern is not None else tests


if __name__ == '__main__':
    unittest.main()

"""Learner task: fix both expressions. This file intentionally omits fees.

Run: python3 practice/test_exercise.py
Expected initially: failing tests. Reference behavior is in lab.py.
"""


def buy_cash(cash, qty, price, fee_rate):
    # TODO: deduct the transaction fee as well as the purchase amount.
    return cash - qty * price


def sell_cash(cash, qty, price, fee_rate):
    # TODO: deduct the transaction fee from the sale proceeds.
    return cash + qty * price

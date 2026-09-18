import Wallet from '../models/Wallet.js';

const defaultBalances = { VEs: 350, SVEs: 1200, Tokens: 2500 };

const getWallet = async (userId) => Wallet.findOneAndUpdate(
  { userId },
  { $setOnInsert: { userId, balances: defaultBalances } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
).lean();

export const validateWalletBalance = async ({ userId, requiredPoints = 0, currency = 'VEs' }) => {
  const wallet = await getWallet(userId);
  const balance = wallet.balances?.[currency] ?? 0;

  if (balance < requiredPoints) {
    return {
      success: false,
      balance,
      requiredPoints,
      currency,
      message: `Insufficient ${currency} balance for this giveaway.`
    };
  }

  return { success: true, balance, requiredPoints, currency };
};

export const deductWalletBalance = async ({ userId, currency = 'VEs', amount = 0 }) => {
  const wallet = await getWallet(userId);
  const balanceBefore = wallet.balances?.[currency] ?? 0;
  const updated = await Wallet.findOneAndUpdate(
    { userId, [`balances.${currency}`]: { $gte: amount } },
    { $inc: { [`balances.${currency}`]: -amount } },
    { new: true }
  ).lean();

  if (!updated) {
    return { success: false, balanceBefore, balanceAfter: balanceBefore, currency, amount };
  }

  return { success: true, balanceBefore, balanceAfter: updated.balances[currency], balances: updated.balances, currency, amount };
};

export const reverseWalletBalance = async ({ userId, currency = 'VEs', amount = 0 }) => {
  const updated = await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [`balances.${currency}`]: amount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return { success: true, balanceAfter: updated.balances[currency], currency, amount };
};

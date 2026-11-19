/** The single subscription plan offered before registration. */
export const SUBSCRIPTION_PLAN = {
  name: 'E-Diary access',
  priceLabel: '₹150',
  durationDays: 365,
  durationLabel: '365 days',
  benefits: ['Full access to every feature', 'Your data saved securely', 'Login from any phone'],
} as const;

export const PAYMENT_METHODS = [
  { id: 'phonepe', label: 'PhonePe (UPI)' },
  { id: 'gpay', label: 'Google Pay (UPI)' },
  { id: 'upi', label: 'Other UPI ID' },
  { id: 'card', label: 'Debit or credit card' },
  { id: 'netbanking', label: 'Netbanking' },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

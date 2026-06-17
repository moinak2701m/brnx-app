import { pgTable, uuid, varchar, decimal, text, jsonb, timestamp, pgEnum, boolean, index } from 'drizzle-orm/pg-core'

export const kycStatusEnum   = pgEnum('kyc_status',   ['pending', 'verified', 'rejected'])
export const txStatusEnum    = pgEnum('tx_status',    ['pending_wire', 'wire_received', 'usdc_received', 'usdc_sent', 'payout_initiated', 'completed', 'failed'])
export const relationshipEnum = pgEnum('relationship', ['family', 'self', 'friend', 'business'])

export const users = pgTable('users', {
  id:         uuid('id').primaryKey().defaultRandom(),
  email:      varchar('email', { length: 255 }).notNull().unique(),
  fullName:   varchar('full_name', { length: 255 }).notNull(),
  phone:      varchar('phone', { length: 30 }),
  kycStatus:  kycStatusEnum('kyc_status').notNull().default('pending'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const beneficiaries = pgTable('beneficiaries', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:         varchar('name', { length: 255 }).notNull(),
  bankName:     varchar('bank_name', { length: 255 }),
  accountNumber: varchar('account_number', { length: 50 }).notNull(),
  ifsc:         varchar('ifsc', { length: 20 }).notNull(),
  relationship: relationshipEnum('relationship').notNull().default('family'),
  isDefault:    boolean('is_default').notNull().default(false),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('beneficiaries_user_id_idx').on(t.userId),
])

export const transactions = pgTable('transactions', {
  id:                     varchar('id', { length: 64 }).primaryKey(),
  userId:                 uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  beneficiaryId:          uuid('beneficiary_id').references(() => beneficiaries.id, { onDelete: 'set null' }),
  status:                 txStatusEnum('status').notNull().default('pending_wire'),
  amountUsd:              decimal('amount_usd', { precision: 12, scale: 2 }).notNull(),
  amountInr:              decimal('amount_inr', { precision: 14, scale: 2 }).notNull(),
  exchangeRate:           decimal('exchange_rate', { precision: 10, scale: 4 }),
  pvTransactionId:        varchar('pv_transaction_id', { length: 64 }),
  pvQuoteId:              varchar('pv_quote_id', { length: 64 }),
  bankDetails:            jsonb('bank_details'),
  beneficiarySnapshot:    jsonb('beneficiary_snapshot'),  // name/account/ifsc at time of tx
  crediblePayoutId:       varchar('credible_payout_id', { length: 64 }),
  credibleDepositAddress: varchar('credible_deposit_address', { length: 128 }),
  failureReason:          text('failure_reason'),
  lastError:              text('last_error'),
  createdAt:              timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:              timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('transactions_user_id_idx').on(t.userId),
  index('transactions_status_idx').on(t.status),
  index('transactions_pv_id_idx').on(t.pvTransactionId),
])

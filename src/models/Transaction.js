/**
 * Transaction Entity Model
 * Represents a wallet audit trail record.
 */
class Transaction {
  constructor({ id, user_id, amount, type, description, created_at }) {
    this.id = id; // BIGINT
    this.user_id = user_id; // BIGINT
    this.amount = amount;
    this.type = type; // ENUM: 'SIGNUP', 'PURCHASE', 'EARNING'
    this.description = description;
    this.created_at = created_at;
  }

  toJSON() {
    return {
      id: this.id ? this.id.toString() : this.id,
      user_id: this.user_id ? this.user_id.toString() : this.user_id,
      amount: this.amount,
      type: this.type,
      description: this.description,
      created_at: this.created_at
    };
  }
}

export default Transaction;

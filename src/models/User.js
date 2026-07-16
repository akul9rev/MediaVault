/**
 * User Entity Model
 * Represents a user row in the database.
 */
class User {
  constructor({ id, name, email, password_hash, wallet_balance, created_at, updated_at }) {
    this.id = id; // BIGINT
    this.name = name;
    this.email = email;
    this.password_hash = password_hash;
    this.wallet_balance = wallet_balance !== undefined ? wallet_balance : 100; // default balance of 100 coins
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Return a safe public representation of the user (hiding password)
   */
  toJSON() {
    return {
      id: this.id ? this.id.toString() : this.id, // Convert BigInt to string to avoid JSON errors
      name: this.name,
      email: this.email,
      wallet_balance: this.wallet_balance,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default User;

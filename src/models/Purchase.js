/**
 * Purchase Entity Model
 * Represents an image unlock transaction receipt.
 */
class Purchase {
  constructor({ id, user_id, image_id, created_at, updated_at }) {
    this.id = id; // BIGINT
    this.user_id = user_id; // BIGINT
    this.image_id = image_id; // BIGINT
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toJSON() {
    return {
      id: this.id ? this.id.toString() : this.id,
      user_id: this.user_id ? this.user_id.toString() : this.user_id,
      image_id: this.image_id ? this.image_id.toString() : this.image_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Purchase;

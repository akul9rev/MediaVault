/**
 * Image Entity Model
 * Represents an uploaded image and its metadata in the database.
 */
class Image {
  constructor({ 
    id, 
    owner_id, 
    title, 
    description, 
    original_filename, 
    mime_type, 
    file_size, 
    original_path, 
    preview_path, 
    unlock_price, 
    is_deleted, 
    created_at, 
    updated_at 
  }) {
    this.id = id; // BIGINT
    this.owner_id = owner_id; // BIGINT
    this.title = title;
    this.description = description || null;
    this.original_filename = original_filename;
    this.mime_type = mime_type;
    this.file_size = file_size; // BIGINT
    this.original_path = original_path;
    this.preview_path = preview_path;
    this.unlock_price = unlock_price !== undefined ? unlock_price : 0;
    this.is_deleted = is_deleted !== undefined ? is_deleted : 0; // Soft delete flag
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Return serialization safe representation
   */
  toJSON() {
    return {
      id: this.id ? this.id.toString() : this.id,
      owner_id: this.owner_id ? this.owner_id.toString() : this.owner_id,
      title: this.title,
      description: this.description,
      original_filename: this.original_filename,
      mime_type: this.mime_type,
      file_size: this.file_size ? this.file_size.toString() : this.file_size,
      original_path: this.original_path,
      preview_path: this.preview_path,
      unlock_price: this.unlock_price,
      is_deleted: this.is_deleted,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Image;

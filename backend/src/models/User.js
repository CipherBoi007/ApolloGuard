import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class User {
  static async create(userData) {
    const { email, password, first_name, last_name, role, phone } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, role, created_at
    `;
    
    const values = [email, password_hash, first_name, last_name, role, phone];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getAllByRole(role) {
    const query = 'SELECT id, email, first_name, last_name, role, phone, is_active, created_at FROM users WHERE role = $1';
    const result = await pool.query(query, [role]);
    return result.rows;
  }

  static async update(id, userData) {
    const { first_name, last_name, phone, is_active } = userData;
    const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, is_active = $4
      WHERE id = $5
      RETURNING id, email, first_name, last_name, role, phone, is_active
    `;
    const values = [first_name, last_name, phone, is_active, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}

export default User;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('🔐 Login attempt for email:', email);

      const user = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (user.rows.length === 0) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validUser = user.rows[0];
      
      if (!validUser.is_active) {
        console.log('❌ Account inactive:', email);
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      const isValidPassword = await bcrypt.compare(password, validUser.password_hash);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [validUser.id]
      );

      const token = jwt.sign(
        { id: validUser.id, email: validUser.email, role: validUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      console.log('✅ Login successful for:', email, 'Role:', validUser.role);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: validUser.id,
          email: validUser.email,
          first_name: validUser.first_name,
          last_name: validUser.last_name,
          role: validUser.role,
          phone: validUser.phone
        }
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, role, phone, is_active, created_at, last_login FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('❌ Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ==================== PASSWORD CHANGE FOR ALL ROLES ====================
  
  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      console.log('🔐 Changing password for user:', userId);

      // Validate input
      if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Get current password hash from database
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentHash = userResult.rows[0].password_hash;

      // Verify current password
      const isValid = await bcrypt.compare(current_password, currentHash);

      if (!isValid) {
        console.log('❌ Invalid current password for user:', userId);
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(new_password, 10);

      // Update password in database
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
      );

      console.log('✅ Password changed successfully for user:', userId);
      
      res.json({ 
        message: 'Password changed successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Change password error:', error);
      res.status(500).json({ 
        error: 'Failed to change password',
        details: error.message 
      });
    }
  }

  static async logout(req, res) {
    res.json({ message: 'Logout successful' });
  }
}

export default AuthController;
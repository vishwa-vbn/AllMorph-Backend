const { queryClient: pool } = require("../config/db");

class Setting {

  static async getSettings() {
    const { rows } = await pool.query(`SELECT * FROM settings LIMIT 1`);
    return rows[0];
  }

  static async createDefaultSettings() {
    const { rows } = await pool.query(`
      INSERT INTO settings (general, seo)
      VALUES ('{}', '{}')
      RETURNING *
    `);
    return rows[0];
  }

  static async updateSettings(group, data) {
    const { rows } = await pool.query(`
      UPDATE settings
      SET ${group} = $1
      RETURNING *
    `, [data]);

    return rows[0];
  }
}

module.exports = Setting;
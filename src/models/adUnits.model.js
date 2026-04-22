const { queryClient: pool } = require("../config/db");

class AdProvider {
  static async upsert(provider_key, is_active, config = {}) {
    const { rows } = await pool.query(
      `INSERT INTO ad_providers (provider_key, is_active, config)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider_key) 
       DO UPDATE SET 
         is_active = $2,
         config = $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [provider_key, is_active, config]
    );
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT provider_key, is_active, config FROM ad_providers ORDER BY provider_key`
    );
    return rows;
  }
}

class AdSettings {
  static async getAdSettings() {
    const { rows } = await pool.query(
      `SELECT * FROM ad_settings ORDER BY updated_at DESC LIMIT 1`
    );

    const settings = rows[0] || {
      ad_density: "balanced",
      ad_format: "responsive",
      target_pages: "all",
    };

    const providerRows = await AdProvider.getAll();
    const providers = {};
    providerRows.forEach((row) => {
      providers[row.provider_key] = {
        is_active: row.is_active,
        config: row.config || { global_script: "", placements: [] },
      };
    });

    return {
      ...settings,
      providers,
    };
  }

  static async upsertAdSettings({ ad_density, ad_format, target_pages, providers }) {
    // Global settings
    const existing = await pool.query(
      `SELECT id FROM ad_settings ORDER BY updated_at DESC LIMIT 1`
    );
    const existingId = existing.rows[0]?.id;

    let globalResult;
    if (existingId) {
      const { rows } = await pool.query(
        `UPDATE ad_settings SET
          ad_density = $1,
          ad_format = $2,
          target_pages = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *`,
        [ad_density, ad_format, target_pages, existingId]
      );
      globalResult = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO ad_settings (ad_density, ad_format, target_pages)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [ad_density, ad_format, target_pages]
      );
      globalResult = rows[0];
    }

    // Providers
    if (providers && typeof providers === "object") {
      for (const [provider_key, provData] of Object.entries(providers)) {
        await AdProvider.upsert(
          provider_key,
          provData.is_active ?? false,
          {
            global_script: provData.config?.global_script || "",
            placements: provData.config?.placements || [],
          }
        );
      }
    }

    return await AdSettings.getAdSettings();
  }
}

module.exports = { AdProvider, AdSettings };
const { queryClient: pool } = require("../config/db");

class AdProvider {
  // Default empty config structure for adsterra
  static defaultAdsterraConfig() {
    return {
      popunder: { enabled: false, unit_id: "", script: "" },
      social_bar: { enabled: false, unit_id: "", script: "" },
      banners: [],
      native_banners: [],
      smartlinks: [],
    };
  }

  static async upsert(provider_key, is_active, config = {}) {
    const { rows } = await pool.query(
      `INSERT INTO ad_providers (provider_key, is_active, config)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider_key)
       DO UPDATE SET
         is_active  = $2,
         config     = $3,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [provider_key, is_active, JSON.stringify(config)],
    );
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT provider_key, is_active, config
       FROM ad_providers
       WHERE provider_key = 'adsterra'
       ORDER BY provider_key`,
    );
    return rows;
  }
}

class AdSettings {
  static async getAdSettings() {
    const { rows } = await pool.query(
      `SELECT * FROM ad_settings ORDER BY updated_at DESC LIMIT 1`,
    );

    const settings = rows[0] || {
      ad_density: "balanced",
      ad_format: "responsive",
      target_pages: "all",
    };

    const providerRows = await AdProvider.getAll();
    const providers = {};

    // Seed default if adsterra row doesn't exist yet
    if (providerRows.length === 0) {
      providers.adsterra = {
        is_active: false,
        config: AdProvider.defaultAdsterraConfig(),
      };
    } else {
      providerRows.forEach((row) => {
        providers[row.provider_key] = {
          is_active: row.is_active,
          config: row.config || AdProvider.defaultAdsterraConfig(),
        };
      });
    }

    return { ...settings, providers };
  }

  static async upsertAdSettings({
    ad_density,
    ad_format,
    target_pages,
    providers,
  }) {
    // Upsert global settings row
    const existing = await pool.query(
      `SELECT id FROM ad_settings ORDER BY updated_at DESC LIMIT 1`,
    );
    const existingId = existing.rows[0]?.id;

    let globalResult;
    if (existingId) {
      const { rows } = await pool.query(
        `UPDATE ad_settings SET
           ad_density   = $1,
           ad_format    = $2,
           target_pages = $3,
           updated_at   = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [ad_density, ad_format, target_pages, existingId],
      );
      globalResult = rows[0];
    } else {
      const { rows } = await pool.query(
        `INSERT INTO ad_settings (ad_density, ad_format, target_pages)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [ad_density, ad_format, target_pages],
      );
      globalResult = rows[0];
    }

    // Only process adsterra — ignore any other provider keys
    if (providers?.adsterra) {
      const p = providers.adsterra;
      await AdProvider.upsert("adsterra", p.is_active ?? false, {
        popunder: p.config?.popunder || {
          enabled: false,
          unit_id: "",
          script: "",
        },
        social_bar: p.config?.social_bar || {
          enabled: false,
          unit_id: "",
          script: "",
        },
        banners: Array.isArray(p.config?.banners) ? p.config.banners : [],
        native_banners: Array.isArray(p.config?.native_banners)
          ? p.config.native_banners
          : [],
        smartlinks: Array.isArray(p.config?.smartlinks) ? p.config.smartlinks : [],
      });
    }

    return await AdSettings.getAdSettings();
  }
}

module.exports = { AdProvider, AdSettings };

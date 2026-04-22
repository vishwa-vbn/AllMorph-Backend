const Setting = require("../models/settings.model");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.getSettings();

    if (!settings) {
      settings = await Setting.createDefaultSettings();
    }

    res.json(settings);

  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { group, data } = req.body;

    if (!group || !data) {
      return res.status(400).json({ error: "group and data required" });
    }

    const updated = await Setting.updateSettings(group, data);

    res.json(updated);

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
import { NextApiRequest, NextApiResponse } from "next";
import { PresetService } from "../../../services/presetService";
import db from "../../../utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { id } = await PresetService.createPreset(req.body);
      res.status(200).json({ id });
    } else if (req.method === "GET") {
      const presets = await PresetService.getPresets();
      res.status(200).json({ presets });
    }
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
}

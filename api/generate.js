const KINDS = {
  idea: "Génère 5 idées de projet originales",
  text: "Rédige un texte professionnel",
  strategy: "Crée une stratégie détaillée et concrète",
  identity: "Propose une identité visuelle (noms, slogans, palette, typographies)"
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { kind, prompt } = req.body || {};
  if (!KINDS[kind] || !prompt || prompt.length > 1500) {
    return res.status(400).json({ error: "Demande invalide" });
  }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 1000,
        system: "Tu es l’assistant de LaunchLab. Réponds en français, de façon concrète.",
        messages: [{ role: "user", content: KINDS[kind] + " : " + prompt }]
      })
    });
    if (!r.ok) throw new Error("ia");
    const j = await r.json();
    res.json({ text: j.content.map(c => c.text || "").join("") });
  } catch (e) {
    res.status(502).json({ error: "Échec de la génération" });
  }
}

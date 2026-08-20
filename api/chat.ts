import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    return;
  }

  try {
    const { messages, employeeContext } = req.body;

    const systemPrompt = `Você é o assistente do DomestiCare, um app de gestão de empregados domésticos no Brasil.

Seu papel é ajudar o empregador doméstico com dúvidas sobre:
- Legislação trabalhista para empregados domésticos (CLT, LC 150/2015)
- eSocial doméstico (como usar, prazos, obrigações)
- Cálculos trabalhistas (INSS, FGTS, férias, 13º salário, rescisão)
- Direitos e deveres do empregador e do empregado doméstico
- DAE (Documento de Arrecadação do eSocial)
- Vale-transporte, jornada de trabalho, horas extras
- Boas práticas na gestão doméstica

REGRAS:
- Responda sempre em português do Brasil
- Seja didático e use linguagem simples
- Quando mencionar valores, calcule com base nos dados dos funcionários se disponíveis
- Sempre avise que suas respostas são informativas e não substituem assessoria profissional
- Use formatação com markdown para organizar as respostas
- Seja conciso mas completo

${employeeContext ? `DADOS DOS FUNCIONÁRIOS CADASTRADOS:\n${employeeContext}` : 'Nenhum funcionário cadastrado ainda.'}

Valores de referência 2025:
- Salário mínimo: R$ 1.518,00
- INSS progressivo: 7,5% (até R$ 1.518), 9% (até R$ 2.793,88), 12% (até R$ 4.190,83), 14% (até R$ 8.157,41)
- FGTS: 8% + 3,2% compensatório (doméstico)
- INSS patronal doméstico: 8%
- GILRAT: 0,8%
- Vale-transporte: desconto máximo 6% do salário`;

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      let errorMsg = 'Erro na API do Gemini';
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorMsg;
      } catch {}
      res.status(geminiResponse.status).json({ error: errorMsg });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = (geminiResponse.body as any).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          } catch {}
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }
}

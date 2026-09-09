import { Router } from 'express';
import { z } from 'zod';
import { AppError, success } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';

const router = Router();

const chatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  context: z
    .object({
      destination: z.string().max(100).optional(),
      people: z.number().int().min(1).max(50).optional(),
      diet: z.string().max(200).optional(),
    })
    .optional(),
});

router.post('/chat', async (req, res, next) => {
  try {
    const { message, context } = chatSchema.parse(req.body);

    if (!env.agentRouterApiKey) {
      throw new AppError('AI provider is not configured', 503, 'AI_PROVIDER_NOT_CONFIGURED');
    }

    const contextText = context
      ? `\nCurrent preferences: destination=${context.destination || 'any'}, people=${context.people || 'unspecified'}, diet=${context.diet || 'any'}.`
      : '';
    const response = await fetch('https://agentrouter.org/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.agentRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.agentRouterModel,
        messages: [
          {
            role: 'system',
            content:
              'You are ChowSmart, a concise and practical food planning assistant. Help users discover dishes, plan menus, and adapt suggestions to dietary preferences. Do not claim to know live restaurant availability or medical facts.',
          },
          { role: 'user', content: `${message}${contextText}` },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('AgentRouter request failed', response.status, details);
      throw new AppError('The AI provider could not answer right now', 502, 'AI_PROVIDER_ERROR');
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const responseMessage = payload.choices?.[0]?.message?.content?.trim();
    if (!responseMessage) {
      throw new AppError('The AI provider returned an empty response', 502, 'AI_EMPTY_RESPONSE');
    }

    return success(res, { message: responseMessage });
  } catch (error) {
    return next(error);
  }
});

export default router;
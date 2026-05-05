import { describe, it, expect, vi } from 'vitest';
import { handleInteractionCreate } from './interaction-create.listener.js';
import { makeInteraction } from '@fixtures/make-interaction.js';
import type { SlashCommand } from '../types/slash-command.js';

const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
const ctx = { config: {} as never, logger: logger as never, voice: {} as never };

function makeCommand(name: string, fn: SlashCommand['execute']): SlashCommand {
  return { data: { name } as never, execute: fn };
}

describe('handleInteractionCreate', () => {
  it('runs the matching command', async () => {
    const exec = vi.fn().mockResolvedValue(undefined);
    const commands = new Map<string, SlashCommand>([['moveout', makeCommand('moveout', exec)]]);
    const { interaction } = makeInteraction({ commandName: 'moveout' });
    await handleInteractionCreate(interaction, commands, ctx);
    expect(exec).toHaveBeenCalled();
  });

  it('replies ephemerally for an unknown command', async () => {
    const commands = new Map<string, SlashCommand>();
    const { interaction, reply } = makeInteraction({ commandName: 'ghost' });
    await handleInteractionCreate(interaction, commands, ctx);
    expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });

  it('logs and replies ephemerally when the command throws', async () => {
    logger.error.mockReset();
    const exec = vi.fn().mockRejectedValue(new Error('boom'));
    const commands = new Map<string, SlashCommand>([['moveout', makeCommand('moveout', exec)]]);
    const { interaction, reply } = makeInteraction({ commandName: 'moveout' });
    await handleInteractionCreate(interaction, commands, ctx);
    expect(logger.error).toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});

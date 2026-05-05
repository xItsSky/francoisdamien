import type { ChatInputCommandInteraction, User } from 'discord.js';
import { vi } from 'vitest';

export interface FakeTargetMember {
  displayName?: string;
  voice?: { channel: unknown; disconnect: () => Promise<unknown> };
}

export interface FakeInteractionOptions {
  commandName?: string;
  targetUser?: Pick<User, 'id' | 'username'>;
  targetMember?: FakeTargetMember;
  guildId?: string | null;
}

export function makeInteraction(opts: FakeInteractionOptions = {}) {
  const targetUser = opts.targetUser ?? { id: '333333333333333333', username: 'bob' };
  const member = opts.targetMember ?? {
    displayName: 'bob',
    voice: { channel: null, disconnect: vi.fn().mockResolvedValue(null) },
  };
  const reply = vi.fn().mockResolvedValue(null);
  const followUp = vi.fn().mockResolvedValue(null);
  const fetchMember = vi.fn().mockResolvedValue(member);

  const interaction = {
    commandName: opts.commandName ?? 'moveout',
    isChatInputCommand: () => true,
    options: {
      getUser: vi.fn().mockReturnValue(targetUser),
    },
    guild: opts.guildId === null ? null : {
      id: opts.guildId ?? '222222222222222222',
      members: { fetch: fetchMember },
    },
    user: { id: '999999999999999999' },
    replied: false,
    deferred: false,
    reply,
    followUp,
  } as unknown as ChatInputCommandInteraction;

  return { interaction, reply, followUp, fetchMember, member };
}

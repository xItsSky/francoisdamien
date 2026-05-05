import { describe, it, expect, vi } from 'vitest';
import { handleMessageCreate } from './message-create.listener.js';
import { makeMessage } from '@fixtures/make-message.js';
import { makeVoiceChannel } from '@fixtures/make-voice-channel.js';

const greeter = { replyToHello: vi.fn().mockResolvedValue(undefined) };
const sayNo = { maybeReact: vi.fn().mockResolvedValue(undefined) };

describe('handleMessageCreate', () => {
  it('skips messages from bots', async () => {
    greeter.replyToHello.mockReset();
    sayNo.maybeReact.mockReset();
    const { message } = makeMessage({ authorIsBot: true, content: 'hello' });
    await handleMessageCreate(message, greeter as never, sayNo as never);
    expect(greeter.replyToHello).not.toHaveBeenCalled();
    expect(sayNo.maybeReact).not.toHaveBeenCalled();
  });

  it('forwards human messages to greeter and sayNo', async () => {
    greeter.replyToHello.mockReset();
    sayNo.maybeReact.mockReset();
    const { message } = makeMessage({ content: 'hello no', voiceChannel: makeVoiceChannel() });
    await handleMessageCreate(message, greeter as never, sayNo as never);
    expect(greeter.replyToHello).toHaveBeenCalledWith(message);
    expect(sayNo.maybeReact).toHaveBeenCalledWith(message);
  });
});

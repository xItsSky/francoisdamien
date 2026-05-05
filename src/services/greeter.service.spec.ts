import { describe, it, expect } from 'vitest';
import { buildGreeter } from './greeter.service.js';
import { makeMessage } from '@fixtures/make-message.js';

describe('greeter.replyToHello', () => {
  it('replies when the message contains a hello word (case-insensitive)', async () => {
    const greeter = buildGreeter(['hello', 'salut']);
    const { message, reply } = makeMessage({ content: 'Hey, HELLO everyone' });
    await greeter.replyToHello(message);
    expect(reply).toHaveBeenCalledWith(`Ces m'sieurs dames, booonjour !`);
  });

  it('does not reply when no hello word matches', async () => {
    const greeter = buildGreeter(['hello']);
    const { message, reply } = makeMessage({ content: 'just chatting' });
    await greeter.replyToHello(message);
    expect(reply).not.toHaveBeenCalled();
  });

  it('matches words even when surrounded by punctuation', async () => {
    const greeter = buildGreeter(['hi']);
    const { message, reply } = makeMessage({ content: 'Hi!' });
    await greeter.replyToHello(message);
    expect(reply).toHaveBeenCalled();
  });
});

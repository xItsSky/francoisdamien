import { describe, it, expect } from 'vitest';
import { parseKeywords } from './keywords.js';

describe('parseKeywords', () => {
  it('splits a comma-separated string and lowercases each entry', () => {
    expect(parseKeywords('Hello,Hi,Hey')).toEqual(['hello', 'hi', 'hey']);
  });

  it('trims whitespace around each entry', () => {
    expect(parseKeywords(' hello , hi ,  hey  ')).toEqual(['hello', 'hi', 'hey']);
  });

  it('drops empty entries from trailing or repeated commas', () => {
    expect(parseKeywords('hello,,hi,')).toEqual(['hello', 'hi']);
  });

  it('returns an empty array when the input is empty or whitespace only', () => {
    expect(parseKeywords('')).toEqual([]);
    expect(parseKeywords('   ')).toEqual([]);
  });
});

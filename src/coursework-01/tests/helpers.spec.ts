import wildcardMatcher from '../src/helpers/wildcard-matcher';

describe('Implementation of wildcard matcher - checks if string with delimiters matches with provided wildcard template', () => {
  it('Must pass strings with single wildcard symbol', () => {
    expect(wildcardMatcher('foo.bar.bla', 'foo.bar.*', '.')).toBe(true);
    expect(wildcardMatcher('foo.bar.buzz', 'foo.bar.*', '.')).toBe(true);
    expect(wildcardMatcher('foo.bla.buzz', 'foo.bar.*', '.')).toBe(false);
    expect(wildcardMatcher('foo.bar', 'foo.bar.*', '.')).toBe(false);

    expect(wildcardMatcher('foo.bla.bla', 'foo.*.bla', '.')).toBe(true);
    expect(wildcardMatcher('foo.fizz.bla', 'foo.*.bla', '.')).toBe(true);
    expect(wildcardMatcher('foo.fizz.bar', 'foo.*.bla', '.')).toBe(false);

    expect(wildcardMatcher('bar.bar.bla', '*.bar.bla', '.')).toBe(true);
    expect(wildcardMatcher('foo.bar.bla', '*.bar.bla', '.')).toBe(true);
    expect(wildcardMatcher('foo.fizz.bla', '*.bar.bla', '.')).toBe(false);

    expect(wildcardMatcher('foo.bar.bla', '*.*.bla', '.')).toBe(true);
    expect(wildcardMatcher('bla.bar.bla', '*.bar.*', '.')).toBe(true);
    expect(wildcardMatcher('bla.bar.bla', 'foo.*.*', '.')).toBe(false);

    expect(wildcardMatcher('fizz.bla.buzz', '*.*.*', '.')).toBe(true);
    expect(wildcardMatcher('bla.fizz.foo', '*.*.*', '.')).toBe(true);
    expect(wildcardMatcher('bla.fizz', '*.*.*', '.')).toBe(false);
  });

  it('Must pass strings with multi-level wildcard symbol (zero or more)', () => {
    expect(wildcardMatcher('foo', '**', '.')).toBe(true);
    expect(wildcardMatcher('bar', '**', '.')).toBe(true);
    expect(wildcardMatcher('foo.bar', '**', '.')).toBe(true);

    expect(wildcardMatcher('foo', 'foo.**', '.')).toBe(true);
    expect(wildcardMatcher('foo.bar', 'foo.**', '.')).toBe(true);
    expect(wildcardMatcher('foo.bar.bla', 'foo.**', '.')).toBe(true);
    expect(wildcardMatcher('fizz.bar.bla', 'foo.**', '.')).toBe(false);

    expect(wildcardMatcher('foo', '**.foo', '.')).toBe(true);
    expect(wildcardMatcher('bar.foo', '**.foo', '.')).toBe(true);
    expect(wildcardMatcher('bar.foo.bla', '**.foo', '.')).toBe(false);

    expect(wildcardMatcher('foo.bar', 'foo.**.bar', '.')).toBe(true);
    expect(wildcardMatcher('foo.bla.bar', 'foo.**.bar', '.')).toBe(true);
    expect(wildcardMatcher('foo.bla.fizz.bar', 'foo.**.bar', '.')).toBe(true);
    expect(wildcardMatcher('foo.bla.fizz', 'foo.**.bar', '.')).toBe(false);
    expect(wildcardMatcher('foo.bla.fizz.bar.buzz', 'foo.**.bar', '.')).toBe(false);
  });

  it('Must pass strings with mixed wildcard symbols (and other delimiter kinds)', () => {
    expect(wildcardMatcher('foo:bla:fizz:bar', 'foo:*:fizz:**:bar', ':')).toBe(true);
    expect(wildcardMatcher('foo:bla:fizz:buzz:bar', 'foo:*:fizz:**:bar', ':')).toBe(true);
    expect(wildcardMatcher('foo:bla:fizz:buzz:bar.wtf', 'foo:*:fizz:**:bar', ':')).toBe(false);
  });

  it('Must pass strict matching strings', () => {
    expect(wildcardMatcher('foo', 'foo', ':')).toBe(true);
    expect(wildcardMatcher('foo:bla', 'foo:bla', ':')).toBe(true);
    expect(wildcardMatcher('foo:bla:bar', 'foo:bla:bar', ':')).toBe(true);
  });
});

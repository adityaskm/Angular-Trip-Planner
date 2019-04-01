import { DurationFormatterPipe } from './duration-formatter.pipe';

describe('DurationFormatterPipe', () => {
  it('create an instance', () => {
    const pipe = new DurationFormatterPipe();
    expect(pipe).toBeTruthy();
  });
});

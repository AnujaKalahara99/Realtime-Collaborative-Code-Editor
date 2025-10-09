import handleRollback from '../handlers/rollback.js';

describe('handleRollback', () => {
  it('should be a function', () => {
    expect(typeof handleRollback).toBe('function');
  });
});

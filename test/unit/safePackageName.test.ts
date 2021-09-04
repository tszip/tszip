describe('utils | safePackageName', () => {
  it('should generate safe package name', async () => {
    const { safePackageName } = await import('../../src/utils');
    expect(safePackageName('@babel/core')).toBe('core');
    expect(safePackageName('react')).toBe('react');
    expect(safePackageName('react-dom')).toBe('react-dom');
  });
});

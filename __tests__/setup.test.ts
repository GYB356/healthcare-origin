describe('Test Setup', () => {
  it('should work with basic assertions', () => {
    expect(true).toBe(true);
  });

  it('should work with async/await', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('should work with mocks', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
}); 
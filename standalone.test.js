/**
 * Simple standalone test with no external dependencies
 */

describe('Standalone tests', () => {
  test('Addition works correctly', () => {
    expect(1 + 2).toBe(3);
  });
  
  test('String concatenation works correctly', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });
  
  test('Arrays can be manipulated', () => {
    const arr = [1, 2, 3];
    arr.push(4);
    expect(arr).toHaveLength(4);
    expect(arr).toContain(4);
  });
  
  test('Objects can be manipulated', () => {
    const obj = { name: 'John', age: 30 };
    obj.profession = 'developer';
    expect(obj).toHaveProperty('profession', 'developer');
  });
}); 
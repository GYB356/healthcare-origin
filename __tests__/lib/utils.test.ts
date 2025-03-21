import {
  cn,
  formatDate,
  formatTime,
  generateTimeSlots,
  getErrorMessage,
  isValidEmail
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(cn('class1', null, 'class2')).toBe('class1 class2')
      expect(cn('class1', false && 'class2')).toBe('class1')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01')
      expect(formatDate(date)).toBe('January 1, 2024')
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const time = '14:30'
      expect(formatTime(time)).toBe('2:30 PM')
    })
  })

  describe('generateTimeSlots', () => {
    it('should generate correct time slots', () => {
      const slots = generateTimeSlots('09:00', '11:00', 30)
      expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30'])
    })
  })

  describe('getErrorMessage', () => {
    it('should handle string errors', () => {
      expect(getErrorMessage('Error message')).toBe('Error message')
    })

    it('should handle error objects', () => {
      const error = new Error('Error message')
      expect(getErrorMessage(error)).toBe('Error message')
    })

    it('should handle unknown errors', () => {
      expect(getErrorMessage({})).toBe('Something went wrong')
    })
  })

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
}) 
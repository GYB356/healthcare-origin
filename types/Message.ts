/**
 * Message interface definition
 */
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  readTimestamp?: Date;
  attachments?: string[];
}

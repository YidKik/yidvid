// Utility for encrypting sensitive data stored in localStorage/sessionStorage
// This provides additional security layer for client-side data storage

interface EncryptedData {
  data: string;
  timestamp: number;
  expiresAt?: number;
}

class StorageEncryption {
  private key: string;

  constructor() {
    // Generate a session-specific key based on browser fingerprint
    this.key = this.generateSessionKey();
  }

  private generateSessionKey(): string {
    // Create a simple key based on browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getDate() // Changes daily for key rotation
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }

  private simpleEncrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = this.key.charCodeAt(i % this.key.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    return btoa(result);
  }

  private simpleDecrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const char = decoded.charCodeAt(i);
        const keyChar = this.key.charCodeAt(i % this.key.length);
        result += String.fromCharCode(char ^ keyChar);
      }
      return result;
    } catch {
      return '';
    }
  }

  setSecureItem(key: string, value: any, expirationMinutes?: number): boolean {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = this.simpleEncrypt(stringValue);
      
      const encryptedData: EncryptedData = {
        data: encrypted,
        timestamp: Date.now(),
        expiresAt: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : undefined
      };

      localStorage.setItem(`secure_${key}`, JSON.stringify(encryptedData));
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  getSecureItem(key: string): any {
    try {
      const stored = localStorage.getItem(`secure_${key}`);
      if (!stored) return null;

      const encryptedData: EncryptedData = JSON.parse(stored);
      
      // Check expiration
      if (encryptedData.expiresAt && Date.now() > encryptedData.expiresAt) {
        this.removeSecureItem(key);
        return null;
      }

      const decrypted = this.simpleDecrypt(encryptedData.data);
      if (!decrypted) return null;

      // Try to parse as JSON, return as string if parsing fails
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  removeSecureItem(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }

  clearExpiredItems(): void {
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const encryptedData: EncryptedData = JSON.parse(stored);
            if (encryptedData.expiresAt && now > encryptedData.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Clean up all secure storage items
  clearAllSecureItems(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Export singleton instance
export const secureStorage = new StorageEncryption();

// Auto-cleanup expired items every 5 minutes
setInterval(() => {
  secureStorage.clearExpiredItems();
}, 5 * 60 * 1000);
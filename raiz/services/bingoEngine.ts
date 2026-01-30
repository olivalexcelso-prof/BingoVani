
import { Card } from '../types';

export class BingoEngine {
  static generateCard(userId: string, gameId: string): Card {
    const numbers: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    const used = new Set<number>();
    
    // Fill 15 random numbers in 25 cells
    const positions = Array.from({ length: 25 }, (_, i) => i);
    const selectedPositions = this.shuffle(positions).slice(0, 15);
    
    selectedPositions.forEach(pos => {
      const r = Math.floor(pos / 5);
      const c = pos % 5;
      let num;
      // Standard bingo column ranges
      const min = c * 15 + 1;
      const max = (c + 1) * 15;
      
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (used.has(num));
      
      used.add(num);
      numbers[r][c] = num;
    });

    return {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      gameId,
      numbers,
      marked: Array.from({ length: 5 }, () => Array(5).fill(false))
    };
  }

  static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static drawNumber(drawn: number[]): number {
    const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !drawn.includes(n));
    if (available.length === 0) return 0;
    return available[Math.floor(Math.random() * available.length)];
  }

  static checkQuadra(card: Card, drawn: number[]): boolean {
    // Check if 4 numbers are marked (standard spec)
    let count = 0;
    card.numbers.forEach((row, r) => {
      row.forEach((num, c) => {
        if (num !== 0 && drawn.includes(num)) count++;
      });
    });
    return count >= 4;
  }

  static checkLinha(card: Card, drawn: number[]): boolean {
    // Check if one full horizontal line is marked
    return card.numbers.some(row => {
      const rowNums = row.filter(n => n !== 0);
      return rowNums.length > 0 && rowNums.every(n => drawn.includes(n));
    });
  }

  static checkBingo(card: Card, drawn: number[]): boolean {
    // Check if all 15 numbers are marked
    let total = 0;
    let marked = 0;
    card.numbers.forEach(row => {
      row.forEach(num => {
        if (num !== 0) {
          total++;
          if (drawn.includes(num)) marked++;
        }
      });
    });
    return total > 0 && total === marked;
  }
}

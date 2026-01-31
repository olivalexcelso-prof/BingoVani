
import { GameStatus, GameState, ScheduledGame } from '../types';
import { tts } from './TTSService';

export class GameEngine {
  private static instance: GameEngine;
  private state: GameState;
  private observers: ((state: GameState) => void)[] = [];
  private drawInterval: any = null;
  private schedulerInterval: any = null;
  private availableNumbers: number[] = [];

  private constructor() {
    this.state = this.getInitialState();
    this.startScheduler();
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  public getState() {
    return this.state;
  }

  private getInitialState(): GameState {
    return {
      status: GameStatus.SCHEDULED,
      drawnNumbers: [],
      currentBall: null,
      prizes: { quadra: 10, linha: 25, bingo: 100, acumulado: 500 },
      currentPrizeType: 'QUADRA',
      ballCount: 0,
      nextGameTime: null,
      currentSeriesPrice: 3.0
    };
  }

  private startScheduler() {
    if (this.schedulerInterval) clearInterval(this.schedulerInterval);
    this.schedulerInterval = setInterval(() => {
      const now = new Date();
      const currentHHmm = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
      
      if (this.state.status === GameStatus.SCHEDULED && this.state.nextGameTime === currentHHmm) {
        this.prepareGame();
      }
    }, 1000);
  }

  public updatePrizes(newPrizes: any) {
    this.state.prizes = { ...this.state.prizes, ...newPrizes };
    this.notify();
  }

  private prepareGame() {
    this.state.status = GameStatus.WAITING;
    this.notify();
    setTimeout(() => {
      if (this.state.status === GameStatus.WAITING) {
        this.startGame();
      }
    }, 30000);
  }

  public subscribe(fn: (state: GameState) => void) {
    this.observers.push(fn);
    fn(this.state);
    return () => {
      this.observers = this.observers.filter(o => o !== fn);
    };
  }

  private notify() {
    this.observers.forEach(fn => fn({ ...this.state }));
  }

  public setNextScheduledGame(game: ScheduledGame | null) {
    if (game) {
      this.state.nextGameTime = game.time;
      this.state.currentSeriesPrice = game.price;
    } else {
      this.state.nextGameTime = null;
    }
    this.notify();
  }

  public startGame() {
    if (this.state.status === GameStatus.PLAYING) return;
    this.state.status = GameStatus.PLAYING;
    this.state.drawnNumbers = [];
    this.state.ballCount = 0;
    this.state.currentPrizeType = 'QUADRA';
    this.availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    this.notify();
    this.startDrawLoop();
  }

  private startDrawLoop() {
    if (this.drawInterval) clearInterval(this.drawInterval);
    this.drawInterval = setInterval(() => {
      if (this.availableNumbers.length === 0 || this.state.status !== GameStatus.PLAYING) {
        this.stopGame();
        return;
      }
      const index = Math.floor(Math.random() * this.availableNumbers.length);
      const ball = this.availableNumbers.splice(index, 1)[0];
      this.state.currentBall = ball;
      this.state.drawnNumbers.push(ball);
      this.state.ballCount++;
      tts.speak(`Bola ${ball}`);
      if (this.state.ballCount === 10) this.state.currentPrizeType = 'LINHA';
      if (this.state.ballCount === 25) this.state.currentPrizeType = 'BINGO';
      this.notify();
      if (this.state.ballCount >= 90) this.stopGame();
    }, 4000);
  }

  public stopGame() {
    if (this.drawInterval) clearInterval(this.drawInterval);
    this.state.status = GameStatus.SCHEDULED;
    this.state.currentBall = null;
    this.notify();
  }
}

export const engine = GameEngine.getInstance();

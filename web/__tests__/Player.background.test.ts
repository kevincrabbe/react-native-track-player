import { Player } from '../TrackPlayer/Player';
import type { Track } from '../../src/interfaces';

// We need to access protected members for testing, so create a test subclass
class TestablePlayer extends Player {
  // Expose protected members for testing
  get bgElement() {
    return this.backgroundElement;
  }
  set bgElement(el: HTMLAudioElement | undefined) {
    this.backgroundElement = el;
  }

  get internalPlayer() {
    return this.player;
  }
  set internalPlayer(p: shaka.Player | undefined) {
    this.player = p;
  }

  get internalElement() {
    return this.element;
  }
  set internalElement(el: HTMLMediaElement | undefined) {
    this.element = el;
  }

  // Expose protected methods
  public startBg(track: Track) {
    return this.startBackground(track);
  }

  public stopBg() {
    return this.stopBackground();
  }
}

// Mock Audio constructor
const mockAudioInstances: MockAudioElement[] = [];

interface MockAudioElement {
  src: string;
  loop: boolean;
  volume: number;
  currentTime: number;
  play: jest.Mock;
  pause: jest.Mock;
  load: jest.Mock;
  removeAttribute: jest.Mock;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  _eventListeners: Record<string, Array<() => void>>;
}

function createMockAudio(src?: string): MockAudioElement {
  const listeners: Record<string, Array<() => void>> = {};
  const mock: MockAudioElement = {
    src: src || '',
    loop: false,
    volume: 1,
    currentTime: 0,
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
    removeAttribute: jest.fn(),
    addEventListener: jest.fn((event: string, handler: () => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    }),
    removeEventListener: jest.fn((event: string, handler: () => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
    }),
    _eventListeners: listeners,
  };
  return mock;
}

// Override global Audio constructor
const originalAudio = globalThis.Audio;
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Audio = jest.fn((src?: string) => {
    const mock = createMockAudio(src);
    mockAudioInstances.push(mock);
    return mock;
  });
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Audio = originalAudio;
});

beforeEach(() => {
  mockAudioInstances.length = 0;
  jest.clearAllMocks();
});

function makeTrack(overrides: Partial<Track> = {}): Track {
  return {
    url: 'https://example.com/main.mp3',
    title: 'Test Track',
    ...overrides,
  } as Track;
}

function at(index: number): MockAudioElement {
  const el = mockAudioInstances[index];
  if (!el) throw new Error(`No mock audio element at index ${index}`);
  return el;
}

describe('Player - Background Audio', () => {
  describe('startBackground', () => {
    it('should not create background element when track has no backgroundUrl', () => {
      const player = new TestablePlayer();
      player.startBg(makeTrack());
      expect(mockAudioInstances).toHaveLength(0);
      expect(player.bgElement).toBeUndefined();
    });

    it('should create background element with correct properties', () => {
      const player = new TestablePlayer();
      player.startBg(
        makeTrack({
          backgroundUrl: 'https://example.com/bg.mp3',
          backgroundVolume: 0.5,
        })
      );

      expect(mockAudioInstances).toHaveLength(1);
      expect(at(0).loop).toBe(true);
      expect(at(0).volume).toBe(0.5);
    });

    it('should default backgroundVolume to 1.0 when not specified', () => {
      const player = new TestablePlayer();
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      expect(at(0).volume).toBe(1);
    });

    it('should clamp backgroundVolume to [0, 1]', () => {
      const player = new TestablePlayer();

      player.startBg(
        makeTrack({
          backgroundUrl: 'https://example.com/bg.mp3',
          backgroundVolume: 2.5,
        })
      );
      expect(at(0).volume).toBe(1);

      player.startBg(
        makeTrack({
          backgroundUrl: 'https://example.com/bg.mp3',
          backgroundVolume: -0.5,
        })
      );
      expect(at(1).volume).toBe(0);
    });

    it('should auto-play background when playWhenReady is true', () => {
      const player = new TestablePlayer();
      player.playWhenReady = true;
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      expect(at(0).play).toHaveBeenCalled();
    });

    it('should not auto-play background when playWhenReady is false', () => {
      const player = new TestablePlayer();
      player.playWhenReady = false;
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      expect(at(0).play).not.toHaveBeenCalled();
    });

    it('should register error event listener', () => {
      const player = new TestablePlayer();
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      expect(at(0).addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });

    it('should stop previous background before starting new one', () => {
      const player = new TestablePlayer();

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg1.mp3' })
      );
      const first = at(0);

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg2.mp3' })
      );

      expect(first.pause).toHaveBeenCalled();
      expect(first.removeAttribute).toHaveBeenCalledWith('src');
      expect(first.load).toHaveBeenCalled();
      expect(mockAudioInstances).toHaveLength(2);
    });

    it('should stop background on error event', () => {
      const player = new TestablePlayer();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      const errorHandlers = at(0)._eventListeners.error ?? [];
      const handler = errorHandlers[0];
      expect(handler).toBeDefined();
      handler!();

      expect(warnSpy).toHaveBeenCalledWith(
        'Background audio failed to load:',
        'https://example.com/bg.mp3'
      );
      expect(player.bgElement).toBeUndefined();
      warnSpy.mockRestore();
    });
  });

  describe('stopBackground', () => {
    it('should be a no-op when no background element exists', () => {
      const player = new TestablePlayer();
      player.stopBg();
      expect(player.bgElement).toBeUndefined();
    });

    it('should pause and clean up the background element', () => {
      const player = new TestablePlayer();
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      const bgEl = at(0);
      player.stopBg();

      expect(bgEl.pause).toHaveBeenCalled();
      expect(bgEl.removeAttribute).toHaveBeenCalledWith('src');
      expect(bgEl.load).toHaveBeenCalled();
      expect(player.bgElement).toBeUndefined();
    });

    it('should use removeAttribute instead of setting src to empty string', () => {
      const player = new TestablePlayer();
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      const bgEl = at(0);
      player.stopBg();

      expect(bgEl.removeAttribute).toHaveBeenCalledWith('src');
    });
  });

  describe('setBackgroundVolume', () => {
    it('should throw SetupNotCalledError if player not initialized', () => {
      const player = new TestablePlayer();
      expect(() => player.setBackgroundVolume(0.5)).toThrow(
        'You must call `setupPlayer` prior to interacting with the player.'
      );
    });

    it('should set volume on existing background element', () => {
      const player = new TestablePlayer();
      player.internalPlayer = {} as unknown as shaka.Player;
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      player.setBackgroundVolume(0.3);
      expect(at(0).volume).toBe(0.3);
    });

    it('should clamp volume to [0, 1]', () => {
      const player = new TestablePlayer();
      player.internalPlayer = {} as unknown as shaka.Player;
      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      player.setBackgroundVolume(1.5);
      expect(at(0).volume).toBe(1);

      player.setBackgroundVolume(-0.5);
      expect(at(0).volume).toBe(0);
    });

    it('should be a no-op when no background element exists', () => {
      const player = new TestablePlayer();
      player.internalPlayer = {} as unknown as shaka.Player;
      player.setBackgroundVolume(0.5);
    });
  });

  describe('getBackgroundVolume', () => {
    it('should return background element volume when background is playing', () => {
      const player = new TestablePlayer();
      player.internalPlayer = {} as unknown as shaka.Player;
      player.startBg(
        makeTrack({
          backgroundUrl: 'https://example.com/bg.mp3',
          backgroundVolume: 0.5,
        })
      );

      expect(player.getBackgroundVolume()).toBe(0.5);
    });

    it('should return current track backgroundVolume when no background element', () => {
      const player = new TestablePlayer();
      player.internalPlayer = {} as unknown as shaka.Player;
      player.current = makeTrack({ backgroundVolume: 0.7 });

      expect(player.getBackgroundVolume()).toBe(0.7);
    });

    it('should return 1.0 when no background element and no current track', () => {
      const player = new TestablePlayer();
      player.internalPlayer = {} as unknown as shaka.Player;

      expect(player.getBackgroundVolume()).toBe(1.0);
    });

    it('should throw SetupNotCalledError if player not initialized', () => {
      const player = new TestablePlayer();
      expect(() => player.getBackgroundVolume()).toThrow();
    });
  });

  describe('play/pause sync', () => {
    it('should play background element on play()', () => {
      const player = new TestablePlayer();
      player.internalElement = {
        play: jest.fn().mockResolvedValue(undefined),
      } as unknown as HTMLMediaElement;

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      const bgEl = at(0);
      bgEl.play.mockClear();

      player.play();
      expect(bgEl.play).toHaveBeenCalled();
    });

    it('should pause background element on pause()', () => {
      const player = new TestablePlayer();
      player.internalElement = {
        pause: jest.fn(),
      } as unknown as HTMLMediaElement;

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      player.pause();
      expect(at(0).pause).toHaveBeenCalled();
    });
  });

  describe('seek resets background', () => {
    it('should reset background currentTime to 0 on seekTo', () => {
      const player = new TestablePlayer();
      player.internalElement = {
        currentTime: 0,
      } as unknown as HTMLMediaElement;

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      at(0).currentTime = 30;
      player.seekTo(60);
      expect(at(0).currentTime).toBe(0);
    });

    it('should reset background currentTime to 0 on seekBy', () => {
      const player = new TestablePlayer();
      player.internalElement = {
        currentTime: 10,
      } as unknown as HTMLMediaElement;

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      at(0).currentTime = 15;
      player.seekBy(10);
      expect(at(0).currentTime).toBe(0);
    });
  });

  describe('load/stop lifecycle', () => {
    it('should stop background on stop()', async () => {
      const player = new TestablePlayer();
      const mockShakaPlayer = {
        unload: jest.fn().mockResolvedValue(undefined),
      };
      player.internalPlayer = mockShakaPlayer as unknown as shaka.Player;

      player.startBg(
        makeTrack({ backgroundUrl: 'https://example.com/bg.mp3' })
      );

      const bgEl = at(0);
      await player.stop();

      expect(bgEl.pause).toHaveBeenCalled();
      expect(player.bgElement).toBeUndefined();
    });

    it('should start new background on load()', async () => {
      const player = new TestablePlayer();
      const mockShakaPlayer = {
        load: jest.fn().mockResolvedValue(undefined),
      };
      player.internalPlayer = mockShakaPlayer as unknown as shaka.Player;

      await player.load(
        makeTrack({
          backgroundUrl: 'https://example.com/bg.mp3',
          backgroundVolume: 0.7,
        })
      );

      expect(mockAudioInstances).toHaveLength(1);
      expect(at(0).volume).toBe(0.7);
    });

    it('should stop previous background when loading new track', async () => {
      const player = new TestablePlayer();
      const mockShakaPlayer = {
        load: jest.fn().mockResolvedValue(undefined),
      };
      player.internalPlayer = mockShakaPlayer as unknown as shaka.Player;

      await player.load(
        makeTrack({ backgroundUrl: 'https://example.com/bg1.mp3' })
      );
      const first = at(0);

      await player.load(
        makeTrack({ backgroundUrl: 'https://example.com/bg2.mp3' })
      );

      expect(first.pause).toHaveBeenCalled();
      expect(mockAudioInstances).toHaveLength(2);
    });
  });
});

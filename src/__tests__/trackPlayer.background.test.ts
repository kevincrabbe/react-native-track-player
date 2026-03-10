jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  AppRegistry: { registerHeadlessTask: jest.fn() },
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
  })),
}));

jest.mock('../NativeTrackPlayer', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    load: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    setBackgroundVolume: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    seekBy: jest.fn().mockResolvedValue(undefined),
    add: jest.fn().mockResolvedValue(undefined),
    getConstants: () => ({
      CAPABILITY_PLAY: 0,
      CAPABILITY_PAUSE: 1,
      STATE_NONE: 'STATE_NONE',
      STATE_PLAYING: 'STATE_PLAYING',
      REPEAT_OFF: 0,
      REPEAT_TRACK: 1,
      REPEAT_QUEUE: 2,
    }),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
  Constants: {
    CAPABILITY_PLAY: 0,
    CAPABILITY_PAUSE: 1,
    STATE_NONE: 'STATE_NONE',
    STATE_PLAYING: 'STATE_PLAYING',
    REPEAT_OFF: 0,
    REPEAT_TRACK: 1,
    REPEAT_QUEUE: 2,
  },
}));

jest.mock('../resolveAssetSource', () => ({
  __esModule: true,
  default: jest.fn((id: number) => ({ uri: `asset://${id}` })),
}));

import * as TrackPlayer from '../trackPlayer';
import NativeModule from '../NativeTrackPlayer';
import type { AddTrack } from '../interfaces';

const mockNative = NativeModule as jest.Mocked<typeof NativeModule>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TrackPlayer - Background Audio API', () => {
  describe('setBackgroundVolume', () => {
    it('should call native setBackgroundVolume', async () => {
      await TrackPlayer.setBackgroundVolume(0.5);
      expect(mockNative.setBackgroundVolume).toHaveBeenCalledWith(0.5);
    });

    it('should pass through the volume value without modification', async () => {
      await TrackPlayer.setBackgroundVolume(0);
      expect(mockNative.setBackgroundVolume).toHaveBeenCalledWith(0);

      await TrackPlayer.setBackgroundVolume(1);
      expect(mockNative.setBackgroundVolume).toHaveBeenCalledWith(1);
    });
  });

  describe('resolveTrackAssets with backgroundUrl', () => {
    it('should resolve backgroundUrl as string', async () => {
      const track: AddTrack = {
        url: 'https://example.com/main.mp3',
        backgroundUrl: 'https://example.com/bg.mp3',
        title: 'Test',
        artist: 'Test Artist',
      };

      await TrackPlayer.load(track);
      const resolvedTrack = (mockNative.load as jest.Mock).mock.calls[0][0];
      expect(resolvedTrack.backgroundUrl).toBe('https://example.com/bg.mp3');
    });

    it('should resolve backgroundUrl as resource object', async () => {
      const track: AddTrack = {
        url: 'https://example.com/main.mp3',
        backgroundUrl: 42 as unknown as string, // ResourceObject (number)
        title: 'Test',
        artist: 'Test Artist',
      };

      await TrackPlayer.load(track);
      const resolvedTrack = (mockNative.load as jest.Mock).mock.calls[0][0];
      expect(resolvedTrack.backgroundUrl).toEqual({ uri: 'asset://42' });
    });

    it('should leave backgroundUrl undefined when not set', async () => {
      const track: AddTrack = {
        url: 'https://example.com/main.mp3',
        title: 'Test',
        artist: 'Test Artist',
      };

      await TrackPlayer.load(track);
      const resolvedTrack = (mockNative.load as jest.Mock).mock.calls[0][0];
      expect(resolvedTrack.backgroundUrl).toBeUndefined();
    });

    it('should resolve backgroundUrl in add() as well', async () => {
      const track: AddTrack = {
        url: 'https://example.com/main.mp3',
        backgroundUrl: 'https://example.com/bg.mp3',
        backgroundVolume: 0.5,
        title: 'Test',
        artist: 'Test Artist',
      };

      await TrackPlayer.add(track);
      const resolvedTracks = (mockNative.add as jest.Mock).mock.calls[0][0];
      expect(resolvedTracks[0].backgroundUrl).toBe(
        'https://example.com/bg.mp3'
      );
      expect(resolvedTracks[0].backgroundVolume).toBe(0.5);
    });
  });
});

/**
 * Possible states for the background track player.
 */
export type BackgroundPlaybackState =
  | 'none'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'buffering'
  | 'error'
  | 'ended';

/**
 * Event fired when the background track playback state changes.
 */
export interface BackgroundPlaybackStateEvent {
  /** The current state of the background player */
  state: BackgroundPlaybackState;

  /** Whether the background track is currently playing */
  isPlaying: boolean;

  /** Current volume level (0-1) */
  volume: number;

  /** Error message if state is 'error' */
  error?: string;
}

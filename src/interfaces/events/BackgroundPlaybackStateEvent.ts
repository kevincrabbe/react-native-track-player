/**
 * Event fired when the background track playback state changes.
 */
export interface BackgroundPlaybackStateEvent {
  /** The playback state as a string (none, ready, playing, buffering, ended) */
  state: string;

  /** Whether the background track is currently playing */
  isPlaying: boolean;

  /** Current background volume (0-1) */
  volume: number;
}

/**
 * Event fired when the background track playback state changes.
 */
export interface BackgroundPlaybackStateEvent {
  /** Whether the background track is currently playing. */
  isPlaying: boolean;

  /** The current volume of the background track (0-1). */
  volume: number;
}

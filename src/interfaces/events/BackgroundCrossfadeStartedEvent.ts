/**
 * Event fired when a crossfade begins during background track looping.
 */
export interface BackgroundCrossfadeStartedEvent {
  /** The duration of the crossfade in seconds. */
  duration: number;

  /** The current position in the track when crossfade started (in seconds). */
  position: number;

  /** The track duration in seconds. */
  trackDuration: number;
}

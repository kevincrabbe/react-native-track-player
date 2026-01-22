import type { Track } from '../Track';

/**
 * Event fired when the background track changes.
 */
export interface BackgroundTrackChangedEvent {
  /** The previously set background track, or null if there was none. */
  previousTrack: Track | null;

  /** The newly set background track, or null if the background track was cleared. */
  track: Track | null;
}

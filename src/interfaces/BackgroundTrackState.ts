import type { BackgroundCrossfadeOptions } from './BackgroundCrossfadeOptions';
import type { Track } from './Track';

/**
 * Represents the current state of the background track player.
 */
export interface BackgroundTrackState {
  /** The currently loaded background track, or null if no track is set. */
  track: Track | null;

  /** Whether the background track is currently playing. */
  isPlaying: boolean;

  /** The current volume of the background track (0-1). */
  volume: number;

  /** The crossfade options for looping, or null if crossfade is disabled. */
  crossfadeOptions: BackgroundCrossfadeOptions | null;
}

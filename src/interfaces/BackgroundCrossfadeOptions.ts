/**
 * Fade curve type for crossfade transitions.
 */
export type FadeCurve = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * Options for configuring crossfade behavior during background track looping.
 */
export interface BackgroundCrossfadeOptions {
  /** Duration of crossfade in seconds. */
  duration: number;

  /**
   * Fade out curve for the ending portion of the track.
   * @default 'linear'
   */
  fadeOutCurve?: FadeCurve;

  /**
   * Fade in curve for the beginning portion of the track (loop start).
   * @default 'linear'
   */
  fadeInCurve?: FadeCurve;
}

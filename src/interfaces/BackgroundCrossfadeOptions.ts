/**
 * The easing curve to use for fading.
 * - 'linear': Constant rate of change
 * - 'ease-in': Starts slow, accelerates
 * - 'ease-out': Starts fast, decelerates
 * - 'ease-in-out': Slow start and end, fast middle
 */
export type FadeCurve = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * Options for configuring crossfade behavior during background track looping.
 */
export interface BackgroundCrossfadeOptions {
  /** Duration of the crossfade in seconds. Must be >= 0. Values < 0.1 may not produce smooth results. */
  duration: number;

  /**
   * Easing curve for fading in at loop start.
   * @default 'linear'
   */
  fadeInCurve?: FadeCurve;

  /**
   * Easing curve for fading out at loop end.
   * Note: Currently reserved for future true crossfade implementation.
   * @default 'linear'
   */
  fadeOutCurve?: FadeCurve;
}

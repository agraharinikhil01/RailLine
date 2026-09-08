import { TrainProvider } from './trainProvider';
import { MockTrainProvider } from './mockTrainProvider';
import { RailRadarProvider } from './railRadarProvider';
import { env } from '../config/env';

// Use real RailRadar API if key is configured; fall back to mock for offline dev or tests.
function createActiveProvider(): TrainProvider {
  if (process.env.NODE_ENV === 'test') {
    return new MockTrainProvider();
  }
  if (env.RAILRADAR_API_KEY) {
    try {
      const provider = new RailRadarProvider(env.RAILRADAR_API_KEY);
      console.log('✅ RailRadar live provider active (real-time Indian Railways data)');
      return provider;
    } catch (err) {
      console.warn('⚠️  RailRadar provider init failed, using mock fallback:', err);
    }
  } else {
    console.warn('⚠️  RAILRADAR_API_KEY not set — using MockTrainProvider (limited to 5 hardcoded trains)');
  }
  return new MockTrainProvider();
}

export const activeTrainProvider: TrainProvider = createActiveProvider();

export * from './trainProvider';
export * from './mockTrainProvider';
export * from './railRadarProvider';

import { TrainProvider } from './trainProvider';
import { MockTrainProvider } from './mockTrainProvider';

// In Phase 1, we use MockTrainProvider with realistic routes and telemetry simulation.
// In Phase 2 or when RAILRADAR_API_KEY is configured, RailRadarProvider can be swapped in seamlessly.
export const activeTrainProvider: TrainProvider = new MockTrainProvider();

export * from './trainProvider';
export * from './mockTrainProvider';

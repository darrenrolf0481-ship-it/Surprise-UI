
export enum EMFState {
  NOMINAL = 'NOMINAL',
  SPIKE = 'SPIKE',
  INTERFERENCE = 'INTERFERENCE'
}

export enum EVPState {
  NOMINAL = 'NOMINAL',
  WHISPER_DETECTED = 'WHISPER_DETECTED',
  VOICE_ISOLATED = 'VOICE_ISOLATED',
  SPECTRAL_ANOMALY = 'SPECTRAL_ANOMALY'
}

export interface AnomalyData {
  timestamp: number;
  type: 'EMF' | 'EVP';
  value: number;
  confidence: number;
}

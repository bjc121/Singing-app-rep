import { decode } from "wav-decoder";
import { YIN } from "pitchfinder";
import Meyda from "meyda";

export async function computeFeatures(arrayBuffer: ArrayBuffer) {
  const audioData = await decode(Buffer.from(arrayBuffer));
  const channel = audioData.channelData[0];
  const sampleRate = audioData.sampleRate;
  const yin = YIN({ sampleRate });
  const pitches: number[] = [];
  const voicedFlags: boolean[] = [];
  const hopSize = 1024;
  for (let i = 0; i < channel.length; i += hopSize) {
    const slice = channel.slice(i, i + hopSize);
    const pitch = yin(slice);
    pitches.push(pitch ?? 0);
    voicedFlags.push(Boolean(pitch));
  }

  const voiced = pitches.filter((p) => p > 0);
  const medianF0Hz = voiced.sort((a, b) => a - b)[Math.floor(voiced.length / 2)] ?? null;
  const mean = voiced.reduce((a, b) => a + b, 0) / (voiced.length || 1);
  const pitchStdHz = Math.sqrt(
    voiced.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / (voiced.length || 1)
  );

  const voicedPct = voicedFlags.filter(Boolean).length / (voicedFlags.length || 1);

  const meydaFeatures = Meyda.extract(["rms"], channel, { sampleRate });
  const rmsAvg = Array.isArray(meydaFeatures?.rms)
    ? meydaFeatures.rms.reduce((a, b) => a + b, 0) / meydaFeatures.rms.length
    : typeof meydaFeatures?.rms === "number"
      ? meydaFeatures.rms
      : null;

  return {
    voicedPct,
    medianF0Hz: medianF0Hz ?? null,
    pitchStdHz: pitchStdHz || null,
    rmsAvg,
    rmsStd: null,
    computedJson: {
      hopSize,
      frames: pitches.length
    }
  };
}

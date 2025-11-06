import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import Constants from 'expo-constants';
import Slider from '@react-native-community/slider';

// Lazily resolve reanimated-color-picker to avoid crashing the bundle on environments
// where Reanimated isn't fully compatible (e.g., Expo Go with mismatched versions).
const colorPickerModule = (() => {
  try {
    // Only attempt to load on native platforms and when not running in Expo Go
    const isExpoGo = Constants?.appOwnership === 'expo';
    if (Platform.OS !== 'web' && !isExpoGo) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('reanimated-color-picker');
      return mod;
    }
  } catch (_) {
    // ignore and fall back to simple sliders
  }
  return null as any;
})();

const ColorPicker = colorPickerModule?.default;
const Panel1 = colorPickerModule?.Panel1;
const HueSlider = colorPickerModule?.HueSlider;
const OpacitySlider = colorPickerModule?.OpacitySlider;
const Preview = colorPickerModule?.Preview;
const Swatches = colorPickerModule?.Swatches;

type Props = {
  value: string; // hex string, e.g. '#ff0000'
  onCompleteJS: (color: { hex: string }) => void;
  style?: any;
};

/**
 * A reusable, well-spaced scaffold for the reanimated-color-picker components.
 * Provides consistent spacing and sensible defaults.
 */
export default function ColorPickerScaffold({ value, onCompleteJS, style }: Props) {
  // Parse incoming hex to local RGB for fallback sliders
  const [rgb, setRgb] = useState<[number, number, number]>(() => {
    const clean = value?.replace('#', '') ?? '000000';
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return [r, g, b];
  });

  useEffect(() => {
    const clean = value?.replace('#', '') ?? '000000';
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    setRgb([r, g, b]);
  }, [value]);

  const hexFromRgb = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;

  // If the color picker is available (i.e., not Expo Go and module resolves), render it
  if (ColorPicker && Panel1 && HueSlider && OpacitySlider && Preview && Swatches) {
    return (
      <View style={[{ width: '100%', paddingVertical: 8 }, style]}>
        <ColorPicker value={value} onComplete={onCompleteJS} style={{ width: '100%' }}>
          <Preview style={{ marginBottom: 8 }} />
          <Panel1 style={{ marginBottom: 12 }} />
          <HueSlider style={{ marginBottom: 12 }} />
          <OpacitySlider style={{ marginBottom: 12 }} />
          <Swatches style={{ marginBottom: 4 }} />
        </ColorPicker>
      </View>
    );
  }

  // Fallback: simple RGB sliders for environments like Expo Go on iOS
  const [r, g, b] = rgb;
  return (
    <View style={[{ width: '100%', paddingVertical: 8, gap: 8 }, style]}>
      <Text style={{ fontSize: 14, color: '#666' }}>
        Color picker no disponible en este entorno. Usa los deslizadores RGB.
      </Text>
      <View>
        <Text style={{ marginBottom: 4 }}>Rojo: {r}</Text>
        <Slider
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={r}
          minimumTrackTintColor="#FF3B30"
          maximumTrackTintColor="#D1D5DB"
          onSlidingComplete={(val) => {
            const next: [number, number, number] = [val, g, b];
            setRgb(next);
            onCompleteJS({ hex: hexFromRgb(next[0], next[1], next[2]) });
          }}
        />
      </View>
      <View>
        <Text style={{ marginBottom: 4 }}>Verde: {g}</Text>
        <Slider
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={g}
          minimumTrackTintColor="#34C759"
          maximumTrackTintColor="#D1D5DB"
          onSlidingComplete={(val) => {
            const next: [number, number, number] = [r, val, b];
            setRgb(next);
            onCompleteJS({ hex: hexFromRgb(next[0], next[1], next[2]) });
          }}
        />
      </View>
      <View>
        <Text style={{ marginBottom: 4 }}>Azul: {b}</Text>
        <Slider
          minimumValue={0}
          maximumValue={255}
          step={1}
          value={b}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#D1D5DB"
          onSlidingComplete={(val) => {
            const next: [number, number, number] = [r, g, val];
            setRgb(next);
            onCompleteJS({ hex: hexFromRgb(next[0], next[1], next[2]) });
          }}
        />
      </View>
    </View>
  );
}
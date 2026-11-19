import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Polygon } from 'react-native-svg';

import { colors } from '@/theme';

/**
 * E-Diary logo (blue ring + red lightning bolt), split into two layers so each can be
 * animated on its own. Both layers share the same viewBox, so stacking them at the same
 * size reproduces the full logo.
 */
const VIEW_BOX = '0 0 340 340';

/** Lightning bolt outline in viewBox coordinates. */
const BOLT_POINTS = '236,10 292,98 208,176 264,196 128,334 160,232 104,242';

interface LogoLayerProps {
  size: number;
}

export function BrandRing({ size }: LogoLayerProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX}>
      <Ellipse
        cx={170}
        cy={180}
        rx={138}
        ry={106}
        stroke={colors.brandRing}
        strokeWidth={34}
        fill="none"
        transform="rotate(-12 170 180)"
      />
    </Svg>
  );
}

/**
 * @param gapColor Colour of the thin outline around the bolt. Match it to the background
 *   so the bolt appears to cut through the ring, as in the original logo.
 */
export function BrandBolt({ size, gapColor }: LogoLayerProps & { gapColor: string }) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX}>
      <Polygon
        points={BOLT_POINTS}
        fill={colors.brandBolt}
        stroke={gapColor}
        strokeWidth={14}
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

/** Static full logo (ring + bolt). */
export function BrandLogo({ size, gapColor }: LogoLayerProps & { gapColor: string }) {
  return (
    <View style={{ width: size, height: size }}>
      <BrandRing size={size} />
      <View style={StyleSheet.absoluteFill}>
        <BrandBolt size={size} gapColor={gapColor} />
      </View>
    </View>
  );
}

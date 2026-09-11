import { ImageResponse } from 'next/og';
import { colors } from '@/config/theme';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.accent,
          borderRadius: 16,
          color: colors.onAccent,
          fontSize: 36,
          fontWeight: 600,
        }}
      >
        Q
      </div>
    ),
    size,
  );
}

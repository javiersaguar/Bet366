'use client';

import { useState } from 'react';
import { AvatarPicker } from '@/components/avatar-picker';

export function AvatarPickerDemo() {
  const [avatar, setAvatar] = useState({ symbol: 'horseshoe', color: 'violet' });
  return (
    <AvatarPicker
      userId="demo"
      displayName="Javi"
      symbol={avatar.symbol}
      color={avatar.color}
      onChange={setAvatar}
    />
  );
}

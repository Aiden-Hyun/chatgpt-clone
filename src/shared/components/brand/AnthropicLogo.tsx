// src/components/AnthropicLogo.tsx
import { Image } from "expo-image";
import React from "react";

interface AnthropicLogoProps {
  size?: number;
}

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({ size = 16 }) => {
  return (
    <Image
      source={require("../../../../assets/Anthropic/images.png")}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
};

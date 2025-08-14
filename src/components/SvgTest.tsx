import React from 'react';
import { Text, View } from 'react-native';
import BlackLogo from '../../assets/OpenAI/SVGs/OpenAI-black-monoblossom.svg';
import WhiteLogo from '../../assets/OpenAI/SVGs/OpenAI-white-monoblossom.svg';

export const SvgTest = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Testing SVG rendering:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <Text>Black Logo:</Text>
        <BlackLogo width={50} height={50} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <Text>White Logo:</Text>
        <WhiteLogo width={50} height={50} />
      </View>
    </View>
  );
};

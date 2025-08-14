import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { TypewriterText } from './index';

/**
 * Simple test component to verify TypewriterText works without infinite loops
 */
export const TypewriterTestScreen = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [showAnimation, setShowAnimation] = useState(true);

  const addMessage = () => {
    const newMessage = `This is test message #${messages.length + 1}. Let's see if it animates properly without causing infinite loops.`;
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const toggleAnimation = () => {
    setShowAnimation(prev => !prev);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        TypewriterText Test
      </Text>
      
      <Button title="Add Message" onPress={addMessage} />
      <Button title="Clear Messages" onPress={clearMessages} />
      <Button title={`Animation: ${showAnimation ? 'ON' : 'OFF'}`} onPress={toggleAnimation} />
      
      <View style={{ marginTop: 20, flex: 1 }}>
        {messages.map((message, index) => (
          <View key={index} style={{ marginBottom: 10, padding: 10, backgroundColor: '#f0f0f0' }}>
            <TypewriterText
              text={message}
              startAnimation={showAnimation}
              speed={15}
              showCursor={true}
              onComplete={() => console.log(`Message ${index + 1} animation completed`)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

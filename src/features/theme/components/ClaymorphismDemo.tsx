import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme';
import { ClayView } from './ClayView';

/**
 * A component that showcases the claymorphism effect with various examples
 */
export const ClaymorphismDemo: React.FC = () => {
  const theme = useAppTheme();
  const [activeButton, setActiveButton] = useState<number | null>(null);
  
  // Get clay colors from theme if available
  const clayColors = theme.colors.claymorphism?.palette || {
    red: '#FCA5A5',
    orange: '#FDBA74',
    yellow: '#FDE68A',
    green: '#A7F3D0',
    teal: '#99F6E4',
    cyan: '#A5F3FC',
    blue: '#BFDBFE',
    indigo: '#C7D2FE',
    purple: '#DDD6FE',
    pink: '#FBCFE8',
  };
  
  // Create styles using current theme
  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    description: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    demoContainer: {
      marginVertical: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    column: {
      width: '48%',
    },
    colorPalette: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    colorSwatch: {
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      margin: theme.spacing.xs,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    buttonText: {
      textAlign: 'center',
      fontWeight: theme.fontWeights.medium,
      fontSize: theme.fontSizes.md,
    },
    cardContent: {
      padding: theme.spacing.md,
    },
    cardTitle: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    cardText: {
      fontSize: theme.fontSizes.md,
      color: theme.colors.text.secondary,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 24,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text.inverted,
    },
    profileInfo: {
      flex: 1,
    },
    name: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
    },
    role: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.tertiary,
    },
    chatContainer: {
      marginVertical: theme.spacing.md,
    },
    messageRow: {
      marginBottom: theme.spacing.md,
    },
    userMessage: {
      alignSelf: 'flex-end',
      maxWidth: '80%',
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      maxWidth: '80%',
    },
    messageText: {
      padding: theme.spacing.md,
      fontSize: theme.fontSizes.md,
    },
    userMessageText: {
      color: theme.colors.text.inverted,
    },
    assistantMessageText: {
      color: theme.colors.text.primary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    input: {
      flex: 1,
      marginRight: theme.spacing.md,
      height: 50,
    },
    sendButton: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonText: {
      fontSize: 20,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text.inverted,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Claymorphism Demo</Text>
      <Text style={styles.description}>
        Claymorphism features soft, puffy 3D elements with vibrant colors and rounded corners,
        creating a playful and tactile user interface.
      </Text>
      
      {/* Color Palette Demo */}
      <Text style={styles.sectionTitle}>Color Palette</Text>
      <View style={styles.colorPalette}>
        {Object.entries(clayColors).map(([name, color]) => (
          <ClayView 
            key={name}
            style={styles.colorSwatch}
            backgroundColor={color}
            elevation={2}
          >
            <Text style={{ color: theme.colors.text.inverted }}>{name}</Text>
          </ClayView>
        ))}
      </View>
      
      {/* Buttons Demo */}
      <Text style={styles.sectionTitle}>Clay Buttons</Text>
      <View style={styles.buttonRow}>
        <ClayView 
          style={{ padding: theme.spacing.md, width: '48%' }}
          backgroundColor={theme.colors.primary}
          pressed={activeButton === 1}
          elevation={activeButton === 1 ? 1 : 2}
        >
          <TouchableOpacity 
            onPressIn={() => setActiveButton(1)} 
            onPressOut={() => setActiveButton(null)}
            style={{ width: '100%' }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
              Primary
            </Text>
          </TouchableOpacity>
        </ClayView>
        
        <ClayView 
          style={{ padding: theme.spacing.md, width: '48%' }}
          backgroundColor={theme.colors.secondary}
          pressed={activeButton === 2}
          elevation={activeButton === 2 ? 1 : 2}
        >
          <TouchableOpacity 
            onPressIn={() => setActiveButton(2)} 
            onPressOut={() => setActiveButton(null)}
            style={{ width: '100%' }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
              Secondary
            </Text>
          </TouchableOpacity>
        </ClayView>
      </View>
      
      <View style={styles.buttonRow}>
        <ClayView 
          style={{ padding: theme.spacing.md, width: '31%' }}
          backgroundColor={clayColors.green}
          pressed={activeButton === 3}
          elevation={activeButton === 3 ? 1 : 2}
        >
          <TouchableOpacity 
            onPressIn={() => setActiveButton(3)} 
            onPressOut={() => setActiveButton(null)}
            style={{ width: '100%' }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
              Yes
            </Text>
          </TouchableOpacity>
        </ClayView>
        
        <ClayView 
          style={{ padding: theme.spacing.md, width: '31%' }}
          backgroundColor={clayColors.yellow}
          pressed={activeButton === 4}
          elevation={activeButton === 4 ? 1 : 2}
        >
          <TouchableOpacity 
            onPressIn={() => setActiveButton(4)} 
            onPressOut={() => setActiveButton(null)}
            style={{ width: '100%' }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
              Maybe
            </Text>
          </TouchableOpacity>
        </ClayView>
        
        <ClayView 
          style={{ padding: theme.spacing.md, width: '31%' }}
          backgroundColor={clayColors.red}
          pressed={activeButton === 5}
          elevation={activeButton === 5 ? 1 : 2}
        >
          <TouchableOpacity 
            onPressIn={() => setActiveButton(5)} 
            onPressOut={() => setActiveButton(null)}
            style={{ width: '100%' }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.inverted }]}>
              No
            </Text>
          </TouchableOpacity>
        </ClayView>
      </View>
      
      {/* Cards Demo */}
      <Text style={styles.sectionTitle}>Clay Cards</Text>
      <ClayView style={{ marginBottom: theme.spacing.md }} elevation={3}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Clay Card</Text>
          <Text style={styles.cardText}>
            This card demonstrates the claymorphism effect with soft shadows and rounded corners.
            The puffy appearance creates a tactile, playful interface element.
          </Text>
        </View>
      </ClayView>
      
      <View style={styles.row}>
        <ClayView 
          style={[styles.column, { backgroundColor: clayColors.blue }]} 
          elevation={2}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.colors.text.inverted }]}>
              Weather
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text.inverted }]}>
              72°F
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text.inverted }]}>
              Sunny
            </Text>
          </View>
        </ClayView>
        
        <ClayView 
          style={[styles.column, { backgroundColor: clayColors.purple }]} 
          elevation={2}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.colors.text.inverted }]}>
              Calendar
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text.inverted }]}>
              Meeting at 2 PM
            </Text>
          </View>
        </ClayView>
      </View>
      
      {/* Profile Card */}
      <Text style={styles.sectionTitle}>Profile Card</Text>
      <ClayView elevation={3}>
        <View style={styles.profileCard}>
          <ClayView 
            style={styles.avatar}
            backgroundColor={theme.colors.primary}
            elevation={2}
          >
            <Text style={styles.avatarText}>JD</Text>
          </ClayView>
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.role}>Product Designer</Text>
          </View>
        </View>
      </ClayView>
      
      {/* Chat Interface */}
      <Text style={styles.sectionTitle}>Chat Interface</Text>
      <View style={styles.chatContainer}>
        <View style={styles.messageRow}>
          <ClayView 
            style={styles.assistantMessage}
            backgroundColor={theme.colors.background.secondary}
            elevation={2}
          >
            <Text style={[styles.messageText, styles.assistantMessageText]}>
              Hello! How can I help you today?
            </Text>
          </ClayView>
        </View>
        
        <View style={styles.messageRow}>
          <ClayView 
            style={styles.userMessage}
            backgroundColor={theme.colors.primary}
            elevation={2}
          >
            <Text style={[styles.messageText, styles.userMessageText]}>
              I'm interested in learning more about claymorphism design.
            </Text>
          </ClayView>
        </View>
        
        <View style={styles.messageRow}>
          <ClayView 
            style={styles.assistantMessage}
            backgroundColor={theme.colors.background.secondary}
            elevation={2}
          >
            <Text style={[styles.messageText, styles.assistantMessageText]}>
              Claymorphism is a design trend that features soft, puffy 3D elements with vibrant colors and rounded corners.
              It creates a playful and tactile user interface.
            </Text>
          </ClayView>
        </View>
        
        <View style={styles.inputContainer}>
          <ClayView 
            style={styles.input}
            backgroundColor={theme.colors.background.secondary}
            elevation={2}
          />
          
          <ClayView 
            style={styles.sendButton}
            backgroundColor={theme.colors.primary}
            elevation={2}
            pressed={activeButton === 6}
          >
            <TouchableOpacity 
              onPressIn={() => setActiveButton(6)} 
              onPressOut={() => setActiveButton(null)}
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </ClayView>
        </View>
      </View>
    </ScrollView>
  );
};

export default ClaymorphismDemo;

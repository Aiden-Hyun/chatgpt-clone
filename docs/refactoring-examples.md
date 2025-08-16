# UI Component Refactoring Examples

This document provides concrete examples of refactoring UI elements to use our new component library. These examples demonstrate how to transform existing code to follow our new styling conventions.

## Button Refactoring

### Before

```tsx
<TouchableOpacity 
  style={[styles.button, isLoading && styles.buttonDisabled]}
  onPress={handleSubmit}
  disabled={isLoading}
  activeOpacity={0.7}
>
  <Text style={styles.buttonText}>
    {isLoading ? 'Submitting...' : 'Submit'}
  </Text>
</TouchableOpacity>
```

```tsx
// In styles file
button: {
  width: '100%',
  backgroundColor: theme.colors.primary,
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: 'center',
},
buttonDisabled: {
  opacity: 0.6,
},
buttonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
```

### After

```tsx
<Button
  variant="primary"
  size="lg"
  label={isLoading ? 'Submitting...' : 'Submit'}
  onPress={handleSubmit}
  disabled={isLoading}
  isLoading={isLoading}
  fullWidth
/>
```

## Text Refactoring

### Before

```tsx
<Text style={[
  styles.title,
  isHighlighted && styles.highlightedTitle
]}>
  Welcome to our App
</Text>
```

```tsx
// In styles file
title: {
  fontSize: 24,
  fontWeight: '700',
  color: theme.colors.text.primary,
  marginBottom: 20,
},
highlightedTitle: {
  color: theme.colors.primary,
},
```

### After

```tsx
<Text 
  variant="h1" 
  color={isHighlighted ? theme.colors.primary : undefined}
>
  Welcome to our App
</Text>
```

## Input Refactoring

### Before

```tsx
<View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>Email</Text>
  <TextInput
    style={[styles.input, hasError && styles.inputError]}
    placeholder="Enter your email"
    value={email}
    onChangeText={(text) => {
      setEmail(text);
      setErrors({ ...errors, email: undefined });
    }}
    keyboardType="email-address"
    autoCapitalize="none"
  />
  {errors.email && (
    <Text style={styles.errorText}>
      {errors.email}
    </Text>
  )}
</View>
```

```tsx
// In styles file
inputContainer: {
  marginBottom: 16,
  width: '100%',
},
inputLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: theme.colors.text.primary,
  marginBottom: 8,
},
input: {
  backgroundColor: theme.colors.background.secondary,
  borderWidth: 1,
  borderColor: theme.colors.border.light,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: theme.colors.text.primary,
},
inputError: {
  borderColor: theme.colors.status.error.primary,
},
errorText: {
  color: theme.colors.status.error.primary,
  fontSize: 12,
  marginTop: 4,
},
```

### After

```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={(text) => {
    setEmail(text);
    setErrors({ ...errors, email: undefined });
  }}
  keyboardType="email-address"
  autoCapitalize="none"
  variant="filled"
  status={errors.email ? 'error' : 'default'}
  errorText={errors.email}
/>
```

## Card Refactoring

### Before

```tsx
<View style={styles.card}>
  <View style={styles.cardHeader}>
    <Text style={styles.cardTitle}>Card Title</Text>
  </View>
  <View style={styles.cardContent}>
    <Text style={styles.cardText}>
      This is the content of the card with some information.
    </Text>
  </View>
  <View style={styles.cardFooter}>
    <TouchableOpacity style={styles.cardButton} onPress={handleAction}>
      <Text style={styles.cardButtonText}>Action</Text>
    </TouchableOpacity>
  </View>
</View>
```

```tsx
// In styles file
card: {
  backgroundColor: theme.colors.background.secondary,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
  marginVertical: 16,
},
cardHeader: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border.light,
},
cardTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: theme.colors.text.primary,
},
cardContent: {
  padding: 16,
},
cardText: {
  fontSize: 14,
  color: theme.colors.text.secondary,
},
cardFooter: {
  padding: 16,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border.light,
  flexDirection: 'row',
  justifyContent: 'flex-end',
},
cardButton: {
  backgroundColor: theme.colors.primary,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 4,
},
cardButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '500',
},
```

### After

```tsx
<Card
  variant="elevated"
  padding="md"
  header={<Text variant="h3">Card Title</Text>}
  footer={
    <Button
      variant="primary"
      size="sm"
      label="Action"
      onPress={handleAction}
    />
  }
>
  <Text variant="body">
    This is the content of the card with some information.
  </Text>
</Card>
```

## ListItem Refactoring

### Before

```tsx
<TouchableOpacity
  style={[
    styles.listItem,
    isSelected && styles.selectedListItem
  ]}
  onPress={() => onSelect(item.id)}
>
  <View style={styles.listItemIcon}>
    <Icon name="document" size={20} color={theme.colors.text.secondary} />
  </View>
  <View style={styles.listItemContent}>
    <Text style={styles.listItemTitle}>{item.title}</Text>
    <Text style={styles.listItemSubtitle}>{item.description}</Text>
  </View>
  <Icon name="chevron-right" size={16} color={theme.colors.text.tertiary} />
</TouchableOpacity>
```

```tsx
// In styles file
listItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border.light,
},
selectedListItem: {
  backgroundColor: theme.colors.background.secondary,
},
listItemIcon: {
  marginRight: 12,
},
listItemContent: {
  flex: 1,
},
listItemTitle: {
  fontSize: 16,
  fontWeight: '500',
  color: theme.colors.text.primary,
},
listItemSubtitle: {
  fontSize: 14,
  color: theme.colors.text.secondary,
  marginTop: 2,
},
```

### After

```tsx
<ListItem
  variant="default"
  title={item.title}
  subtitle={item.description}
  leftElement={<Icon name="document" size={20} color={theme.colors.text.secondary} />}
  rightElement={<Icon name="chevron-right" size={16} color={theme.colors.text.tertiary} />}
  selected={isSelected}
  onPress={() => onSelect(item.id)}
/>
```

## Complete Screen Refactoring Example

### Before (Auth Screen)

```tsx
return (
  <KeyboardAvoidingView 
    style={{ flex: 1 }} 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>{t('auth.welcome')}</ThemedText>
        
        {/* Google Login Button */}
        <TouchableOpacity 
          style={[styles.googleButton, signingInWithGoogle && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={signingInWithGoogle}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.googleButtonText}>
            {signingInWithGoogle ? t('auth.redirecting') : `🔍 ${t('auth.login_with_google')}`}
          </ThemedText>
        </TouchableOpacity>
        
        {/* Divider */}
        <View style={styles.divider}>
          <ThemedText style={styles.dividerText}>{t('auth.or')}</ThemedText>
        </View>
        
        {/* Email/Password Form */}
        <FormWrapper onSubmit={handleEmailSignin} style={{ width: '100%' }}>
          <ThemedTextInput
            ref={emailRef}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors(prev => ({ ...prev, email: undefined }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSigningIn}
            variant="filled"
            returnKeyType="next"
            onSubmitEditing={handleEmailSubmit}
            blurOnSubmit={false}
          />
          {errors.email && (
            <ThemedText style={styles.errorText}>
              {errors.email}
            </ThemedText>
          )}
          
          <ThemedTextInput
            ref={passwordRef}
            placeholder={t('auth.password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            editable={!isSigningIn}
            variant="filled"
            returnKeyType="done"
            onSubmitEditing={handlePasswordSubmit}
          />
          {errors.password && (
            <ThemedText style={styles.errorText}>
              {errors.password}
            </ThemedText>
          )}
        </FormWrapper>
        
        {/* Sign In Button */}
        <TouchableOpacity 
          style={[styles.button, isSigningIn && styles.buttonDisabled]}
          onPress={handleEmailSignin}
          disabled={isSigningIn}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.buttonText}>
            {isSigningIn ? t('auth.signing_in') : t('auth.sign_in_with_email')}
          </ThemedText>
        </TouchableOpacity>
        
        {/* Links */}
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={handleForgotPassword}
          disabled={isSigningIn}
          activeOpacity={0.7}
        >
          <ThemedText type="link" style={styles.linkText}>{t('auth.forgot_password')}</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={handleGoToSignup}
          disabled={isSigningIn}
          activeOpacity={0.7}
        >
          <ThemedText type="link" style={styles.linkText}>{t('auth.no_account_link')}</ThemedText>
        </TouchableOpacity>
        
        {/* Language Selector */}
        <LanguageSelector />
      </ThemedView>
    </ScrollView>
  </KeyboardAvoidingView>
);
```

### After (Auth Screen)

```tsx
return (
  <KeyboardAvoidingView 
    style={{ flex: 1 }} 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Card variant="flat" padding="lg" containerStyle={{ width: '100%', maxWidth: 400 }}>
          <Text variant="h1" center>{t('auth.welcome')}</Text>
          
          {/* Google Login Button */}
          <Button
            variant="primary"
            size="lg"
            label={signingInWithGoogle ? t('auth.redirecting') : `🔍 ${t('auth.login_with_google')}`}
            onPress={handleGoogleLogin}
            disabled={signingInWithGoogle}
            isLoading={signingInWithGoogle}
            fullWidth
            containerStyle={{ marginTop: theme.spacing.lg }}
          />
          
          {/* Divider */}
          <View style={styles.divider}>
            <Text variant="caption" color={theme.colors.text.tertiary}>{t('auth.or')}</Text>
          </View>
          
          {/* Email/Password Form */}
          <FormWrapper onSubmit={handleEmailSignin} style={{ width: '100%' }}>
            <Input
              label={t('auth.email')}
              placeholder={t('auth.email')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSigningIn}
              variant="filled"
              returnKeyType="next"
              onSubmitEditing={handleEmailSubmit}
              blurOnSubmit={false}
              errorText={errors.email}
              status={errors.email ? 'error' : 'default'}
            />
            
            <Input
              label={t('auth.password')}
              placeholder={t('auth.password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!isSigningIn}
              variant="filled"
              returnKeyType="done"
              onSubmitEditing={handlePasswordSubmit}
              errorText={errors.password}
              status={errors.password ? 'error' : 'default'}
            />
          </FormWrapper>
          
          {/* Sign In Button */}
          <Button
            variant="primary"
            size="lg"
            label={isSigningIn ? t('auth.signing_in') : t('auth.sign_in_with_email')}
            onPress={handleEmailSignin}
            disabled={isSigningIn}
            isLoading={isSigningIn}
            fullWidth
            containerStyle={{ marginTop: theme.spacing.md }}
          />
          
          {/* Links */}
          <Button
            variant="link"
            size="md"
            label={t('auth.forgot_password')}
            onPress={handleForgotPassword}
            disabled={isSigningIn}
            containerStyle={{ marginTop: theme.spacing.sm }}
          />
          
          <Button
            variant="link"
            size="md"
            label={t('auth.no_account_link')}
            onPress={handleGoToSignup}
            disabled={isSigningIn}
            containerStyle={{ marginTop: theme.spacing.sm }}
          />
          
          {/* Language Selector */}
          <View style={{ marginTop: theme.spacing.xl, alignItems: 'center' }}>
            <LanguageSelector />
          </View>
        </Card>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
```

These examples demonstrate how to refactor UI elements to use our new component library. The refactored code is more concise, easier to read, and more maintainable. It also ensures consistency across the application.

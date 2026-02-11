import React from 'react';
import { View, TouchableOpacity, TextInput, Linking } from 'react-native';
import ThemedText from '@/components/shared/ThemedText';
import Icon from '@/components/shared/Icon';
import Avatar from '@/components/shared/Avatar';
import { ContactCardProps, CardMode } from '@/types/generative-ui';

/**
 * ContactCard - Displays contact information with call/message actions
 */
export function ContactCard({
  id,
  first_name,
  last_name,
  full_name,
  phone,
  phone_1,
  phone_1_type,
  phone_2,
  phone_2_type,
  email,
  company,
  address,
  city,
  state,
  postal_code,
  birthday,
  notes,
  photo_url,
  mode = 'view',
  onModeChange,
  onPress,
}: ContactCardProps) {
  const displayName = full_name || `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown';
  const primaryPhone = phone || phone_1;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (onModeChange && mode === 'view') {
      onModeChange('detail');
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleEmail = (emailAddress: string) => {
    Linking.openURL(`mailto:${emailAddress}`);
  };

  // View Mode - Compact contact card
  if (mode === 'view') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className="bg-muted dark:bg-darkMuted rounded-2xl p-4"
      >
        <View className="flex-row items-center gap-3">
          <Avatar size="md" src={photo_url || undefined} name={displayName} />
          <View className="flex-1">
            <ThemedText className="text-base font-semibold" numberOfLines={1}>
              {displayName}
            </ThemedText>
            {primaryPhone && (
              <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                {primaryPhone}
              </ThemedText>
            )}
            {company && (
              <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground" numberOfLines={1}>
                {company}
              </ThemedText>
            )}
          </View>
          <View className="flex-row gap-2">
            {primaryPhone && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleCall(primaryPhone);
                }}
                className="w-10 h-10 rounded-full bg-green-500 items-center justify-center"
              >
                <Icon name="Phone" size={18} color="#fff" />
              </TouchableOpacity>
            )}
            {primaryPhone && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleMessage(primaryPhone);
                }}
                className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
              >
                <Icon name="MessageCircle" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Detail Mode - Full contact information
  if (mode === 'detail') {
    return (
      <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <Avatar size="lg" src={photo_url || undefined} name={displayName} />
            <View>
              <ThemedText className="text-lg font-bold">{displayName}</ThemedText>
              {company && (
                <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                  {company}
                </ThemedText>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => onModeChange?.('view')}>
            <Icon name="X" size={20} />
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 mb-4">
          {primaryPhone && (
            <TouchableOpacity
              onPress={() => handleCall(primaryPhone)}
              className="flex-1 bg-green-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <Icon name="Phone" size={16} color="#fff" />
              <ThemedText className="text-sm font-medium text-white">Call</ThemedText>
            </TouchableOpacity>
          )}
          {primaryPhone && (
            <TouchableOpacity
              onPress={() => handleMessage(primaryPhone)}
              className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <Icon name="MessageCircle" size={16} color="#fff" />
              <ThemedText className="text-sm font-medium text-white">Message</ThemedText>
            </TouchableOpacity>
          )}
          {email && (
            <TouchableOpacity
              onPress={() => handleEmail(email)}
              className="flex-1 bg-purple-500 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <Icon name="Mail" size={16} color="#fff" />
              <ThemedText className="text-sm font-medium text-white">Email</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact info rows */}
        <View className="gap-3">
          {/* Primary phone */}
          {phone_1 && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                <Icon name="Phone" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">{phone_1}</ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {phone_1_type || 'Mobile'}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Secondary phone */}
          {phone_2 && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                <Icon name="Phone" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">{phone_2}</ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  {phone_2_type || 'Other'}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Email */}
          {email && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                <Icon name="Mail" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">{email}</ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  Email
                </ThemedText>
              </View>
            </View>
          )}

          {/* Address */}
          {(address || city || state) && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                <Icon name="MapPin" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">
                  {[address, city, state, postal_code].filter(Boolean).join(', ')}
                </ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  Address
                </ThemedText>
              </View>
            </View>
          )}

          {/* Birthday */}
          {birthday && (
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-background dark:bg-darkBackground items-center justify-center">
                <Icon name="Cake" size={16} />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm">
                  {new Date(birthday).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </ThemedText>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  Birthday
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Notes */}
        {notes && (
          <View className="mt-4 p-3 bg-background dark:bg-darkBackground rounded-xl">
            <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground mb-1">
              Notes
            </ThemedText>
            <ThemedText className="text-sm">{notes}</ThemedText>
          </View>
        )}

        {/* Edit button */}
        <TouchableOpacity
          onPress={() => onModeChange?.('form')}
          className="mt-4 bg-background dark:bg-darkBackground rounded-xl py-3 flex-row items-center justify-center gap-2"
        >
          <Icon name="Edit" size={16} />
          <ThemedText className="text-sm font-medium">Edit Contact</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  // Form Mode - Editable contact
  return (
    <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <ThemedText className="text-lg font-bold">Edit Contact</ThemedText>
        <TouchableOpacity onPress={() => onModeChange?.('detail')}>
          <Icon name="X" size={20} />
        </TouchableOpacity>
      </View>

      {/* Form fields */}
      <View className="gap-3">
        <View>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
            First Name
          </ThemedText>
          <TextInput
            className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 text-foreground dark:text-darkForeground"
            defaultValue={first_name || ''}
            placeholder="First name"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
            Last Name
          </ThemedText>
          <TextInput
            className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 text-foreground dark:text-darkForeground"
            defaultValue={last_name || ''}
            placeholder="Last name"
            placeholderTextColor="#999"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
            Phone
          </ThemedText>
          <TextInput
            className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 text-foreground dark:text-darkForeground"
            defaultValue={primaryPhone || ''}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View>
          <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground mb-1">
            Email
          </ThemedText>
          <TextInput
            className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2 text-foreground dark:text-darkForeground"
            defaultValue={email || ''}
            placeholder="Email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          onPress={() => onModeChange?.('detail')}
          className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-3 items-center"
        >
          <ThemedText className="text-sm font-medium">Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl py-3 items-center">
          <ThemedText className="text-sm font-medium text-white">Save</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ContactCard;

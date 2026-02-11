import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import AnimatedView from '../../components/shared/AnimatedView';
import ChatHeader from '../../components/ChatHeader';
import ThemedText from '../../components/shared/ThemedText';
import Icon from '../../components/shared/Icon';
import { shadowPresets } from '../../utils/useShadow';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionSettingsProps {
  onBack?: () => void;
}

interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

export default function SubscriptionSettings({ onBack }: SubscriptionSettingsProps) {
  const { user } = useAuth();

  const mockInvoices: Invoice[] = [
    { id: '1', date: 'Oct 29, 2025', plan: 'Professional', amount: '$20.00', status: 'Paid' },
    { id: '2', date: 'Oct 29, 2024', plan: 'Professional', amount: '$20.00', status: 'Paid' },
    { id: '3', date: 'Oct 29, 2023', plan: 'Professional', amount: '$20.00', status: 'Paid' },
    { id: '4', date: 'Oct 29, 2022', plan: 'Professional', amount: '$20.00', status: 'Paid' },
  ];

  return (
    <AnimatedView
      className="flex-1 bg-background dark:bg-darkBackground"
      animation="fadeIn"
      duration={350}
    >
      <ChatHeader
        onMenuPress={onBack}
        userName={user?.full_name || 'User'}
        userAvatar={undefined}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-4">
            <ThemedText className="text-2xl font-semibold">Header</ThemedText>
            <View className="h-px bg-muted dark:bg-darkMuted mt-4" />
          </View>

          {/* Current Plan */}
          <View className="mb-6">
            <View className="bg-muted dark:bg-darkMuted rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText className="text-lg font-semibold">Professional</ThemedText>
                <View className="bg-foreground dark:bg-darkForeground rounded-lg px-2 py-1">
                  <ThemedText className="text-xs text-foreground dark:text-darkForeground">
                    Current plan
                  </ThemedText>
                </View>
              </View>
              <View className="mb-4">
                <View className="flex-row items-baseline gap-1 mb-2">
                  <ThemedText className="text-2xl font-semibold">$20</ThemedText>
                  <ThemedText className="text-sm text-muted-foreground dark:text-darkMutedForeground">
                    /month
                  </ThemedText>
                </View>
                <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                  Renews Oct 30, 2029
                </ThemedText>
              </View>
              <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon name="Check" size={16} />
                  <ThemedText className="text-xs">Standard AI Chat Model Access</ThemedText>
                </View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon name="Check" size={16} />
                  <ThemedText className="text-xs">Up to 15 Image Generations/month</ThemedText>
                </View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon name="Check" size={16} />
                  <ThemedText className="text-xs">2 Video Generations (up to 5s each)</ThemedText>
                </View>
                <View className="flex-row items-center gap-2 mb-2">
                  <Icon name="Check" size={16} />
                  <ThemedText className="text-xs">Standard Access Speed</ThemedText>
                </View>
                <View className="flex-row items-center gap-2">
                  <Icon name="Check" size={16} />
                  <ThemedText className="text-xs">Community Support</ThemedText>
                </View>
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  className="flex-1 bg-foreground dark:bg-darkForeground rounded-xl py-2 items-center"
                  style={shadowPresets.small}
                >
                  <ThemedText className="text-xs text-foreground dark:text-darkForeground font-medium">
                    Upgrade plan
                  </ThemedText>
                </Pressable>
                <Pressable
                  className="flex-1 bg-background dark:bg-darkBackground rounded-xl py-2 items-center border border-border dark:border-darkBorder"
                >
                  <ThemedText className="text-xs">Cancel subscription</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View className="mb-6">
            <View className="mb-2">
              <ThemedText className="text-lg font-semibold">Payment Method</ThemedText>
              <View className="h-px bg-muted dark:bg-darkMuted mt-2" />
            </View>
            <View className="bg-muted dark:bg-darkMuted rounded-xl p-3 mt-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-lg bg-background dark:bg-darkBackground items-center justify-center">
                    <Icon name="CreditCard" size={24} />
                  </View>
                  <View>
                    <ThemedText className="text-sm font-medium">Visa **** 8880</ThemedText>
                    <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">
                      Expiry 09/28
                    </ThemedText>
                  </View>
                </View>
                <Pressable className="bg-background dark:bg-darkBackground rounded-xl px-3 py-2">
                  <ThemedText className="text-xs">Manage</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Invoices */}
          <View className="mb-6">
            <View className="mb-2">
              <ThemedText className="text-lg font-semibold">Invoices</ThemedText>
              <View className="h-px bg-muted dark:bg-darkMuted mt-2" />
            </View>
            <View className="mt-4">
              {/* Table Header */}
              <View className="flex-row mb-2 pb-2 border-b border-border dark:border-darkBorder">
                <View className="flex-1">
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Date</ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Plan</ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Amount</ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Status</ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="text-xs text-muted-foreground dark:text-darkMutedForeground">Action</ThemedText>
                </View>
              </View>
              {/* Table Rows */}
              {mockInvoices.map((invoice) => (
                <View
                  key={invoice.id}
                  className="flex-row items-center py-3 border-b border-border dark:border-darkBorder"
                >
                  <View className="flex-1">
                    <ThemedText className="text-xs">{invoice.date}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-xs">{invoice.plan}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-xs">{invoice.amount}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText className="text-xs">{invoice.status}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <Pressable className="flex-row items-center gap-1">
                      <Icon name="Download" size={16} />
                      <ThemedText className="text-xs">CSV/PDF</ThemedText>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </AnimatedView>
  );
}


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, BookOpen, Flame } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useChatStore, AppTab } from '../store/useChatStore';
import { ChatScreen } from '../screens/ChatScreen';
import { GitaTreasuryScreen } from '../screens/GitaTreasuryScreen';
import { SadhanaScreen } from '../screens/SadhanaScreen';

export const MainNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useChatStore();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'counsel':
        return <ChatScreen />;
      case 'treasury':
        return <GitaTreasuryScreen />;
      case 'sadhana':
        return <SadhanaScreen />;
      default:
        return <ChatScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Active Screen View */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Sacred Bottom Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: bottomPadding, height: 56 + bottomPadding }]}>
        {/* Tab 1: Sakha Counsel */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('counsel')}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'counsel' && styles.iconWrapperActive,
            ]}
          >
            <Sparkles
              size={18}
              color={activeTab === 'counsel' ? colors.goldPrimary : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'counsel' && styles.tabLabelActive,
            ]}
          >
            Counsel
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Gita Treasury */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('treasury')}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'treasury' && styles.iconWrapperActive,
            ]}
          >
            <BookOpen
              size={18}
              color={activeTab === 'treasury' ? colors.goldPrimary : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'treasury' && styles.tabLabelActive,
            ]}
          >
            Treasury
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Daily Sadhana */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('sadhana')}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'sadhana' && styles.iconWrapperActive,
            ]}
          >
            <Flame
              size={18}
              color={activeTab === 'sadhana' ? colors.saffron : colors.textMuted}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'sadhana' && styles.tabLabelActive,
            ]}
          >
            Sadhana
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08070D',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0C0A14',
    borderTopWidth: 1,
    borderColor: '#242036',
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: '#1C182B',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.goldPrimary,
    fontWeight: '800',
  },
});

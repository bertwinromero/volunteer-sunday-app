import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { Text, Surface, Chip, Button, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { databaseService } from '../../../services/database';
import { participantService } from '../../../services/participantService';
import { ProgramWithItems, ProgramItem } from '../../../types';
import { format, parseISO } from 'date-fns';

export default function GuestProgramViewScreen() {
  const [program, setProgram] = useState<ProgramWithItems | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();

  const programId = params.id as string;
  const participantId = params.participantId as string;

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProgram();

    // Start heartbeat to keep participant active
    if (participantId) {
      heartbeatRef.current = participantService.startHeartbeat(participantId);
    }

    // Cleanup on unmount
    return () => {
      if (heartbeatRef.current) {
        participantService.stopHeartbeat(heartbeatRef.current);
      }
    };
  }, [programId, participantId]);

  useEffect(() => {
    // Update current item based on time
    if (program?.program_items) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      for (let i = 0; i < program.program_items.length; i++) {
        const item = program.program_items[i];
        const [hours, minutes] = item.time.split(':').map(Number);
        const itemTime = hours * 60 + minutes;

        if (currentTime < itemTime) {
          setCurrentItemIndex(i === 0 ? 0 : i - 1);
          break;
        } else if (i === program.program_items.length - 1) {
          setCurrentItemIndex(i);
        }
      }
    }

    // Update every minute
    const interval = setInterval(() => {
      if (program?.program_items) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        for (let i = 0; i < program.program_items.length; i++) {
          const item = program.program_items[i];
          const [hours, minutes] = item.time.split(':').map(Number);
          const itemTime = hours * 60 + minutes;

          if (currentTime < itemTime) {
            setCurrentItemIndex(i === 0 ? 0 : i - 1);
            break;
          } else if (i === program.program_items.length - 1) {
            setCurrentItemIndex(i);
          }
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [program]);

  const loadProgram = async () => {
    try {
      const data = await databaseService.getProgram(programId);
      setProgram(data);
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProgram();
  };

  const handleLeave = async () => {
    try {
      if (participantId) {
        await participantService.leaveProgram(participantId, programId);
        await participantService.clearGuestSession();
      }
      router.replace('/');
    } catch (error) {
      console.error('Error leaving program:', error);
      router.replace('/');
    }
  };

  const getTimeUntilItem = (item: ProgramItem): string => {
    const now = new Date();
    const [itemHours, itemMinutes] = item.time.split(':').map(Number);
    const itemDate = new Date(now);
    itemDate.setHours(itemHours, itemMinutes, 0, 0);

    const diffMs = itemDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return 'In progress';
    if (diffMins === 0) return 'Starting now';
    if (diffMins === 1) return '1 minute';
    if (diffMins < 60) return `${diffMins} minutes`;

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Loading program...</Text>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Program not found</Text>
        <Button onPress={() => router.replace('/')}>Go Home</Button>
      </SafeAreaView>
    );
  }

  const nextItem =
    currentItemIndex < program.program_items.length - 1
      ? program.program_items[currentItemIndex + 1]
      : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              {program.title}
            </Text>
            <Text variant="bodyLarge" style={styles.headerSubtitle}>
              {format(parseISO(program.date), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <IconButton
            icon="exit-to-app"
            iconColor="#FFFFFF"
            size={24}
            onPress={handleLeave}
            style={styles.exitButton}
          />
        </View>
      </View>

      {/* What's Next Section */}
      {nextItem && (
        <View style={styles.nextContainer}>
          <Surface style={styles.nextCard} elevation={0}>
            <View style={styles.nextHeader}>
              <Text variant="labelLarge" style={styles.nextLabel}>
                WHAT'S NEXT
              </Text>
            </View>
            <View style={styles.nextContent}>
              <View style={styles.nextInfo}>
                <Text variant="titleLarge" style={styles.nextTitle}>
                  {nextItem.title}
                </Text>
                <View style={styles.nextMeta}>
                  <Text style={styles.metaIcon}>🕐</Text>
                  <Text variant="bodyMedium" style={styles.nextTime}>
                    {nextItem.time}
                  </Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text variant="bodyMedium" style={styles.nextCountdown}>
                    {getTimeUntilItem(nextItem)}
                  </Text>
                </View>
              </View>
              <Chip
                mode="flat"
                style={styles.nextChip}
                textStyle={styles.nextChipText}
              >
                {nextItem.duration_minutes} min
              </Chip>
            </View>
          </Surface>
        </View>
      )}

      {/* Program Timeline */}
      <ScrollView
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {program.program_items.map((item, index) => {
          const isCurrent = index === currentItemIndex;
          const isPast = index < currentItemIndex;
          const isFuture = index > currentItemIndex;

          return (
            <Surface
              key={item.id}
              style={[
                styles.timelineCard,
                isCurrent && styles.timelineCardCurrent,
                isPast && styles.timelineCardPast,
              ]}
              elevation={0}
            >
              <View style={styles.timelineIndicator}>
                <View
                  style={[
                    styles.timelineDot,
                    isCurrent && styles.timelineDotCurrent,
                    isPast && styles.timelineDotPast,
                  ]}
                />
                {index < program.program_items.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      isPast && styles.timelineLinePast,
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineItemContent}>
                <View style={styles.timelineHeader}>
                  <Text
                    variant="labelLarge"
                    style={[
                      styles.timelineTime,
                      isCurrent && styles.timelineTimeCurrent,
                      isPast && styles.timelineTimePast,
                    ]}
                  >
                    {item.time}
                  </Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.durationChip,
                      isCurrent && styles.durationChipCurrent,
                    ]}
                    textStyle={styles.durationChipText}
                  >
                    {item.duration_minutes} min
                  </Chip>
                </View>

                <Text
                  variant="titleMedium"
                  style={[
                    styles.timelineTitle,
                    isCurrent && styles.timelineTitleCurrent,
                    isPast && styles.timelineTitlePast,
                  ]}
                >
                  {item.title}
                </Text>

                {item.description && (
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.timelineDescription,
                      isPast && styles.timelineDescriptionPast,
                    ]}
                  >
                    {item.description}
                  </Text>
                )}

                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <View style={styles.currentIndicator} />
                    <Text style={styles.currentText}>Current</Text>
                  </View>
                )}

                {isFuture && (
                  <Text variant="bodySmall" style={styles.timeUntil}>
                    Starts in {getTimeUntilItem(item)}
                  </Text>
                )}
              </View>
            </Surface>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  // Header Styles
  headerGradient: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#E0E7FF',
    fontWeight: '500',
  },
  exitButton: {
    margin: 0,
  },
  // What's Next Styles
  nextContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  nextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  nextHeader: {
    marginBottom: 12,
  },
  nextLabel: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  nextContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nextInfo: {
    flex: 1,
    marginRight: 12,
  },
  nextTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  nextMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  nextTime: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  metaSeparator: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  nextCountdown: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  nextChip: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    height: 32,
  },
  nextChipText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 13,
  },
  // Timeline Styles
  timeline: {
    flex: 1,
  },
  timelineContent: {
    padding: 16,
    paddingBottom: 32,
  },
  timelineCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  timelineCardCurrent: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  timelineCardPast: {
    opacity: 0.65,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  timelineDotCurrent: {
    backgroundColor: '#6366F1',
    borderColor: '#C7D2FE',
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  timelineDotPast: {
    backgroundColor: '#9CA3AF',
    borderColor: '#E5E7EB',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineLinePast: {
    backgroundColor: '#D1D5DB',
  },
  timelineItemContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTime: {
    fontWeight: '700',
    color: '#6B7280',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  timelineTimeCurrent: {
    color: '#6366F1',
  },
  timelineTimePast: {
    color: '#9CA3AF',
  },
  durationChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    height: 28,
  },
  durationChipCurrent: {
    backgroundColor: '#DDD6FE',
  },
  durationChipText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
  timelineTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    fontSize: 16,
  },
  timelineTitleCurrent: {
    color: '#4338CA',
  },
  timelineTitlePast: {
    color: '#6B7280',
  },
  timelineDescription: {
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
    fontSize: 14,
  },
  timelineDescriptionPast: {
    color: '#9CA3AF',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  currentIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  currentText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  timeUntil: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});

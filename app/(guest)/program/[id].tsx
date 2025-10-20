import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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
      <View style={styles.centerContainer}>
        <Text>Loading program...</Text>
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.centerContainer}>
        <Text>Program not found</Text>
        <Button onPress={() => router.replace('/')}>Go Home</Button>
      </View>
    );
  }

  const nextItem =
    currentItemIndex < program.program_items.length - 1
      ? program.program_items[currentItemIndex + 1]
      : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              {program.title}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              {format(parseISO(program.date), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <IconButton icon="exit-to-app" onPress={handleLeave} />
        </View>
      </Surface>

      {/* What's Next Section */}
      {nextItem && (
        <Surface style={styles.nextSection} elevation={1}>
          <Text variant="labelLarge" style={styles.nextLabel}>
            WHAT'S NEXT
          </Text>
          <View style={styles.nextContent}>
            <View style={styles.nextInfo}>
              <Text variant="titleLarge" style={styles.nextTitle}>
                {nextItem.title}
              </Text>
              <Text variant="bodyMedium" style={styles.nextTime}>
                {nextItem.time} • {getTimeUntilItem(nextItem)}
              </Text>
            </View>
            <Chip mode="flat" style={styles.nextChip}>
              {nextItem.duration_minutes} min
            </Chip>
          </View>
        </Surface>
      )}

      {/* Program Timeline */}
      <ScrollView
        style={styles.timeline}
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
                styles.timelineItem,
                isCurrent && styles.timelineItemCurrent,
                isPast && styles.timelineItemPast,
              ]}
              elevation={isCurrent ? 3 : 1}
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

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text
                    variant="labelLarge"
                    style={[
                      styles.timelineTime,
                      isCurrent && styles.timelineTimeCurrent,
                    ]}
                  >
                    {item.time}
                  </Text>
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.durationChip}
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
                  <Chip
                    icon="circle"
                    mode="flat"
                    style={styles.currentChip}
                    textStyle={styles.currentChipText}
                  >
                    Current
                  </Chip>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    fontWeight: 'bold',
  },
  headerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  nextSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  nextLabel: {
    opacity: 0.6,
    marginBottom: 8,
  },
  nextContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextInfo: {
    flex: 1,
  },
  nextTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  nextTime: {
    opacity: 0.7,
  },
  nextChip: {
    marginLeft: 12,
  },
  timeline: {
    flex: 1,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timelineItemCurrent: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  timelineItemPast: {
    opacity: 0.6,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  timelineDotCurrent: {
    backgroundColor: '#2196f3',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineDotPast: {
    backgroundColor: '#9e9e9e',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineLinePast: {
    backgroundColor: '#bdbdbd',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTime: {
    fontWeight: '600',
  },
  timelineTimeCurrent: {
    color: '#2196f3',
  },
  durationChip: {
    height: 24,
  },
  timelineTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineTitleCurrent: {
    color: '#1976d2',
  },
  timelineTitlePast: {
    opacity: 0.8,
  },
  timelineDescription: {
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 8,
  },
  timelineDescriptionPast: {
    opacity: 0.6,
  },
  currentChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#2196f3',
  },
  currentChipText: {
    color: '#fff',
  },
  timeUntil: {
    opacity: 0.6,
    marginTop: 4,
  },
});

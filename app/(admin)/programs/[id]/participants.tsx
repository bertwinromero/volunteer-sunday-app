import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, Surface, Chip, Button, SegmentedButtons } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { databaseService } from '../../../../services/database';
import { supabase } from '../../../../services/supabase';
import { Program, ProgramParticipant } from '../../../../types';
import ParticipantsList from '../../../../components/ParticipantsList';

type FilterType = 'all' | 'active' | 'guests' | 'registered';

export default function ProgramParticipantsScreen() {
  const [program, setProgram] = useState<Program | null>(null);
  const [participants, setParticipants] = useState<ProgramParticipant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<ProgramParticipant[]>([]);
  const [filter, setFilter] = useState<FilterType>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();

  const programId = params.id as string;

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`program_participants:${programId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'program_participants',
          filter: `program_id=eq.${programId}`,
        },
        (payload) => {
          console.log('Participant update:', payload);
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [programId]);

  useEffect(() => {
    filterParticipants();
  }, [participants, filter]);

  const loadData = async () => {
    try {
      const [programData, participantsData] = await Promise.all([
        databaseService.getProgram(programId),
        databaseService.getProgramParticipants(programId),
      ]);

      setProgram(programData);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const data = await databaseService.getProgramParticipants(programId);
      setParticipants(data);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const filterParticipants = () => {
    let filtered = [...participants];

    if (filter === 'active') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      filtered = filtered.filter((p) => new Date(p.last_active) > fiveMinutesAgo);
    } else if (filter === 'guests') {
      filtered = filtered.filter((p) => p.is_guest);
    } else if (filter === 'registered') {
      filtered = filtered.filter((p) => !p.is_guest);
    }

    setFilteredParticipants(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getActiveCount = (): number => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return participants.filter((p) => new Date(p.last_active) > fiveMinutesAgo).length;
  };

  const getGuestsCount = (): number => {
    return participants.filter((p) => p.is_guest).length;
  };

  const getRegisteredCount = (): number => {
    return participants.filter((p) => !p.is_guest).length;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.centerContainer}>
        <Text>Program not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {program.title}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Participants
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {getActiveCount()}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Active Now
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {participants.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total Joined
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {getGuestsCount()}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Guests
            </Text>
          </View>
        </View>
      </Surface>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as FilterType)}
          buttons={[
            {
              value: 'active',
              label: 'Active',
              showSelectedCheck: true,
            },
            {
              value: 'all',
              label: 'All',
              showSelectedCheck: true,
            },
            {
              value: 'guests',
              label: 'Guests',
              showSelectedCheck: true,
            },
            {
              value: 'registered',
              label: 'Registered',
              showSelectedCheck: true,
            },
          ]}
        />
      </View>

      {/* Participants List */}
      <ParticipantsList
        participants={filteredParticipants}
        showActiveStatus={true}
        emptyMessage={
          filter === 'active'
            ? 'No active participants'
            : filter === 'guests'
            ? 'No guest participants'
            : filter === 'registered'
            ? 'No registered participants'
            : 'No participants yet'
        }
      />

      {/* Actions */}
      <Surface style={styles.footer} elevation={2}>
        <Button
          mode="outlined"
          onPress={() => router.push(`/(admin)/programs/${programId}/share`)}
          icon="share-variant"
          style={styles.footerButton}
        >
          Share Link
        </Button>
        <Button
          mode="text"
          onPress={() => router.back()}
        >
          Back
        </Button>
      </Surface>
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
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    opacity: 0.6,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 8,
  },
  footerButton: {
    marginBottom: 8,
  },
});

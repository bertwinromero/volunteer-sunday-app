import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export default function VolunteerHome() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Sunday Program
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Welcome, {user?.display_name}!
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Title
            title="Today's Service"
            subtitle="No active program"
            right={() => <Chip style={styles.chip}>Upcoming</Chip>}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              No program scheduled for today. Check back later or contact your coordinator.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="My Tasks" subtitle="0 pending tasks" />
          <Card.Content>
            <Text variant="bodyMedium">
              You have no tasks assigned yet.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Service Countdown" />
          <Card.Content>
            <View style={styles.countdownContainer}>
              <Text variant="displaySmall">--:--</Text>
              <Text variant="bodyMedium">Until service starts</Text>
            </View>
          </Card.Content>
        </Card>

        <Button mode="text" onPress={handleLogout} style={styles.logoutButton}>
          Sign Out
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 60,
  },
  headerText: {
    color: '#fff',
  },
  subtitle: {
    color: '#fff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  chip: {
    marginRight: 16,
  },
  countdownContainer: {
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});

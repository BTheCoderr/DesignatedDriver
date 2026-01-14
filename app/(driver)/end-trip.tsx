import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';

export default function EndTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(driver)/');
      return;
    }
    loadTrip();
    const subscription = supabase
      .channel(`trip:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trip_reviews',
          filter: `trip_id=eq.${id}`,
        },
        () => {
          loadTrip();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const loadTrip = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*, trip_reviews(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error loading trip:', error);
      router.replace('/(driver)/');
      return;
    }

    setTrip(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(driver)/')}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const review = trip.trip_reviews?.[0];
  const hasReview = review && review.rating;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip Completed</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>✓</Text>
          <Text style={styles.successText}>Trip completed successfully!</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Trip Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From:</Text>
            <Text style={styles.infoValue}>{trip.pickup_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={styles.infoValue}>{trip.destination_address}</Text>
          </View>
          {trip.estimated_distance_miles && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>{trip.estimated_distance_miles.toFixed(1)} miles</Text>
            </View>
          )}
        </View>

        {trip.total_price && (
          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Earnings</Text>
            <Text style={styles.earningsAmount}>${trip.total_price.toFixed(2)}</Text>
            {review?.tip_amount && review.tip_amount > 0 && (
              <Text style={styles.tipText}>
                + ${review.tip_amount.toFixed(2)} tip
              </Text>
            )}
          </View>
        )}

        {hasReview ? (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Customer Review</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                {'⭐'.repeat(review.rating || 0)}
              </Text>
              <Text style={styles.ratingNumber}>{review.rating}/5</Text>
            </View>
            {review.review_text && (
              <Text style={styles.reviewText}>{review.review_text}</Text>
            )}
          </View>
        ) : (
          <View style={styles.waitingCard}>
            <Text style={styles.waitingEmoji}>⏳</Text>
            <Text style={styles.waitingText}>Waiting for customer rating...</Text>
            <Text style={styles.waitingSubtext}>
              You'll be notified once the customer submits their review
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(driver)/')}
        >
          <Text style={styles.homeButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  successCard: {
    backgroundColor: '#4CAF50',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  earningsCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 24,
    marginRight: 8,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  reviewText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  waitingCard: {
    backgroundColor: '#1a1a1a',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  waitingEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  homeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

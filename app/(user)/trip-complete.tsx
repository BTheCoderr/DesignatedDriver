import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';

export default function TripCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState('');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(user)/');
      return;
    }
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error loading trip:', error);
      router.replace('/(user)/');
      return;
    }

    setTrip(data);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }

    if (!trip) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const tipAmount = tip ? parseFloat(tip) : 0;

      const { error } = await supabase
        .from('trip_reviews')
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          driver_id: trip.primary_driver_id,
          rating,
          tip_amount: tipAmount,
          review_text: review || null,
        });

      if (error) throw error;

      Alert.alert('Success', 'Thank you for your feedback!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(user)/'),
        },
      ]);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip Complete</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>✓</Text>
          <Text style={styles.successText}>Thank you for using Designated Driver!</Text>
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
          {trip.total_price && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.infoValue}>${trip.total_price.toFixed(2)}</Text>
            </View>
          )}
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Rate Your Driver</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => setRating(star)}
              >
                <Text style={[styles.star, rating >= star && styles.starFilled]}>
                  {rating >= star ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 ? 'Excellent!' :
               rating === 4 ? 'Great!' :
               rating === 3 ? 'Good' :
               rating === 2 ? 'Fair' : 'Poor'}
            </Text>
          )}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tip (Optional)</Text>
          <TextInput
            style={styles.tipInput}
            placeholder="$0.00"
            placeholderTextColor="#666"
            value={tip}
            onChangeText={setTip}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Review (Optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor="#666"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.claimButton}
          onPress={() => router.push(`/(user)/claim-damage?id=${trip.id}`)}
        >
          <Text style={styles.claimButtonText}>Report Damage</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (rating === 0 || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
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
  loadingText: {
    color: '#888',
    fontSize: 16,
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
  ratingCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 40,
  },
  starFilled: {
    fontSize: 40,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  tipCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  tipInput: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
  reviewInput: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  claimButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  claimButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

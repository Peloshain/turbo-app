import { View, FlatList, StyleSheet, RefreshControl, Text } from "react-native";
import { useSavedOutfits } from "../../hooks/useSavedOutfits";
import { OutfitCard } from "../../components/saved/OutfitCard";
import { EmptyOutfits } from "../../components/saved/EmptyOutfits";

export default function SavedScreen() {
  const {
    data: outfits = [],
    isLoading,
    refetch,
    isRefetching,
  } = useSavedOutfits();

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits}
        keyExtractor={(outfit) => outfit.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#1C1C1E"
          />
        }
        // Outfit count header
        ListHeaderComponent={
          outfits.length > 0 ? (
            <Text style={styles.countLabel}>
              {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"}{" "}
              saved
            </Text>
          ) : null
        }
        ListEmptyComponent={!isLoading ? <EmptyOutfits /> : null}
        renderItem={({ item }) => <OutfitCard outfit={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  countLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    marginBottom: 14,
  },
  separator: {
    height: 14,
  },
});

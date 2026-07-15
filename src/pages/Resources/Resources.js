import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, SafeAreaView } from 'react-native';
import { Bell, Search, Play, X, Calendar } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Resources.styles';

export const Resources = () => {
  const { username, setIsProfileOpen } = useUser();

  const [activeFilter, setActiveFilter] = useState('strength workout');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  const filters = [
    { key: 'action plan', label: 'Action Plan' },
    { key: 'strength workout', label: 'Strength Workout' },
    { key: 'guides', label: 'Guides' },
    { key: 'webinar', label: 'Webinar' }
  ];

  const resourcesList = [
    {
      id: 1,
      title: 'Week 16 Day 3 | Strength Workout',
      date: '10-May-2026',
      category: 'strength workout',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Week 16 Day 2 | Strength Workout',
      date: '08-May-2026',
      category: 'strength workout',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Week 16 Day 1 | Strength Workout',
      date: '06-May-2026',
      category: 'strength workout',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 4,
      title: 'Slow Burn Phase 1 Action Plan',
      date: '01-May-2026',
      category: 'action plan',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 5,
      title: 'Full Guide: Caloric Deficit & Nutrition',
      date: '28-Apr-2026',
      category: 'guides',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 6,
      title: 'Monthly Q&A: Overcoming Weight Plateaus',
      date: '15-Apr-2026',
      category: 'webinar',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const handleSearchSubmit = () => {
    setAppliedSearch(searchQuery.trim().toLowerCase());
  };

  const filteredResources = resourcesList.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch =
      appliedSearch === '' ||
      item.title.toLowerCase().includes(appliedSearch) ||
      item.category.toLowerCase().includes(appliedSearch);
    return matchesFilter && matchesSearch;
  });

  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.resourcesHeader}>
          <View style={styles.headerActionsRow}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setIsProfileOpen(true)}
            >
              <LinearGradient
                colors={theme.colors.gradients.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerProfileAvatar}
              >
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Resources</Text>
            <TouchableOpacity style={styles.bellBtn}>
              <Bell size={20} color={theme.colors.textPrimary} />
              <View style={styles.bellBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchForm}>
          <View style={styles.searchInputWrapper}>
            <Search size={16} color={theme.colors.textSecondary} style={styles.searchBarIcon} />
            <TextInput
              style={styles.searchInputField}
              placeholder="Search for resources..."
              placeholderTextColor="#546E7A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
            />
          </View>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.searchSubmitBtn}
            onPress={handleSearchSubmit}
          >
            <Text style={styles.searchSubmitBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Scrolling Filter buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersTabRow}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.8}
                style={[styles.filterTabBtn, isActive && styles.activeFilterTabBtn]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={[styles.filterTabBtnText, isActive && styles.activeFilterTabBtnText]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Video Cards Grid */}
        <View style={styles.videoCardsGrid}>
          {filteredResources.length > 0 ? (
            filteredResources.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                activeOpacity={0.9} 
                style={styles.videoResourceCard} 
                onPress={() => setActiveVideo(item)}
              >
                {/* Thumbnail */}
                <View style={styles.videoThumbnailWrapper}>
                  <Image 
                    source={{ uri: item.thumbnail }} 
                    style={styles.videoThumbnailImg}
                  />
                  <View style={styles.videoPlayOverlay}>
                    <View style={styles.playButtonRing}>
                      <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </View>
                </View>

                {/* Metadata */}
                <View style={styles.videoCardDetails}>
                  <Text style={styles.videoCardTitle}>{item.title}</Text>
                  <View style={styles.videoCardDateRow}>
                    <Calendar size={12} color={theme.colors.textSecondary} style={styles.dateIconSvg} />
                    <Text style={styles.videoCardDate}>{item.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyResultsBox}>
              <Text style={styles.emptyResultsText}>No resources found matching your query.</Text>
              <TouchableOpacity 
                style={styles.clearSearchBtn} 
                onPress={() => { setSearchQuery(''); setAppliedSearch(''); setActiveFilter('strength workout'); }}
              >
                <Text style={styles.clearSearchBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Video Player Modal */}
      {activeVideo && (
        <Modal
          transparent={true}
          visible={!!activeVideo}
          onRequestClose={() => setActiveVideo(null)}
          animationType="fade"
        >
          <View style={styles.videoPlayerModalOverlay}>
            <View style={styles.videoPlayerModalContent}>
              <TouchableOpacity 
                style={styles.videoModalCloseBtn} 
                onPress={() => setActiveVideo(null)}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.videoViewportWrapper}>
                <Text style={styles.videoModalTitle}>{activeVideo.title}</Text>
                
                <Video 
                  source={{ uri: activeVideo.videoUrl }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  useNativeControls
                  style={styles.modalVideoTag}
                />
                
                <View style={styles.videoModalMetaRow}>
                  <Calendar size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.videoModalMetaText}>Uploaded: {activeVideo.date}</Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Profile menu drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Resources;

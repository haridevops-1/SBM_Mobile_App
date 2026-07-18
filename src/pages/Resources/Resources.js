import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal, SafeAreaView, Platform, Linking, ActivityIndicator, Alert } from 'react-native';
import { Bell, Search, Play, X, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Resources.styles';

function getEmbedUrl(url) {
  if (!url) return "";
  try {
    let videoId = "";
    if (url.includes("youtube.com/watch")) {
      const parts = url.split("v=");
      if (parts.length > 1) {
        videoId = parts[1].split("&")[0];
      }
    } else if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      if (parts.length > 1) {
        videoId = parts[1].split("?")[0];
      }
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {}
  return url;
}

export const Resources = () => {
  const { username, setIsProfileOpen } = useUser();

  const [activeFilter, setActiveFilter] = useState('strength workout');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { key: 'action plan', label: 'Action Plan' },
    { key: 'strength workout', label: 'Strength Workout' },
    { key: 'guides', label: 'Guides' },
    { key: 'webinar', label: 'Webinar' }
  ];

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const url = `https://sbm-mobile-app-906714478.development.catalystserverless.com/resources?type=${encodeURIComponent(activeFilter)}&search=${encodeURIComponent(appliedSearch)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          }
        });
        const json = await response.json();
        if (response.ok && json.status === 'success') {
          setResources(json.data || []);
        } else {
          setResources([]);
        }
      } catch (err) {
        console.error("Error fetching resources:", err);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [activeFilter, appliedSearch]);

  const handleSearchSubmit = () => {
    setAppliedSearch(searchQuery.trim());
  };

  const handlePlayVideo = (item) => {
    if (Platform.OS === 'web') {
      setActiveVideo(item);
    } else {
      Linking.openURL(item.videoUrl).catch((err) => {
        Alert.alert("Error", "Unable to open video link.");
      });
    }
  };

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
                onPress={() => {
                  setActiveFilter(filter.key);
                  setSearchQuery('');
                  setAppliedSearch('');
                }}
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
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.accentPurple} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>Loading resources...</Text>
            </View>
          ) : resources.length > 0 ? (
            resources.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                activeOpacity={0.9} 
                style={styles.videoResourceCard} 
                onPress={() => handlePlayVideo(item)}
              >
                {/* Thumbnail */}
                <View style={styles.videoThumbnailWrapper}>
                  <Image 
                    source={{ uri: item.thumbnail || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop' }} 
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
                    <Text style={styles.videoCardDate}>{item.date || '01-May-2026'}</Text>
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
      {activeVideo && Platform.OS === 'web' && (
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
                
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    width: '100%',
                    height: 300,
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#000000'
                  }}
                />
                
                <View style={styles.videoModalMetaRow}>
                  <Calendar size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.videoModalMetaText}>Uploaded: {activeVideo.date || '01-May-2026'}</Text>
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

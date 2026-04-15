import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, url, description }) => {
  const { colors } = useTheme();

  const handleShare = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert('Tidak bisa share', 'Fitur sharing tidak tersedia di device ini');
      return;
    }

    const message = `${title}\n\n${description || 'Baca selengkapnya di sini:'}\n${url}`;
    
    await Sharing.shareAsync(message, {
      dialogTitle: 'Bagikan Berita',
      mimeType: 'text/plain',
    });
  };

  return (
    <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
      <Ionicons name="share-social" size={22} color={colors.text} />
    </TouchableOpacity>
  );
};
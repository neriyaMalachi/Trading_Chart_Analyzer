import { LIMITS, isSupportedMimeType } from '@tca/constants';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupportedMimeType } from '@tca/types';

import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import type { TabScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysis.store';

function inferMimeFromUri(uri: string): SupportedMimeType | null {
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0];
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  return null;
}

export function ImagePickScreen({ navigation }: TabScreenProps<'ImagePick'>): JSX.Element {
  const setPendingImage = useAnalysisStore((s) => s.setPendingImage);

  async function handlePicked(asset: ImagePicker.ImagePickerAsset): Promise<void> {
    if (!asset.base64) {
      Alert.alert('Could not read image', 'Please try again.');
      return;
    }
    const fileSize = asset.fileSize ?? Math.floor((asset.base64.length * 3) / 4);
    if (fileSize > LIMITS.MAX_IMAGE_BYTES) {
      Alert.alert('Image too large', `Please pick an image under ${LIMITS.MAX_IMAGE_BYTES_LABEL}.`);
      return;
    }

    const guessedMime = asset.mimeType && isSupportedMimeType(asset.mimeType)
      ? asset.mimeType
      : inferMimeFromUri(asset.uri);
    if (!guessedMime) {
      Alert.alert('Unsupported format', 'Please pick a PNG, JPG, or WebP image.');
      return;
    }

    setPendingImage({ uri: asset.uri, base64: asset.base64, mimeType: guessedMime, sizeBytes: fileSize });
    navigation.navigate('Preview');
  }

  async function pickFromLibrary(): Promise<void> {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      base64: true,
      quality: 0.9,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) await handlePicked(result.assets[0]);
  }

  async function captureWithCamera(): Promise<void> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) await handlePicked(result.assets[0]);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <View className="flex-1 justify-between p-6">
        <View className="gap-3">
          <Text className="text-2xl font-bold text-white">Add a chart</Text>
          <Text className="text-sm text-muted">PNG, JPG, or WebP. Max {LIMITS.MAX_IMAGE_BYTES_LABEL}.</Text>
          <View className="mt-4 gap-3">
            <PrimaryButton
              label={Platform.OS === 'web' ? 'Choose chart file' : 'Pick from library'}
              onPress={() => void pickFromLibrary()}
            />
            {Platform.OS !== 'web' && (
              <PrimaryButton
                label="Capture with camera"
                variant="secondary"
                onPress={() => void captureWithCamera()}
              />
            )}
          </View>
        </View>
        <DisclaimerBanner variant="footer" />
      </View>
    </SafeAreaView>
  );
}

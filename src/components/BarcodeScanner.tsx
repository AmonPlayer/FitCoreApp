import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface BarcodeScannerProps {
  visible: boolean;
  onScanned: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ visible, onScanned, onClose }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {!permission ? (
          <ActivityIndicator color={Colors.primaryGreen} />
        ) : !permission.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>Camera Access Needed</Text>
            <Text style={styles.permissionSub}>Allow camera access to scan barcodes.</Text>
            <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
              <Text style={styles.grantBtnText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={handleClose}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            {/* Dark overlay with scan window */}
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddle}>
                <View style={styles.overlaySide} />
                <View style={styles.scanWindow}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayBottom} />
            </View>

            <View style={styles.labelContainer}>
              <Text style={styles.scanLabel}>Point camera at a barcode</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const WINDOW = 260;
const CORNER = 24;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#0D0D0D' },
  permissionTitle: { fontFamily: Typography.sansBold, fontSize: 20, color: '#F0F0F0', marginBottom: 8 },
  permissionSub: { fontFamily: Typography.sans, fontSize: 14, color: '#AAAAAA', textAlign: 'center', marginBottom: 32 },
  grantBtn: { backgroundColor: Colors.primaryGreen, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  grantBtnText: { fontFamily: Typography.sansBold, fontSize: 15, color: '#FFF' },
  cancelLink: { marginTop: 16 },
  cancelLinkText: { fontFamily: Typography.sans, fontSize: 14, color: '#666' },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row', height: WINDOW },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  scanWindow: { width: WINDOW, height: WINDOW },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: Colors.primaryGreen },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W },
  labelContainer: { position: 'absolute', bottom: 140, left: 0, right: 0, alignItems: 'center' },
  scanLabel: { fontFamily: Typography.sans, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  closeBtn: { position: 'absolute', bottom: 60, alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  closeBtnText: { fontFamily: Typography.sansMedium, fontSize: 15, color: '#FFF' },
});

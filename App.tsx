import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Coordinates, AlarmStatus, UserProfile, CommutePreset } from './src/types';
import { TransferInterchange } from './src/types/routes';
import { generateWhatsAppEtaUrl, RouteSyncPayload } from './src/utils/routeSync';
import {
  haversineDistance,
  isAlarmTriggered,
  formatDistance,
  estimateETA,
} from './src/utils/geo';
import { locationService } from './src/services/locationService';
import { alarmManager } from './src/services/alarmManager';
import { adService } from './src/services/adService';
import { authService } from './src/services/authService';
import { notificationService } from './src/services/notificationService';
import { speechService } from './src/services/speechService';
import { powerManager } from './src/services/powerManager';
import { routeManager } from './src/services/routeManager';
import { subscriptionService } from './src/services/subscriptionService';
import { offlineCacheService } from './src/services/offlineCacheService';
import { registerServiceWorker } from './src/serviceWorkerRegistration';
import { appStyles } from './src/theme/appStyles';

import { UserAvatar } from './src/components/UserAvatar';
import { RouteFlipBar } from './src/components/RouteFlipBar';
import { PowerSaverIndicator } from './src/components/PowerSaverIndicator';
import { FloatingTransitHud } from './src/components/FloatingTransitHud';
import { SearchBar } from './src/components/SearchBar';
import { MapPicker } from './src/components/MapPicker';
import { DistanceSelector } from './src/components/DistanceSelector';
import { AlarmTriggerModal } from './src/components/AlarmTriggerModal';
import { BannerAdComponent } from './src/components/BannerAdComponent';
import { InterstitialAdModal } from './src/components/InterstitialAdModal';
import { SimulationControls } from './src/components/SimulationControls';
import { ConsentBanner } from './src/components/ConsentBanner';
import { LegalModal } from './src/components/LegalModal';
import { SettingsModal } from './src/components/SettingsModal';
import { PrimeModal } from './src/components/PrimeModal';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BUSINESS_DETAILS, PRICING_DISCLOSURE, LegalTabId } from './src/config/legalData';

export default function App() {
  // Device & Commute State
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>({
    latitude: 12.9784,
    longitude: 77.6408, // Default origin
  });
  const [destination, setDestination] = useState<Coordinates | null>({
    latitude: 12.9767,
    longitude: 77.5713, // Default destination
  });
  const [destinationName, setDestinationName] = useState<string>('Kempegowda Majestic');
  const [radiusKm, setRadiusKm] = useState<number>(4.0);
  const [speedKmh, setSpeedKmh] = useState<number | null>(45);

  // Multi-Leg Transfer Interchange State
  const [transferStation, setTransferStation] = useState<TransferInterchange | undefined>(() => {
    const active = routeManager.getActivePreset();
    return active?.transfer;
  });
  const [transferAlertTriggered, setTransferAlertTriggered] = useState<boolean>(false);

  // Authentication & Profile State
  const [user, setUser] = useState<UserProfile>(authService.getCurrentUser());

  // Multitasking & Power State
  const [floatingHudEnabled, setFloatingHudEnabled] = useState<boolean>(true);
  const [manualOverride, setManualOverride] = useState<boolean>(false);

  // Alarm & Tracking State
  const [alarmStatus, setAlarmStatus] = useState<AlarmStatus>('IDLE');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simulationTimerRef = useRef<any>(null);
  const snoozeTimerRef = useRef<any>(null);

  const clearSnoozeTimer = () => {
    if (snoozeTimerRef.current) {
      clearTimeout(snoozeTimerRef.current);
      snoozeTimerRef.current = null;
    }
  };

  // Compliance & Legal Modals State
  const [legalModalVisible, setLegalModalVisible] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabId>('compliance');
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [primeModalVisible, setPrimeModalVisible] = useState<boolean>(false);
  const [isAdFree, setIsAdFree] = useState<boolean>(() => subscriptionService.isAdFree());
  const [isOffline, setIsOffline] = useState<boolean>(!offlineCacheService.isOnline());

  // Register PWA service worker and listen to subway tunnel network transitions
  useEffect(() => {
    registerServiceWorker();
    return offlineCacheService.addNetworkListener((online) => {
      setIsOffline(!online);
    });
  }, []);

  // Subscribe to Prime subscription state transitions
  useEffect(() => {
    return subscriptionService.subscribe(() => {
      setIsAdFree(subscriptionService.isAdFree());
    });
  }, []);

  // Calculate live distance
  const currentDistanceKm =
    currentLocation && destination
      ? haversineDistance(currentLocation, destination)
      : null;

  // Calculate live distance to intermediate transfer interchange
  const transferDistanceKm =
    currentLocation && transferStation
      ? haversineDistance(currentLocation, transferStation.coords)
      : null;

  // Power tier computation
  const powerTier = powerManager.computeTier(currentDistanceKm || 0, speedKmh || 0);

  // Initialize permissions, notifications, auth & location
  useEffect(() => {
    let isMounted = true;
    (async () => {
      await notificationService.initialize();
      const granted = await locationService.requestPermissions();
      if (granted && isMounted) {
        const loc = await locationService.getCurrentLocation();
        if (loc && isMounted) {
          setCurrentLocation(loc);
        }
      }
    })();

    const unsubAuth = authService.onAuthStateChanged((newUser) => {
      if (isMounted) setUser(newUser);
    });

    const unsubNotifAction = notificationService.onNotificationAction((action) => {
      if (action.actionId === 'DISMISS') {
        handleAlarmDismiss();
      } else if (action.actionId === 'SNOOZE') {
        handleAlarmSnooze();
      }
    });

    return () => {
      isMounted = false;
      locationService.stopTracking();
      clearSnoozeTimer();
      unsubAuth();
      unsubNotifAction();
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  // Monitor proximity for arrival alarms and speech callouts
  useEffect(() => {
    if (alarmStatus === 'TRACKING') {
      // 1. Multi-Leg Interchange Transfer Alert check
      if (
        transferStation &&
        !transferAlertTriggered &&
        transferDistanceKm !== null &&
        transferDistanceKm <= transferStation.wakeRadiusKm
      ) {
        setTransferAlertTriggered(true);
        notificationService.triggerArrivalAlert({
          destinationName: `Interchange: ${transferStation.name}`,
          distanceKm: transferDistanceKm,
          etaMinutes: estimateETA(transferDistanceKm, speedKmh),
          radiusKm: transferStation.wakeRadiusKm,
        });
      }

      // 2. Final destination arrival check
      if (currentDistanceKm !== null) {
        speechService.checkMilestoneAndSpeak({
          destinationName,
          distanceKm: currentDistanceKm,
          radiusKm,
        });

        if (isAlarmTriggered(currentDistanceKm, radiusKm)) {
          setAlarmStatus('TRIGGERED');
          notificationService.triggerArrivalAlert({
            destinationName,
            distanceKm: currentDistanceKm,
            etaMinutes: estimateETA(currentDistanceKm, speedKmh),
            radiusKm,
          });
        }
      }
    }
  }, [
    currentDistanceKm,
    transferDistanceKm,
    alarmStatus,
    radiusKm,
    destinationName,
    speedKmh,
    transferStation,
    transferAlertTriggered,
  ]);

  // Handle Search Result
  const handleSelectPlace = (place: any) => {
    setDestination({
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setDestinationName(place.name);
    speechService.resetMilestones();
  };

  // Handle Map Pin Drop
  const handleMapSelect = (coord: Coordinates) => {
    setDestination(coord);
    setDestinationName('Selected transit stop');
    speechService.resetMilestones();
  };

  // Handle Route Preset Selection or Flip
  const handleRouteSelected = (preset: CommutePreset) => {
    setDestination(preset.destinationCoords);
    setDestinationName(preset.destinationName);
    setCurrentLocation(preset.originCoords);
    setRadiusKm(preset.radiusKm);
    setTransferStation(preset.transfer);
    setTransferAlertTriggered(false);
    speechService.resetMilestones();
  };

  // Handle Desktop Route Sync
  const handleSyncRoute = (payload: RouteSyncPayload) => {
    setDestination(payload.destination);
    setDestinationName(payload.destinationName);
    setRadiusKm(payload.radiusKm);
    if (payload.origin) {
      setCurrentLocation(payload.origin);
    }
    setTransferStation(payload.transfer);
    setTransferAlertTriggered(false);
    speechService.resetMilestones();
  };

  // Handle 1-Tap WhatsApp "Peace of Mind" Arrival Share
  const handleShareWhatsApp = () => {
    const url = generateWhatsAppEtaUrl({
      destinationName,
      distanceKm: currentDistanceKm,
      etaMinutes: estimateETA(currentDistanceKm || 0, speedKmh),
      speedKmh,
      radiusKm,
    });
    Linking.openURL(url).catch(() => {});
  };

  // Start Real GPS Alarm Tracking
  const handleStartTracking = () => {
    if (!destination) {
      Alert.alert('Select Destination', 'Please select a destination stop first.');
      return;
    }

    clearSnoozeTimer();
    speechService.resetMilestones();
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setIsSimulating(false);

    // Trigger Interstitial Ad before tracking begins (Monetization)
    adService.triggerInterstitial(() => {
      setAlarmStatus('TRACKING');
      locationService.startTracking((loc, speed) => {
        setCurrentLocation(loc);
        if (speed !== null) setSpeedKmh(speed);
      });
    });
  };

  // Stop Tracking
  const handleStopTracking = () => {
    clearSnoozeTimer();
    locationService.stopTracking();
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setIsSimulating(false);
    setAlarmStatus('IDLE');
    alarmManager.stopAlarm();
    notificationService.cancelAlert();
  };

  // Commute Simulator: Simulates a vehicle approaching from 8.5 km away down to 3.8 km
  const handleStartSimulation = () => {
    if (!destination) return;

    clearSnoozeTimer();
    locationService.stopTracking();
    speechService.resetMilestones();

    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    setIsSimulating(true);
    setAlarmStatus('TRACKING');

    // Place vehicle 8.5 km away
    let offsetLat = 0.076;
    setCurrentLocation({
      latitude: destination.latitude + offsetLat,
      longitude: destination.longitude,
    });

    simulationTimerRef.current = setInterval(() => {
      offsetLat -= 0.012;
      if (offsetLat < 0.02) {
        offsetLat = 0.025; // ~2.8 km (inside 4.0 km zone)
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }

      setCurrentLocation({
        latitude: destination.latitude + offsetLat,
        longitude: destination.longitude,
      });
    }, 1500);
  };

  // Instant Alarm Trigger (Jump to 3.8 km)
  const handleInstantTrigger = () => {
    if (!destination) return;
    clearSnoozeTimer();
    locationService.stopTracking();
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    setIsSimulating(false);
    setCurrentLocation({
      latitude: destination.latitude + 0.031,
      longitude: destination.longitude,
    });
    setAlarmStatus('TRACKING');
  };

  // Dismiss Alarm Modal (Arrival Complete)
  const handleAlarmDismiss = () => {
    clearSnoozeTimer();
    locationService.stopTracking();
    setAlarmStatus('IDLE');
    setIsSimulating(false);
    notificationService.cancelAlert();
    alarmManager.stopAlarm();
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  };

  // Snooze Alarm (alert again in 1 minute)
  const handleAlarmSnooze = () => {
    clearSnoozeTimer();
    setAlarmStatus('SNOOZED');
    notificationService.cancelAlert();
    alarmManager.stopAlarm();
    snoozeTimerRef.current = setTimeout(() => {
      setAlarmStatus('TRIGGERED');
      notificationService.triggerArrivalAlert({
        destinationName,
        distanceKm: currentDistanceKm || 0,
        etaMinutes: 1,
        radiusKm,
      });
    }, 60000);
  };

  const handleResetApp = () => {
    handleStopTracking();
    setDestination(null);
    setDestinationName('');
    setTransferStation(undefined);
    setTransferAlertTriggered(false);
    speechService.resetMilestones();
    setCurrentLocation({ latitude: 12.9784, longitude: 77.6408 });
  };

  const openLegalTab = (tab: LegalTabId) => {
    setLegalInitialTab(tab);
    setLegalModalVisible(true);
  };

  const handleTogglePowerOverride = () => {
    const next = !manualOverride;
    powerManager.setManualOverride(next);
    setManualOverride(next);
  };

  return (
    <ErrorBoundary onReset={handleResetApp}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        {/* Multitasking: Floating Transit HUD Widget */}
        {floatingHudEnabled && (
          <FloatingTransitHud
            destinationName={destinationName}
            distanceKm={currentDistanceKm}
            speedKmh={speedKmh}
            etaMinutes={estimateETA(currentDistanceKm || 0, speedKmh)}
            radiusKm={radiusKm}
            isAlarmTriggered={alarmStatus === 'TRIGGERED'}
            onDismissAlarm={handleAlarmDismiss}
            onSnoozeAlarm={handleAlarmSnooze}
            onCloseHud={() => setFloatingHudEnabled(false)}
          />
        )}

        {/* Privacy & Consent Banner */}
        <ConsentBanner onOpenPrivacyPolicy={() => openLegalTab('privacy')} />

        {/* Legal & Compliance Modal */}
        <LegalModal
          visible={legalModalVisible}
          initialTab={legalInitialTab}
          onClose={() => setLegalModalVisible(false)}
        />

        {/* Settings, Account & Notification Modal */}
        <SettingsModal
          visible={settingsModalVisible}
          onClose={() => setSettingsModalVisible(false)}
          onOpenLegal={openLegalTab}
          floatingHudEnabled={floatingHudEnabled}
          onToggleFloatingHud={() => setFloatingHudEnabled(!floatingHudEnabled)}
          onOpenPrimeModal={() => setPrimeModalVisible(true)}
        />

        {/* TransitWake Prime Micro-Subscription Modal */}
        <PrimeModal
          visible={primeModalVisible}
          onClose={() => setPrimeModalVisible(false)}
        />

        {/* Interstitial Ad Popup Modal */}
        <InterstitialAdModal />

        {/* Emergency Full-Screen Wake-up Alarm & Post-Trip Relief Summary */}
        <AlarmTriggerModal
          visible={alarmStatus === 'TRIGGERED'}
          destinationName={destinationName}
          distanceKm={currentDistanceKm || 0}
          radiusKm={radiusKm}
          onDismiss={handleAlarmDismiss}
          onSnooze={handleAlarmSnooze}
          onOpenPrime={() => setPrimeModalVisible(true)}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Navigation & Status Header */}
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.locationTitleRow}>
                <View style={styles.headerStatusDot} />
                <Text style={styles.locationCity}>TransitWake</Text>
              </View>
              <Text style={styles.locationSubText} numberOfLines={1}>
                {destinationName || 'Select destination stop on map'}
              </Text>
            </View>

            <View style={styles.headerRightButtons}>
              <TouchableOpacity
                style={[styles.headerPrimeBtn, isAdFree && styles.headerPrimeBtnActive]}
                onPress={() => setPrimeModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={isAdFree ? 'TransitWake Prime active' : 'Upgrade to Prime for 26 rupees per month'}
              >
                <View style={[styles.primeDot, isAdFree && styles.primeDotActive]} />
                <Text style={[styles.headerPrimeText, isAdFree && styles.headerPrimeTextActive]}>
                  {isAdFree ? 'Prime' : 'Prime ₹26'}
                </Text>
              </TouchableOpacity>

              <UserAvatar
                user={user}
                onPress={() => setSettingsModalVisible(true)}
              />

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setSettingsModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open app settings and privacy"
              >
                <Text style={styles.headerIconText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerLegalBtn}
                onPress={() => openLegalTab('compliance')}
                accessibilityRole="button"
                accessibilityLabel="View verified 20-point store compliance audit"
              >
                <Text style={styles.headerLegalText}>Audit 20/20</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 1-Tap Home <-> Work Route Preset Flip with Multi-Leg Interchange */}
          <RouteFlipBar
            onRouteSelected={handleRouteSelected}
            onOpenPrime={() => setPrimeModalVisible(true)}
          />

          {/* Underground Metro Tunnel Offline Mode Indicator */}
          {isOffline && (
            <View
              style={styles.offlineBanner}
              accessible={true}
              accessibilityRole="alert"
              accessibilityLabel="Subway tunnel offline mode active: using cached map tiles and routes"
            >
              <View style={styles.offlineDot} />
              <Text style={styles.offlineBannerText}>
                Subway tunnel mode active: using cached map tiles and offline station search
              </Text>
            </View>
          )}

          {/* Smart Battery Saver Status */}
          <PowerSaverIndicator
            currentTier={powerTier.level}
            savingsPercentage={powerTier.savingsPercentage}
            onToggleOverride={handleTogglePowerOverride}
            manualOverride={manualOverride}
          />

          {/* Live Transit Tracking Card */}
          {alarmStatus === 'TRACKING' && (
            <View style={styles.liveDeliveryCard} accessible={true} accessibilityRole="summary">
              {/* Top Status Row */}
              <View style={styles.deliveryTopRow}>
                <View style={styles.deliveryStatusRow}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.deliveryStatusText}>In transit</Text>
                </View>
                <View style={styles.etaBadge}>
                  <Text style={styles.etaText}>
                    ~{estimateETA(currentDistanceKm || 0, speedKmh)} min remaining
                  </Text>
                </View>
              </View>

              {/* Multi-Leg Interchange Indicator */}
              {transferStation && !transferAlertTriggered && (
                <View style={styles.multiLegBadge}>
                  <Text style={styles.multiLegBadgeText}>
                    Leg 1: Next stop {transferStation.name} (Interchange in {formatDistance(transferDistanceKm)})
                  </Text>
                </View>
              )}

              {/* Destination Name */}
              <Text style={styles.deliveryHeading}>
                Heading to {destinationName}
              </Text>

              {/* Progress Milestones */}
              <View style={styles.milestoneBar}>
                <View style={styles.milestoneStepActive}>
                  <View style={styles.milestoneDotActive} />
                  <Text style={styles.milestoneLabelActive}>Departed</Text>
                </View>
                <View style={styles.milestoneLineActive} />
                <View style={styles.milestoneStepActive}>
                  <View style={styles.milestoneDotActive} />
                  <Text style={styles.milestoneLabelActive}>In transit</Text>
                </View>
                <View style={styles.milestoneLineInactive} />
                <View style={styles.milestoneStepInactive}>
                  <View style={styles.milestoneDotInactive} />
                  <Text style={styles.milestoneLabelInactive}>Wake-up zone</Text>
                </View>
              </View>

              {/* Metrics Well */}
              <View style={styles.riderMetricsWell}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Distance</Text>
                  <Text style={styles.metricValueOrange}>
                    {formatDistance(currentDistanceKm)}
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Alarm radius</Text>
                  <Text style={styles.metricValue}>
                    {radiusKm.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Speed</Text>
                  <Text style={styles.metricValue}>
                    {speedKmh ? `${Math.round(speedKmh)} km/h` : '45 km/h'}
                  </Text>
                </View>
              </View>

              {/* 1-Tap WhatsApp Peace of Mind Arrival Share */}
              <TouchableOpacity
                style={styles.whatsAppCommuteBtn}
                onPress={handleShareWhatsApp}
                accessibilityRole="button"
                accessibilityLabel="Share live arrival status on WhatsApp"
              >
                <View style={styles.whatsAppDot} />
                <Text style={styles.whatsAppCommuteBtnText}>Share live ETA on WhatsApp</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search for Destination & Desktop Route Sync */}
          <SearchBar
            onSelectPlace={handleSelectPlace}
            onSyncRoute={handleSyncRoute}
          />

          {/* Map & Geofence Display */}
          <MapPicker
            currentLocation={currentLocation}
            destination={destination}
            destinationName={destinationName}
            radiusKm={radiusKm}
            onSelectCoordinate={handleMapSelect}
          />

          {/* Distance Radius Selector */}
          <DistanceSelector
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
          />

          {/* Primary Action CTA */}
          <View style={styles.actionContainer}>
            {alarmStatus === 'IDLE' ? (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStartTracking}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Activate ${radiusKm.toFixed(1)} kilometer destination alarm`}
                accessibilityHint="Starts background GPS tracking and sets the wake-up alarm"
              >
                <View style={styles.startBtnLeft}>
                  <Text style={styles.startBtnTitle}>
                    Activate {radiusKm.toFixed(1)} km alarm
                  </Text>
                </View>
                <View style={styles.startBtnRight}>
                  <Text style={styles.startBtnTag}>Local GPS • Free</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={handleStopTracking}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Cancel alarm and stop tracking"
              >
                <Text style={styles.stopBtnText}>Cancel alarm</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Commute Simulator */}
          <SimulationControls
            isSimulating={isSimulating}
            distanceKm={currentDistanceKm}
            onStartSimulation={handleStartSimulation}
            onInstantTrigger={handleInstantTrigger}
            onStopSimulation={handleStopTracking}
          />

          {/* Compliance Footer */}
          <View style={styles.footerContainer} accessible={true} accessibilityRole="contentinfo">
            <TouchableOpacity
              style={styles.complianceHeroBanner}
              onPress={() => openLegalTab('compliance')}
              accessibilityRole="button"
              accessibilityLabel="View verified 20-point store compliance checklist"
            >
              <View style={styles.complianceHeroBadge}>
                <Text style={styles.complianceHeroBadgeText}>Verified</Text>
              </View>
              <View style={styles.complianceHeroCol}>
                <Text style={styles.complianceHeroTitle}>Verified 20-point store compliance</Text>
                <Text style={styles.complianceHeroSub}>
                  RAM-only GPS • Zero accounts • 1-tap delete
                </Text>
              </View>
              <Text style={styles.complianceHeroChevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.footerLinksRow}>
              <TouchableOpacity onPress={() => openLegalTab('compliance')}>
                <Text style={styles.footerLink}>20-Point Audit</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('privacy')}>
                <Text style={styles.footerLink}>Privacy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('terms')}>
                <Text style={styles.footerLink}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('pricing')}>
                <Text style={styles.footerLink}>Refund</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('cookies')}>
                <Text style={styles.footerLink}>Cookies</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('sdks')}>
                <Text style={styles.footerLink}>SDKs</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('email')}>
                <Text style={styles.footerLink}>Opt-Out</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => openLegalTab('delete')}>
                <Text style={[styles.footerLink, styles.footerDeleteLink]}>Delete Data</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.businessText}>
              {BUSINESS_DETAILS.entityName} • {BUSINESS_DETAILS.address}
            </Text>
            <Text style={styles.businessSubText}>
              {PRICING_DISCLOSURE.summary} • Contact: {BUSINESS_DETAILS.supportEmail}
            </Text>
            <Text style={styles.coppaText}>
              Intended for commuters 13+. All GPS calculations executed strictly locally on device.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky Monetization Banner Ad (Google AdMob) */}
        {alarmStatus !== 'TRIGGERED' && alarmStatus !== 'SNOOZED' && !isAdFree && (
          <BannerAdComponent />
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = appStyles;

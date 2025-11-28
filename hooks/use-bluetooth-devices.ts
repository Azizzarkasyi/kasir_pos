import type { DeviceItem } from "@/components/atoms/device-list";
import { useMemo, useState } from "react";

// NOTE: BleManager is temporarily disabled to prevent crashes in Expo Go / Dev Client without native module.
// To enable, uncomment the import and the real implementation below.
// import BleManager, {
//   BleScanCallbackType,
//   BleScanMatchMode,
//   BleScanMode,
//   Peripheral,
// } from "react-native-ble-manager";

export type BluetoothDeviceItem = DeviceItem;

const SECONDS_TO_SCAN = 5;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = false;

export function useBluetoothDevices() {
  const [devices, setDevices] = useState<BluetoothDeviceItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>("Bluetooth module not loaded (Dev Mode)");
  const [hasPermission, setHasPermission] = useState<boolean | null>(true);

  const startScan = () => {
    console.warn("Bluetooth scan disabled in dev mode without native module.");
  };

  const stopScan = () => {
    console.warn("Bluetooth scan disabled.");
  };

  return useMemo(
    () => ({ devices, isScanning, error, startScan, stopScan, hasPermission }),
    [devices, isScanning, error, hasPermission]
  );
}

/*
// ORIGINAL IMPLEMENTATION
export function useBluetoothDevices() {
  const [devices, setDevices] = useState<BluetoothDeviceItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isInitialized = useRef(false);

  // Handler untuk discover peripheral
  const handleDiscoverPeripheral = useCallback((peripheral: Peripheral) => {
    
    const name =
      peripheral.name ?? peripheral.advertising?.localName ?? "Unknown Device";
    const mac = peripheral.id;

    setDevices((prev) => {
      if (prev.some((d) => d.mac === mac)) {
        return prev;
      }
      return [...prev, { name, mac }];
    });
  }, []);

  // Handler untuk stop scan
  const handleStopScan = useCallback((args: any) => {
    setIsScanning(false);
  }, []);

  // Initialize BleManager dan pasang listeners - semua di satu useEffect
  useEffect(() => {
    if (Platform.OS !== "android" && Platform.OS !== "ios") {
      setError("Bluetooth hanya didukung di perangkat Android / iOS.");
      return;
    }

    // Start BleManager
    BleManager.start({ showAlert: false })
      .then(() => {
        console.debug("[BleManager] started successfully");
        isInitialized.current = true;
      })
      .catch((e) => {
        console.error("[BleManager] failed to start", e);
        setError(e?.message ?? "Gagal menginisialisasi Bluetooth manager.");
      });

    // Pasang event listeners
    const listeners = [
      BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      BleManager.onStopScan(handleStopScan),
    ];

    // Handle Android permissions
    requestBluetoothPermissions();

    return () => {
      console.debug("[useBluetoothDevices] unmounting, removing listeners...");
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, [handleDiscoverPeripheral, handleStopScan]);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === "android") {
      const permissions: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS][] = [];
      
      if (Platform.Version >= 23 && Platform.Version <= 30) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      } else if (Platform.Version >= 31) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }

      if (permissions.length === 0) {
        setHasPermission(true);
        return true;
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      console.debug("[requestBluetoothPermissions] result", granted);
      
      const allGranted = Object.values(granted).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );
      
      setHasPermission(allGranted);
      return allGranted;
    }
    
    // iOS
    setHasPermission(true);
    return true;
  };

  const startScan = useCallback(() => {
    if (isScanning) {
      console.debug("[startScan] already scanning, skip");
      return;
    }

    if (!isInitialized.current) {
      console.debug("[startScan] BleManager not initialized yet");
      setError("Bluetooth manager belum siap. Coba lagi.");
      return;
    }

    // Reset devices sebelum scan
    setDevices([]);
    setError(null);
    setIsScanning(true);

    console.debug("[startScan] starting scan...");
    BleManager.scan({
      serviceUUIDs: SERVICE_UUIDS,
      seconds: SECONDS_TO_SCAN,
      allowDuplicates: ALLOW_DUPLICATES,
      matchMode: BleScanMatchMode.Sticky,
      scanMode: BleScanMode.LowLatency,
      callbackType: BleScanCallbackType.AllMatches,
    })
      .then(() => {
        console.debug("[startScan] scan promise returned successfully");
      })
      .catch((e: any) => {
        console.error("[startScan] scan error", e);
        setError(e?.message ?? "Gagal memulai scan Bluetooth.");
        setIsScanning(false);
      });
  }, [isScanning]);

  const stopScan = useCallback(() => {
    if (!isScanning) return;
    console.debug("[stopScan] stopping scan...");
    BleManager.stopScan()
      .then(() => {
        console.debug("[stopScan] scan stopped");
        setIsScanning(false);
      })
      .catch(() => {
        setIsScanning(false);
      });
  }, [isScanning]);

  return useMemo(
    () => ({ devices, isScanning, error, startScan, stopScan, hasPermission }),
    [devices, isScanning, error, startScan, stopScan, hasPermission]
  );
}
*/

import type { DeviceItem } from "@/components/atoms/device-list";
import { useScannerStore, type ScannerConnectionType } from "@/stores/scanner-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import RNBluetoothClassic, {
    type BluetoothDevice,
} from "react-native-bluetooth-classic";

export type ScannerDeviceItem = DeviceItem;

export function useScannerDevice() {
    const [devices, setDevices] = useState<ScannerDeviceItem[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [connectedDeviceInstance, setConnectedDeviceInstance] = useState<BluetoothDevice | null>(null);
    const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

    // Use Zustand store for persistent state
    const {
        savedDevice,
        isConnected,
        isConnecting,
        isScanning,
        error,
        setSavedDevice,
        clearSavedDevice,
        setIsConnected,
        setIsConnecting,
        setIsScanning,
        setError,
    } = useScannerStore();

    useEffect(() => {
        if (Platform.OS !== "android") {
            setError("Bluetooth Classic hanya didukung di perangkat Android.");
            return;
        }

        requestBluetoothPermissions();
    }, []);

    // Auto-reconnect to saved device on mount (only for Bluetooth)
    useEffect(() => {
        if (savedDevice && savedDevice.connectionType === "bluetooth" && !isConnected && !isConnecting && hasPermission) {
            console.debug("[useScannerDevice] Auto-reconnecting to saved device:", savedDevice.address);
            connectToDevice(savedDevice.address, savedDevice.name, "bluetooth");
        }
    }, [savedDevice, hasPermission]);

    // Listen for barcode data when connected
    useEffect(() => {
        if (!connectedDeviceInstance || !isConnected) return;

        console.debug("[useScannerDevice] Setting up barcode listener...");

        const subscription = connectedDeviceInstance.onDataReceived((data) => {
            console.debug("[useScannerDevice] Received data:", data.data);
            const barcode = data.data.trim();
            if (barcode) {
                setLastScannedBarcode(barcode);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [connectedDeviceInstance, isConnected]);

    const requestBluetoothPermissions = async () => {
        if (Platform.OS === "android") {
            const permissions: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS][] = [];

            if (Platform.Version >= 23 && Platform.Version <= 30) {
                permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            } else if (Platform.Version >= 31) {
                permissions.push(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
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

    const startScan = useCallback(async () => {
        if (isScanning) {
            console.debug("[startScan] already scanning, skip");
            return;
        }

        if (Platform.OS !== "android") {
            setError("Bluetooth Classic hanya didukung di perangkat Android.");
            return;
        }

        const granted = await requestBluetoothPermissions();
        if (!granted) {
            setError("Izin Bluetooth / lokasi diperlukan untuk melakukan scan.");
            return;
        }

        try {
            const enabled = await RNBluetoothClassic.isBluetoothEnabled();
            if (!enabled) {
                await RNBluetoothClassic.requestBluetoothEnabled();
            }
        } catch (e: any) {
            console.error("[startScan] failed ensuring bluetooth enabled", e);
            setError(e?.message ?? "Bluetooth perlu diaktifkan untuk melakukan scan.");
            return;
        }

        setDevices([]);
        setError(null);
        setIsScanning(true);

        try {
            console.debug("[startScan] starting discovery...");
            const discovered: BluetoothDevice[] =
                await RNBluetoothClassic.startDiscovery();

            const mapped: ScannerDeviceItem[] = discovered.map((d) => ({
                name: d.name || d.address || "Unknown Device",
                mac: d.address,
            }));

            setDevices(mapped);
        } catch (e: any) {
            console.error("[startScan] discovery error", e);
            setError(e?.message ?? "Gagal memulai scan Bluetooth.");
        } finally {
            setIsScanning(false);
        }
    }, [isScanning, setError, setIsScanning]);

    const stopScan = useCallback(() => {
        if (!isScanning) return;
        console.debug("[stopScan] cancelling discovery...");
        RNBluetoothClassic.cancelDiscovery()
            .catch((e: any) => {
                console.error("[stopScan] cancel discovery error", e);
            })
            .finally(() => {
                setIsScanning(false);
            });
    }, [isScanning, setIsScanning]);

    const connectToDevice = useCallback(async (
        mac: string,
        deviceName?: string,
        connectionType: ScannerConnectionType = "bluetooth"
    ) => {
        if (!mac) return null;

        setIsConnecting(true);
        setError(null);

        try {
            console.debug("[connectToDevice] connecting to", mac, "via", connectionType);

            if (connectionType === "bluetooth") {
                const device = await RNBluetoothClassic.connectToDevice(mac);

                // Save device to store and persist to AsyncStorage
                const name = deviceName || device.name || mac;
                await setSavedDevice({ name, address: mac, connectionType });
                setIsConnected(true);
                setConnectedDeviceInstance(device);

                return device;
            } else {
                // USB connection - for now just save as connected
                // USB scanners typically work as keyboard input, no special connection needed
                const name = deviceName || "USB Scanner";
                await setSavedDevice({ name, address: mac || "usb", connectionType: "usb" });
                setIsConnected(true);
                return null;
            }
        } catch (e: any) {
            console.error("[connectToDevice] error", e);
            setError(e?.message ?? "Gagal menghubungkan perangkat.");
            setIsConnected(false);
            throw e;
        } finally {
            setIsConnecting(false);
        }
    }, [setSavedDevice, setIsConnected, setIsConnecting, setError]);

    const disconnect = useCallback(async () => {
        if (connectedDeviceInstance) {
            try {
                console.debug("[disconnect] disconnecting from", connectedDeviceInstance.address);
                await connectedDeviceInstance.disconnect();
            } catch (e: any) {
                console.error("[disconnect] error", e);
                setError(e?.message ?? "Gagal memutuskan koneksi perangkat.");
            }
        }
        setConnectedDeviceInstance(null);
        setIsConnected(false);
    }, [connectedDeviceInstance, setError, setIsConnected]);

    const forgetDevice = useCallback(async () => {
        await disconnect();
        await clearSavedDevice();
    }, [disconnect, clearSavedDevice]);

    const clearLastBarcode = useCallback(() => {
        setLastScannedBarcode(null);
    }, []);

    // Create a pseudo connectedDevice object for backward compatibility
    const connectedDevice = useMemo(() => {
        if (connectedDeviceInstance) {
            return connectedDeviceInstance;
        }
        // Return saved device info even if not actively connected (for display purposes)
        if (savedDevice) {
            return {
                name: savedDevice.name,
                address: savedDevice.address,
            } as BluetoothDevice;
        }
        return null;
    }, [connectedDeviceInstance, savedDevice]);

    return useMemo(
        () => ({
            devices,
            isScanning,
            isConnecting,
            error,
            startScan,
            stopScan,
            hasPermission,
            connectToDevice,
            disconnect,
            forgetDevice,
            connectedDevice,
            isConnected,
            savedDevice,
            connectedDeviceInstance,
            lastScannedBarcode,
            clearLastBarcode,
        }),
        [
            devices,
            isScanning,
            isConnecting,
            error,
            startScan,
            stopScan,
            hasPermission,
            connectToDevice,
            disconnect,
            forgetDevice,
            connectedDevice,
            isConnected,
            savedDevice,
            connectedDeviceInstance,
            lastScannedBarcode,
            clearLastBarcode,
        ],
    );
}

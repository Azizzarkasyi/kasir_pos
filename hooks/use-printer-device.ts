import type { DeviceItem } from "@/components/atoms/device-list";
import { usePrinterStore } from "@/stores/printer-store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import RNBluetoothClassic, {
    type BluetoothDevice,
} from "react-native-bluetooth-classic";

export type PrinterDeviceItem = DeviceItem;

export function usePrinterDevice() {
    const [devices, setDevices] = useState<PrinterDeviceItem[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [connectedDeviceInstance, setConnectedDeviceInstance] = useState<BluetoothDevice | null>(null);

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
    } = usePrinterStore();

    useEffect(() => {
        if (Platform.OS !== "android") {
            setError("Bluetooth Classic hanya didukung di perangkat Android.");
            return;
        }

        requestBluetoothPermissions();
    }, []);

    // Auto-reconnect to saved device on mount
    useEffect(() => {
        if (savedDevice && !isConnected && !isConnecting && hasPermission) {
            console.debug("[usePrinterDevice] Auto-reconnecting to saved device:", savedDevice.address);
            connectToDevice(savedDevice.address, savedDevice.name);
        }
    }, [savedDevice, hasPermission]);

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

            const mapped: PrinterDeviceItem[] = discovered.map((d) => ({
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

    const connectToDevice = useCallback(async (mac: string, deviceName?: string) => {
        if (!mac) return null;

        setIsConnecting(true);
        setError(null);

        try {
            console.debug("[connectToDevice] connecting to", mac);
            const device = await RNBluetoothClassic.connectToDevice(mac);

            // Save device to store and persist to AsyncStorage
            const name = deviceName || device.name || mac;
            await setSavedDevice({ name, address: mac });
            setIsConnected(true);
            setConnectedDeviceInstance(device);

            return device;
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
        if (!connectedDeviceInstance) return;

        try {
            console.debug("[disconnect] disconnecting from", connectedDeviceInstance.address);
            await connectedDeviceInstance.disconnect();
        } catch (e: any) {
            console.error("[disconnect] error", e);
            setError(e?.message ?? "Gagal memutuskan koneksi perangkat.");
        } finally {
            setConnectedDeviceInstance(null);
            setIsConnected(false);
        }
    }, [connectedDeviceInstance, setError, setIsConnected]);

    const forgetDevice = useCallback(async () => {
        await disconnect();
        await clearSavedDevice();
    }, [disconnect, clearSavedDevice]);

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
        ],
    );
}

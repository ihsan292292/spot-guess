import { useState, useEffect } from 'react';

interface CameraPermission {
    hasPermission: boolean | null;
    canRequest: boolean; 
    requestPermission: () => void;
}

export const useCameraPermission = (): CameraPermission => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [canRequest, setCanRequest] = useState<boolean>(true);

    const requestPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
        } catch (error) {
            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setHasPermission(false); // User denied permission
                    setCanRequest(false); // Can't request permission anymore
                }
            }
        }
    };

    useEffect(() => {
        // Check initial camera permission on component mount
        const checkPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasPermission(true); // If we successfully get the stream, permission is granted
                stream.getTracks().forEach((track) => track.stop()); // Stop the stream immediately
            } catch (error) {
                if (error instanceof DOMException) {
                    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                        setHasPermission(false); // User denied permission
                        setCanRequest(false); // Can't request permission anymore
                    } else {
                        setCanRequest(true); // Permission might still be requestable
                    }
                }
            }
        };
        checkPermission();
    }, []);

    return {
        hasPermission,
        canRequest,
        requestPermission
    };
};

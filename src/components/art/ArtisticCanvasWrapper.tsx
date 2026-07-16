import React, { useState, useEffect } from 'react';
import { isArtMode } from '../../store/modeStore';
import ArtisticCanvas from './ArtisticCanvas';

export default function ArtisticCanvasWrapper() {
    const [active, setActive] = useState(isArtMode.get());

    useEffect(() => {
        const unsubscribe = isArtMode.subscribe(setActive);
        return unsubscribe;
    }, []);

    if (!active) return null;
    
    return <ArtisticCanvas />;
}

import React from 'react';

interface DesignElement {
    id: string;
    type: 'text' | 'image';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    letterSpacing?: number;
}

export interface DesignPreviewProps {
    design: any; 
    view: 'front' | 'back'; 
    hideMockup?: boolean;
    isExporting?: boolean;
    lightBg?: boolean;
    hideGuides?: boolean;
}

export const DesignPreview = React.forwardRef<HTMLDivElement, DesignPreviewProps>(({ design, view, hideMockup = false, isExporting = false, lightBg = false, hideGuides = false }, externalRef) => {

    const localRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = React.useState(0);

    React.useEffect(() => {
        if (!localRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        
        observer.observe(localRef.current);
        setContainerWidth(localRef.current.getBoundingClientRect().width);
        
        return () => observer.disconnect();
    }, []);

    // Robust parsing
    const designObj = React.useMemo(() => {
        if (!design) return { elements: { front: [], back: [] }, color: '#FFFFFF' };
        if (typeof design === 'string') {
            try {
                return JSON.parse(design);
            } catch (e) {
                console.error("Failed to parse design_data", e);
                return { elements: { front: [], back: [] }, color: '#FFFFFF' };
            }
        }
        return design;
    }, [design]);

    // Compatible with both 'elements' and 'elementsMap'
    const elements = designObj?.elements?.[view] || designObj?.elementsMap?.[view] || [];
    const color = designObj?.color || '#FFFFFF';
    const isBack = view === 'back';

    // Dynamic Assets: Priority to saved assets, fallback to defaults
    let assetUrl = isBack 
        ? (designObj?.assets?.back || '/images/custom_design_builder/franela_blanca_sin_fondo_back.png')
        : (designObj?.assets?.front || '/images/custom_design_builder/franela_blanca_sin_fondo.png');

    if (designObj?.product?.id === 'hoodie') {
        assetUrl = isBack 
            ? (designObj?.assets?.back || '/images/custom_design_builder/hoodie_sin_fondo_back.png')
            : (designObj?.assets?.front || '/images/custom_design_builder/hoodie_sin_fondo_front.png');
    }

    // Mathematical Mirror Scale: Scale internal 1000px box to current container width
    const mirrorScale = containerWidth > 0 ? containerWidth / 1000 : 1;

    return (
        <div 
            ref={(node) => {
                if (typeof externalRef === 'function') {
                    externalRef(node);
                } else if (externalRef) {
                    (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            style={{
                position: 'relative',
                borderRadius: lightBg ? '0' : '16px',
                overflow: 'hidden',
                boxShadow: (lightBg || hideMockup) ? 'none' : '0 25px 50px rgba(0,0,0,0.5)',
                transition: 'all 0.4s ease',
                width: isExporting && containerWidth > 0 ? `${containerWidth}px` : '100%',
                maxWidth: '600px',
                margin: '0 auto',
                aspectRatio: '1000 / 1220',
                backgroundColor: (hideMockup || lightBg) ? 'transparent' : '#09090b',
                border: (hideMockup || lightBg) ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}
        >
            {/* INJECT FONTS FOR PERFECT RENDERING IN CRM */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;700;900&family=Caveat:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');
            `}} />

            <div 
                ref={(node) => {
                    (localRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }}
                data-preview-version="1.2.0-perfect-sync"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
                {/* === SINGLE 1000px COORDINATE BOX (MOCKUP + ELEMENTS TOGETHER) === */}
                {/* This matches EXACTLY how DesignStudio renders it — guaranteed pixel sync */}
                <div 
                    style={{ 
                        width: '1000px', 
                        height: '1100px', 
                        position: 'absolute', 
                        top: `${60 * mirrorScale}px`, 
                        left: '50%',
                        transform: `scale(${mirrorScale})`,
                        marginLeft: `-${500 * mirrorScale}px`,
                        transformOrigin: '0 0',
                        backgroundColor: 'transparent', 
                        zIndex: 10
                    }}
                >
                    {/* 1. MOCKUP LAYER */}
                    {!hideMockup && (
                        <>
                            <img 
                                src={assetUrl} 
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center' }} 
                                alt="" 
                            />
                            <div 
                                style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    backgroundColor: color,
                                    maskImage: `url(${assetUrl})`,
                                    maskSize: 'contain',
                                    maskRepeat: 'no-repeat',
                                    maskPosition: 'top center',
                                    WebkitMaskImage: `url(${assetUrl})`,
                                    WebkitMaskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'top center',
                                    mixBlendMode: 'multiply',
                                    opacity: color.toUpperCase() === '#FFFFFF' ? 0 : 0.85 
                                }} 
                            />
                            <img 
                                src={assetUrl} 
                                style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain', 
                                    objectPosition: 'top center',
                                    mixBlendMode: 'multiply',
                                    filter: 'brightness(1.1) contrast(1.1)',
                                    opacity: 0.9,
                                    pointerEvents: 'none'
                                }} 
                                alt="" 
                            />
                        </>
                    )}

                    {/* 2. DESIGN ELEMENTS (same coordinate space as Studio) */}
                    {elements.map((el: any) => (
                        <div
                            key={el.id}
                            style={{
                                position: 'absolute',
                                left: `${el.x}px`, 
                                top: `${el.y}px`,
                                width: `${el.width}px`,
                                height: `${el.height}px`,
                                transform: `rotate(${el.rotation}deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'visible',
                                zIndex: 100
                            }}
                        >
                            {el.type === 'image' ? (
                                <img src={el.content} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" crossOrigin="anonymous" />
                            ) : (
                                <div style={{ 
                                    color: el.color, 
                                    fontSize: `${el.fontSize || 30}px`,
                                    fontFamily: el.fontFamily,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    width: '100%',
                                    lineHeight: 1.1,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    letterSpacing: `${el.letterSpacing || 0}px`
                                }}>
                                    {el.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

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
}

interface DesignData {
    product: { name: string; type: string };
    color: string;
    elements: {
        front: DesignElement[];
        back: DesignElement[];
    };
}

const TShirtSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
        <path 
            d="M150,100 L110,130 L130,180 L160,165 L160,400 L340,400 L340,165 L370,180 L390,130 L350,100 C350,100 300,120 250,120 C200,120 150,100 150,100 Z" 
            fill={color}
            stroke="#000"
            strokeWidth="2"
        />
        <path d="M150,100 C150,100 200,120 250,120 C300,120 350,100 350,100" fill="none" stroke="#000" strokeWidth="2" />
        <rect x="190" y="160" width="120" height="180" fill="none" stroke="rgba(0,0,0,0.1)" strokeDasharray="4 4" />
    </svg>
);

const HoodieSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
        <path 
            d="M150,120 L110,140 L120,200 L160,180 L160,420 L340,420 L340,180 L380,200 L390,140 L350,120 L350,80 L250,60 L150,80 Z" 
            fill={color}
            stroke="#000"
            strokeWidth="2"
        />
        <path d="M160,320 C180,350 320,350 340,320" fill="none" stroke="#000" strokeWidth="1" />
        <rect x="190" y="180" width="120" height="180" fill="none" stroke="rgba(0,0,0,0.1)" strokeDasharray="4 4" />
    </svg>
);

const CompositeGarmentCanvas = ({ src, color, className }: { src: string, color: string, className?: string }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = img.width;
            canvas.height = img.height;
            
            // LAYER 1: Draw original base image
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // LAYER 2: Fill color mask with multiply + opacity
            if (color && color.toUpperCase() !== '#FFFFFF') {
                const offscreenColor = document.createElement('canvas');
                offscreenColor.width = canvas.width;
                offscreenColor.height = canvas.height;
                const offCtx = offscreenColor.getContext('2d');
                if (offCtx) {
                    offCtx.drawImage(img, 0, 0);
                    offCtx.globalCompositeOperation = 'source-in';
                    offCtx.fillStyle = color;
                    offCtx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.globalAlpha = 0.85;
                    ctx.drawImage(offscreenColor, 0, 0);
                    ctx.globalAlpha = 1.0;
                }
            }

            // LAYER 3: Texture/Shadows
            ctx.globalCompositeOperation = 'multiply';
            ctx.filter = 'brightness(1.05) contrast(1.05)';
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none'; // reset
        };
        img.src = src;
    }, [src, color]);

    return <canvas ref={canvasRef} className={className} />;
};

export interface DesignPreviewProps {
    design: any; 
    view: 'front' | 'back'; 
    hideMockup?: boolean;
    isExporting?: boolean;
}

export const DesignPreview = React.forwardRef<HTMLDivElement, DesignPreviewProps>(({ design, view, hideMockup = false, isExporting = false }, externalRef) => {

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
        // Initialization
        setContainerWidth(localRef.current.getBoundingClientRect().width);
        
        return () => observer.disconnect();
    }, []);

    // Robust parsing in case it's a JSON string
    const designObj = React.useMemo(() => {
        if (!design) return null;
        if (typeof design === 'string') {
            try {
                return JSON.parse(design);
            } catch (e) {
                console.error("Failed to parse design_data", e);
                return null;
            }
        }
        return design;
    }, [design]);

    if (!designObj || !designObj.elements) return <div className="text-zinc-500 text-xs italic">Sin datos de diseño interactivo</div>;
    
    const elements = designObj.elements[view] || [];
    const color = designObj.color || '#FFFFFF';
    const isBack = view === 'back';

    // Same assets as DesignStudio
    const assetUrl = isBack 
        ? '/images/custom_design_builder/franela_blanca_sin_fondo_back.png'
        : '/images/custom_design_builder/franela_blanca_sin_fondo.png';

    return (
        <div 
            ref={(node) => {
                // externalRef is needed for html2canvas from parent to capture the whole container with bounds
                if (typeof externalRef === 'function') {
                    externalRef(node);
                } else if (externalRef) {
                    (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all ${
                isExporting ? 'w-auto' : 'w-full'
            } ${hideMockup ? 'bg-transparent border-none' : 'bg-zinc-950 border border-white/5'}`}
            style={{
                // Hardcode absolute bounds during export to completely bypass percentage/flex/padding evaluation bugs in html2canvas
                width: isExporting && containerWidth > 0 ? `${containerWidth + 32}px` : undefined,
                height: isExporting && containerWidth > 0 ? `${(containerWidth * 1.1) + 32}px` : undefined,
            }}
        >
            {/* HTML2Canvas Aspect Ratio Spacer (1100/1000 = 1.1 = 110%) */}
            {!isExporting && (
                <div style={{ paddingTop: '110%', width: '100%', display: 'block' }}></div>
            )}

            <div className="absolute inset-0 p-4 flex items-center justify-center">
                <div 
                    ref={(node) => {
                        // localRef attached to the inner element to track the EXACT container width 
                        // excluding the 32px padding, so text percentage scaling calculates flawlessly.
                        (localRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    }}
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                        width: isExporting && containerWidth > 0 ? `${containerWidth}px` : undefined,
                        height: isExporting && containerWidth > 0 ? `${containerWidth * 1.1}px` : undefined,
                    }}
                >

                
                {!hideMockup && (
                    <CompositeGarmentCanvas 
                        src={assetUrl} 
                        color={color} 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                    />
                )}

                {/* 
                    DESIGN AREA - 100% SYNC WITH STUDIO
                    In the new VCS, elements are relative to the ENTIRE container (1:1.1 aspect).
                */}
                <div 
                    className="absolute inset-0"
                    style={{
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                >
                    {/* Visual Guide (Dashed Box) - Exactly matched from Studio 1000x1100 grid */}
                    {!isExporting && (
                        <div 
                            className="absolute border border-dashed border-white/20 pointer-events-none"
                            style={{
                                top: '25%', 
                                left: '26%', 
                                width: '48%', 
                                height: '54%', 
                            }}
                        />
                    )}

                    {elements.map((el: any) => {
                        // Dynamically compute exact pixel positions and dimensions during export
                        // so html2canvas doesn't guess based on percentage layouts
                        const usePx = isExporting && containerWidth > 0;
                        // containerWidth exactly matches the virtual width (no padding since localRef is inside p-4 now)
                        const scaleX = containerWidth / 1000;
                        const scaleY = (containerWidth * 1.1) / 1100; // Virtual height is 110% of virtual width
                        
                        const left = usePx ? `${el.x * scaleX}px` : `${(el.x / 1000) * 100}%`;
                        const top = usePx ? `${el.y * scaleY}px` : `${(el.y / 1100) * 100}%`;
                        const width = usePx ? `${el.width * scaleX}px` : `${(el.width / 1000) * 100}%`;
                        const height = usePx ? `${el.height * scaleY}px` : `${(el.height / 1100) * 100}%`;

                        return (
                            <div
                                key={el.id}
                                style={{
                                    position: 'absolute',
                                    left, 
                                    top,
                                    width,
                                    height,
                                    transform: `rotate(${el.rotation}deg)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'visible'
                                }}
                            >
                                {el.type === 'image' ? (
                                    <img src={el.content} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" crossOrigin="anonymous" />
                                ) : (
                                    <div style={{ 
                                        color: el.color, 
                                        fontSize: containerWidth > 0 ? `${(el.fontSize || 20) * scaleX}px` : `${((el.fontSize || 20) / 1000) * 100}cqi`, 
                                        fontFamily: el.fontFamily,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        width: '100%',
                                        lineHeight: 1.1,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        letterSpacing: `${((el.letterSpacing || 0) / 1000) * 100}cqi`
                                    }}>
                                        {el.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                </div>
            </div>
            </div>
            
            {!isExporting && (
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-2 py-1 bg-black/60 rounded text-[10px] text-zinc-300 uppercase font-bold tracking-widest border border-white/10 backdrop-blur-md">
                        Visualización Pro
                    </div>
                    <div className="px-2 py-1 bg-emerald-500/80 rounded text-[10px] text-white uppercase font-bold tracking-widest border border-white/10 backdrop-blur-md">
                        {view === 'front' ? 'Frente' : 'Espalda'}
                    </div>
                </div>
            )}
        </div>
    );
});


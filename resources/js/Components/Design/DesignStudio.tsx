import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper, Text, Stack, ActionIcon, Button, Tabs, ColorInput, Select, Slider, FileInput, Transition, Group, Card, SimpleGrid, rem, Tooltip, Title, FileButton } from '@mantine/core';
import {
    IconShirt, IconTextSize, IconUpload, IconTrash, IconRotate,
    IconMaximize, IconDeviceFloppy, IconChevronRight, IconChevronLeft,
    IconPlus, IconRefresh, IconArrowBackUp, IconArrowForwardUp,
    IconLayoutGrid, IconTypography, IconPhoto, IconSparkles,
    IconBolt, IconArrowsSort, IconArrowBarToUp, IconArrowBarToDown,
    IconArrowBigUp, IconArrowBigDown, IconMinus, IconZoomIn, IconZoomOut
} from '@tabler/icons-react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
type DesignElementType = 'text' | 'image';
type TabType = 'product' | 'text' | 'image' | 'designs';

interface DesignElement {
    id: string;
    type: DesignElementType;
    content: string; // Text string or Image URL
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    letterSpacing?: number;
    zIndex: number;
}

interface ProductAssets {
    front: string;
    back: string;
}

interface ProductType {
    id: string;
    name: string;
    basePrice: number;
    assets: {
        Caballero: ProductAssets;
        Dama: ProductAssets;
    };
}

const PRODUCTS: ProductType[] = [
    {
        id: 'hoodie',
        name: 'Hoodie Premium',
        basePrice: 35,
        assets: {
            Caballero: {
                front: '/images/custom_design_builder/hoodie_sin_fondo_front.png',
                back: '/images/custom_design_builder/hoodie_sin_fondo_back.png'
            },
            Dama: {
                front: '/images/custom_design_builder/hoodie_sin_fondo_front.png',
                back: '/images/custom_design_builder/hoodie_sin_fondo_back.png'
            }
        }
    },
    {
        id: 'oversize',
        name: 'T-Shirt Oversize',
        basePrice: 20,
        assets: {
            Caballero: {
                front: '/images/custom_design_builder/franela_blanca_sin_fondo.png',
                back: '/images/custom_design_builder/franela_blanca_sin_fondo_back.png'
            },
            Dama: {
                front: '/images/custom_design_builder/franela_blanca_sin_fondo.png',
                back: '/images/custom_design_builder/franela_blanca_sin_fondo_back.png'
            }
        }
    }
];

export const GARMENT_COLORS = [
    { label: 'Negro', value: '#1A1A1A' },
    { label: 'Blanco', value: '#FFFFFF' },
    { label: 'Beige', value: '#D5BEA4' },
    { label: 'Azul', value: '#1F2640' },
    { label: 'Verde Bosque', value: '#0B3022' },
    { label: 'Gris Carbón', value: '#4A4A4A' },
    { label: 'Rojo Vino', value: '#6B1B1B' },
    { label: 'Oliva', value: '#556B2F' },
    { label: 'Mostaza', value: '#E3B448' },
    { label: 'Melocotón', value: '#FFCCB6' },
    { label: 'Gris Lavanda', value: '#9696AF' },
];

const FONTS = [
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
    { label: 'Caveat', value: 'Caveat, cursive' },
    { label: 'Playfair Display', value: 'Playfair Display, serif' },
];

export interface DesignStudioProps {
    gender: 'Caballero' | 'Dama';
    initialData?: any; // For CRM editing
    design_data?: any; // For E-commerce hydration
    onSave: (data: any) => void;
    crmApiUrl?: string;
}

const VCS_WIDTH = 1000;
const VCS_HEIGHT = 1100;

export const DesignStudio: React.FC<DesignStudioProps> = ({ gender, design_data, initialData, onSave, crmApiUrl }) => {
    // Merge initialData and design_data for flexibility between CRM and eCommerce
    const incomingData = design_data || initialData;

    const [elementsMap, setElementsMap] = useState<Record<'front' | 'back', DesignElement[]>>({
        front: incomingData?.elements?.front || incomingData?.elementsMap?.front || [],
        back: incomingData?.elements?.back || incomingData?.elementsMap?.back || []
    });
    
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [product, setProduct] = useState(PRODUCTS.find(p => p.id === incomingData?.product?.id) || PRODUCTS[0]);
    const [color, setColor] = useState(incomingData?.color || GARMENT_COLORS[0].value);
    const [view, setView] = useState<'front' | 'back'>('front');
    const [activeTab, setActiveTab] = useState<TabType | null>('product');
    const [zoom, setZoom] = useState(100);
    const [studioScale, setStudioScale] = useState(1);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 992;

    const containerRef = useRef<HTMLDivElement>(null);
    const onSaveRef = useRef(onSave);
    useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

    useEffect(() => {
        if (isReady) {
            const timeoutId = setTimeout(() => {
                onSaveRef.current({
                    elements: elementsMap,
                    product: { id: product.id, name: product.name },
                    color,
                    view,
                    basePrice: product.basePrice,
                    assets: product.assets[gender]
                });
            }, 800);
            return () => clearTimeout(timeoutId);
        }
    }, [elementsMap, product, color, view, gender, isReady]);

    const elements = elementsMap[view];

    const parentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const updateScale = () => {
            if (!parentRef.current) return;
            const PADDING = isMobile ? 0 : 40;
            const availableW = parentRef.current.clientWidth - PADDING;
            const availableH = parentRef.current.clientHeight - PADDING;
            if (availableW <= 0) return;
            let scale = availableW / VCS_WIDTH;
            if (!isMobile) {
                scale = Math.min(availableW / VCS_WIDTH, availableH / VCS_HEIGHT);
            }
            setStudioScale(scale || 1);
            setIsReady(true);
        };
        const observer = new ResizeObserver(updateScale);
        if (parentRef.current) observer.observe(parentRef.current);
        updateScale();
        return () => observer.disconnect();
    }, [isMobile, product]);

    const getNextZIndex = () => {
        const allElements = [...elementsMap.front, ...elementsMap.back];
        if (allElements.length === 0) return 10;
        return Math.max(...allElements.map(el => el.zIndex)) + 1;
    };

    const addText = () => {
        const newEl: DesignElement = {
            id: Math.random().toString(),
            type: 'text',
            content: 'NUEVA AVENTURA',
            x: 250,
            y: 350,
            width: 500,
            height: 100,
            rotation: 0,
            fontSize: 40,
            fontFamily: FONTS[0].value,
            color: '#0B3022',
            letterSpacing: 2,
            zIndex: getNextZIndex()
        };
        setElementsMap(prev => ({ ...prev, [view]: [...prev[view], newEl] }));
        setSelectedId(newEl.id);
        setActiveTab('text');
    };

    const handleImageUpload = async (file: File | null) => {
        if (!file) return;
        const tempUrl = URL.createObjectURL(file);
        addImage(tempUrl);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadUrl = crmApiUrl ? `${crmApiUrl}/design-assets` : '/api/design-assets';
            const response = await axios.post(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.url) {
                setElementsMap(prev => ({
                    front: prev.front.map(el => el.content === tempUrl ? { ...el, content: response.data.url } : el),
                    back: prev.back.map(el => el.content === tempUrl ? { ...el, content: response.data.url } : el)
                }));
                setUploadedImages(prev => prev.map(u => u === tempUrl ? response.data.url : u));
            }
        } catch (err) { console.error(err); }
    };

    const addImage = (url: string) => {
        const newEl: DesignElement = {
            id: Math.random().toString(),
            type: 'image',
            content: url,
            x: 400,
            y: 450,
            width: 200,
            height: 200,
            rotation: 0,
            zIndex: getNextZIndex()
        };
        setElementsMap(prev => ({ ...prev, [view]: [...prev[view], newEl] }));
        setSelectedId(newEl.id);
        setActiveTab('image');
    };

    const updateElement = (id: string, updates: Partial<DesignElement>) => {
        setElementsMap(prev => ({
            ...prev,
            [view]: prev[view].map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const removeElement = (id: string) => {
        setElementsMap(prev => ({
            ...prev,
            [view]: prev[view].filter(el => el.id !== id)
        }));
        setSelectedId(null);
    };

    const selectedElement = elements.find(el => el.id === selectedId);
    const currentAssetUrl = (product.assets[gender] as any)[view] || product.assets[gender].front;

    const totalScale = studioScale * (zoom / 100);

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'stretch',
                gap: 0,
                height: isMobile ? 'auto' : '840px',
                minHeight: isMobile ? '100vh' : 'unset',
                backgroundColor: '#F7F8F9',
                borderRadius: isMobile ? 0 : 32,
                overflow: isMobile ? 'auto' : 'hidden',
                border: isMobile ? 'none' : '1px solid rgba(0,0,0,0.05)',
                boxShadow: isMobile ? 'none' : '0 20px 60px rgba(0,0,0,0.04)'
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;700;900&family=Caveat:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');
            `}} />

            {/* CANVAS AREA (LEFT) */}
            <Box
                style={{
                    flex: isMobile ? 'none' : 1,
                    height: isMobile ? '60vh' : 'auto',
                    position: 'relative',
                    backgroundColor: '#FFFFFF',
                    borderRight: isMobile ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    borderBottom: isMobile ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    minWidth: isMobile ? '100%' : 400,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box
                    ref={parentRef}
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        position: 'relative',
                        padding: 0
                    }}
                >
                    {isReady && (
                        <Box
                            style={{
                                width: '100%',
                                height: Math.max(isMobile ? 0 : 700, VCS_HEIGHT * totalScale + 120),
                                position: 'relative',
                                minHeight: '100%',
                                padding: '60px 0'
                            }}
                        >
                            <Box
                                style={{
                                    width: VCS_WIDTH,
                                    height: VCS_HEIGHT,
                                    position: 'absolute',
                                    top: 60,
                                    left: '50%',
                                    marginLeft: -(500 * totalScale),
                                    transform: `scale(${totalScale})`,
                                    transformOrigin: '0 0',
                                    pointerEvents: 'auto',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                    backgroundColor: '#fff',
                                }}
                            >
                                <Box style={{
                                    position: 'absolute', top: '25%', left: '26%', width: '48%', height: '54%',
                                    border: '1px dashed rgba(0,0,0,0.1)', pointerEvents: 'none', zIndex: 1
                                }} />

                                <img src={currentAssetUrl} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center' }} />
                                <Box style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    backgroundColor: color, maskImage: `url(${currentAssetUrl})`, maskSize: 'contain',
                                    maskRepeat: 'no-repeat', maskPosition: 'top center', WebkitMaskImage: `url(${currentAssetUrl})`,
                                    WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'top center',
                                    mixBlendMode: 'multiply', transition: 'background-color 0.5s ease', opacity: 0.9
                                }} />
                                <img src={currentAssetUrl} alt="Texture" style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    objectFit: 'contain', objectPosition: 'top center', mixBlendMode: 'multiply',
                                    filter: 'brightness(1.1) contrast(1.1)', opacity: 0.9, pointerEvents: 'none'
                                }} />

                                <Box ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)}>
                                    {elements.map((el) => (
                                        <Rnd
                                            key={el.id}
                                            scale={totalScale}
                                            size={{ width: el.width, height: el.height }}
                                            position={{ x: el.x, y: el.y }}
                                            onDragStart={() => setSelectedId(el.id)}
                                            onDragStop={(e, d) => updateElement(el.id, { x: Math.round(d.x), y: Math.round(d.y) })}
                                            onResizeStop={(e, dir, ref, delta, pos) => {
                                                const updates: Partial<DesignElement> = { width: Math.round(ref.offsetWidth), height: Math.round(ref.offsetHeight), x: Math.round(pos.x), y: Math.round(pos.y) };
                                                if (el.type === 'text' && el.fontSize && ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(dir)) {
                                                    updates.fontSize = Math.max(10, Math.min(150, Math.round(el.fontSize * (ref.offsetHeight / el.height))));
                                                }
                                                updateElement(el.id, updates);
                                            }}
                                            style={{ zIndex: el.zIndex }}
                                            resizeHandleStyles={{
                                                bottomRight: { width: 16, height: 16, background: '#228be6', border: '2px solid white', borderRadius: '50%', right: -8, bottom: -8, display: selectedId === el.id ? 'block' : 'none' },
                                                bottomLeft: { width: 16, height: 16, background: '#228be6', border: '2px solid white', borderRadius: '50%', left: -8, bottom: -8, display: selectedId === el.id ? 'block' : 'none' },
                                                topRight: { width: 16, height: 16, background: '#228be6', border: '2px solid white', borderRadius: '50%', right: -8, top: -8, display: selectedId === el.id ? 'block' : 'none' },
                                                topLeft: { width: 16, height: 16, background: '#228be6', border: '2px solid white', borderRadius: '50%', left: -8, top: -8, display: selectedId === el.id ? 'block' : 'none' },
                                            }}
                                            onMouseDownCapture={() => setSelectedId(el.id)}
                                            onTouchStartCapture={() => setSelectedId(el.id)}
                                        >
                                            <div style={{
                                                width: '100%', height: '100%', position: 'relative', rotate: `${el.rotation}deg`,
                                                transformOrigin: 'center center', border: selectedId === el.id ? '2px solid #228be6' : '1px solid transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: selectedId === el.id ? 'rgba(34, 139, 230, 0.05)' : 'transparent',
                                                borderRadius: '2px'
                                            }}>
                                                {selectedId === el.id && (
                                                    <ActionIcon color="red" variant="filled" size="sm" radius="xl" onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} style={{ position: 'absolute', top: -45, right: -15, zIndex: 2000, rotate: `-${el.rotation}deg` }}><IconTrash size={14} /></ActionIcon>
                                                )}
                                                {el.type === 'image' ? (
                                                    <img src={el.content} alt="Design" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                                                ) : (
                                                    <div style={{ color: el.color, fontSize: `${el.fontSize}px`, fontFamily: el.fontFamily, fontWeight: 'bold', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'pre-wrap', textAlign: 'center', lineHeight: 1.1, letterSpacing: `${el.letterSpacing}px`, pointerEvents: 'none' }}>{el.content}</div>
                                                )}
                                            </div>
                                        </Rnd>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Overlapping Controls */}
                <Box style={{ position: 'absolute', bottom: isMobile ? 12 : 24, zIndex: 200, width: '100%', pointerEvents: 'none' }}>
                    <Group justify="center" gap="xs">
                        <Paper shadow="sm" radius="xl" withBorder p={4} style={{ pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                            <Group gap={4}>
                                <Button variant={view === 'front' ? 'filled' : 'subtle'} color="#0B3022" size="compact-sm" onClick={() => setView('front')} radius="xl" fw={700}>FRONT</Button>
                                <Button variant={view === 'back' ? 'filled' : 'subtle'} color="#0B3022" size="compact-sm" onClick={() => setView('back')} radius="xl" fw={700}>BACK</Button>
                            </Group>
                        </Paper>
                        <Paper shadow="sm" radius="xl" withBorder p={4} style={{ pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                            <Group gap={8} p="0 12px">
                                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setZoom(Math.max(50, zoom - 10))}><IconMinus size={14} /></ActionIcon>
                                <Text size="xs" fw={700} w={30} ta="center">{zoom}%</Text>
                                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setZoom(Math.min(200, zoom + 10))}><IconPlus size={14} /></ActionIcon>
                            </Group>
                        </Paper>
                    </Group>
                </Box>
            </Box>

            {/* SIDEBAR */}
            <Box style={{ width: isMobile ? '100%' : 420, backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                <Box p="xl" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Title order={3} fw={900} style={{ fontFamily: 'Montserrat, sans-serif', color: '#0B3022' }}>Sincronización Joppa</Title>
                </Box>

                <Tabs value={activeTab} onChange={(v) => setActiveTab(v as TabType)} variant="unstyled">
                    <Tabs.List grow>
                        <Tabs.Tab value="product" style={{ flex: 1, padding: '16px', backgroundColor: activeTab === 'product' ? '#0B3022' : 'transparent', borderBottom: activeTab === 'product' ? '4px solid #D4AF37' : '1px solid #eee' }}>
                            <Stack gap={4} align="center"><IconShirt size={26} color={activeTab === 'product' ? 'white' : 'gray'} /><Text size="10px" fw={800} c={activeTab === 'product' ? 'white' : 'dimmed'}>PRENDA</Text></Stack>
                        </Tabs.Tab>
                        <Tabs.Tab value="text" style={{ flex: 1, padding: '16px', backgroundColor: activeTab === 'text' ? '#0B3022' : 'transparent', borderBottom: activeTab === 'text' ? '4px solid #D4AF37' : '1px solid #eee' }}>
                            <Stack gap={4} align="center"><IconTypography size={26} color={activeTab === 'text' ? 'white' : 'gray'} /><Text size="10px" fw={800} c={activeTab === 'text' ? 'white' : 'dimmed'}>TEXTO</Text></Stack>
                        </Tabs.Tab>
                        <Tabs.Tab value="image" style={{ flex: 1, padding: '16px', backgroundColor: activeTab === 'image' ? '#0B3022' : 'transparent', borderBottom: activeTab === 'image' ? '4px solid #D4AF37' : '1px solid #eee' }}>
                            <Stack gap={4} align="center"><IconPhoto size={26} color={activeTab === 'image' ? 'white' : 'gray'} /><Text size="10px" fw={800} c={activeTab === 'image' ? 'white' : 'dimmed'}>SUBIR</Text></Stack>
                        </Tabs.Tab>
                        <Tabs.Tab value="designs" style={{ flex: 1, padding: '16px', backgroundColor: activeTab === 'designs' ? '#0B3022' : 'transparent', borderBottom: activeTab === 'designs' ? '4px solid #D4AF37' : '1px solid #eee' }}>
                            <Stack gap={4} align="center"><IconBolt size={26} color={activeTab === 'designs' ? 'white' : 'gray'} /><Text size="10px" fw={800} c={activeTab === 'designs' ? 'white' : 'dimmed'}>DISEÑOS</Text></Stack>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Box p="xl" style={{ flex: 1, overflowY: 'auto', minHeight: isMobile ? 'unset' : 600 }}>
                        <Tabs.Panel value="product">
                            <Stack gap="lg">
                                <Select label="PRENDA" data={PRODUCTS.map(p => ({ label: p.name, value: p.id }))} value={product.id} onChange={(v) => setProduct(PRODUCTS.find(p => p.id === v) || PRODUCTS[0])} />
                                <Box><Text size="xs" fw={700} mb={8}>COLOR</Text><Group gap="xs">{GARMENT_COLORS.map(c => (<ActionIcon key={c.value} radius="xl" size={32} onClick={() => setColor(c.value)} style={{ backgroundColor: c.value, border: color === c.value ? '2px solid #0B3022' : '1px solid #eee' }} />))}</Group></Box>
                            </Stack>
                        </Tabs.Panel>
                        <Tabs.Panel value="text">
                            <Stack gap="lg">
                                <Button onClick={addText} leftSection={<IconPlus size={18} />} color="#0B3022" fullWidth>Añadir Texto</Button>
                                {selectedId && selectedElement?.type === 'text' && (
                                    <Stack gap="md" mt="xl" p="md" style={{ backgroundColor: '#F8F9FA', borderRadius: '12px' }}>
                                        <textarea value={selectedElement.content} onChange={(e) => updateElement(selectedId, { content: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <Select label="FUENTE" data={FONTS} value={selectedElement.fontFamily} onChange={(v) => updateElement(selectedId, { fontFamily: v || '' })} />
                                        <ColorInput label="COLOR" value={selectedElement.color} onChange={(v) => updateElement(selectedId, { color: v })} />
                                        <Box><Text size="xs" fw={700}>TAMAÑO ({selectedElement.fontSize})</Text><Slider value={selectedElement.fontSize} onChange={(v) => updateElement(selectedId, { fontSize: v })} min={10} max={120} label={null} /></Box>
                                    </Stack>
                                )}
                            </Stack>
                        </Tabs.Panel>
                        <Tabs.Panel value="image">
                            <Stack gap="lg">
                                <FileButton onChange={handleImageUpload} accept="image/*">{(p) => <Button {...p} variant="outline" color="#0B3022" leftSection={<IconUpload size={18} />}>Subir Imagen</Button>}</FileButton>
                                <SimpleGrid cols={3} spacing="xs">{uploadedImages.map((u, i) => (<Paper key={i} withBorder p={4} radius="md" onClick={() => addImage(u)} style={{ cursor: 'pointer', height: 80 }}><img src={u} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Paper>))}</SimpleGrid>
                            </Stack>
                        </Tabs.Panel>
                    </Box>
                </Tabs>
                <Box p="xl" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}><Text size="xs" fw={700} c="dimmed" ta="center">SISTEMA SINCRONIZADO CON EL CRM</Text></Box>
            </Box>
        </Box>
    );
};

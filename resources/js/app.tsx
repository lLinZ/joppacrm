import '@mantine/core/styles.css';
import '../css/app.css';
import './bootstrap';
import './echo';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Components/ThemeProvider';
import { MantineProvider } from '@mantine/core';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <MantineProvider defaultColorScheme="light">
                <ThemeProvider defaultTheme="system" storageKey="joppa-ui-theme">
                    <App {...props} />
                </ThemeProvider>
            </MantineProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

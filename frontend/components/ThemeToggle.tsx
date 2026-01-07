'use client';

import { ActionIcon, useMantineColorScheme, useComputedColorScheme, Group } from '@mantine/core';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Group justify="center">
                <ActionIcon
                    variant="default"
                    size="lg"
                    aria-label="Toggle color scheme"
                >
                    <Moon size={20} />
                </ActionIcon>
            </Group>
        );
    }

    return (
        <Group justify="center">
            <ActionIcon
                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
            >
                {computedColorScheme === 'dark' ? (
                    <Sun size={20} />
                ) : (
                    <Moon size={20} />
                )}
            </ActionIcon>
        </Group>
    );
}

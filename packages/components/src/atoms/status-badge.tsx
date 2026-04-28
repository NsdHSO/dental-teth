import {View} from 'react-native';
import {ThemedText} from '../themed-text';

export type StatusBadgeProps = {
    status: 'pending' | 'confirmed' | 'cancelled';
    testID?: string;
};

const STATUS_COLORS = {
    pending: {bg: '#FBBF24', text: '#000'},
    confirmed: {bg: '#10B981', text: '#FFF'},
    cancelled: {bg: '#EF4444', text: '#FFF'},
};

export function StatusBadge({status, testID}: StatusBadgeProps) {
    const color = STATUS_COLORS[status] ?? STATUS_COLORS.pending;

    return (
        <View
            testID={testID}
            style={{
                backgroundColor: color.bg,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
            }}
        >
            <ThemedText size="xs" weight="bold" style={{color: color.text}}>
                {status.toUpperCase()}
            </ThemedText>
        </View>
    );
}
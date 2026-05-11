import {View} from 'react-native';
import {ThemedText} from '../themed-text';
import {TimePicker} from '../molecules/appointment-form/TimePicker';

export type TimeFieldProps = {
    value: string;
    customTime: string;
    showCustomError: boolean;
    onPickSlot: (slot: string) => void;
    onCustomTimeChange: (raw: string) => void;
    onClearCustomTime: () => void;
    disabled?: boolean;
    testID?: string;
};

export function TimeField({
    value, customTime, showCustomError,
    onPickSlot, onCustomTimeChange, onClearCustomTime,
    disabled, testID,
}: TimeFieldProps) {
    return (
        <View testID={testID}>
            <TimePicker
                value={value}
                customTime={customTime}
                showCustomError={showCustomError}
                onPickSlot={onPickSlot}
                onCustomTimeChange={onCustomTimeChange}
                onClearCustomTime={onClearCustomTime}
                disabled={disabled}
                testID={testID}
            />
        </View>
    );
}
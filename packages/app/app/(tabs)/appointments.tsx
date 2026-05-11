import {SafeAreaView} from 'react-native-safe-area-context';
import {AppointmentsScreen as AppointmentsScreenComponent} from '@/components/AppointmentsScreen';

export default function AppointmentsPage() {
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{flex: 1}}>
            <AppointmentsScreenComponent />
        </SafeAreaView>
    );
}